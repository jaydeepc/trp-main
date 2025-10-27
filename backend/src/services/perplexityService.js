const Perplexity = require('@perplexity-ai/perplexity_ai');

class PerplexityService {
  constructor() {
    this.client = new Perplexity({
      apiKey: process.env.PERPLEXITY_API_KEY,
      timeout: 120000, // 2 minutes timeout
      maxRetries: 2,
      httpAgent: {
        timeout: 120000,
        keepAlive: true
      }
    });
    this.reasoningModel = 'sonar-reasoning-pro';
    this.deepResearchModel = 'sonar-deep-research';
    
    // Timeout configurations for different task types (configurable via environment variables)
    this.timeoutConfig = {
      'component-alternatives': parseInt(process.env.PERPLEXITY_ALTERNATIVES_TIMEOUT) || 60000, // 1 minute
      'supplier-search': parseInt(process.env.PERPLEXITY_SUPPLIER_TIMEOUT) || 120000, // 2 minutes (longer for complex research)
      'default': parseInt(process.env.PERPLEXITY_DEFAULT_TIMEOUT) || 60000
    };
  }

  // Helper function to parse JSON from Perplexity response (ignore thinking content)
  parsePerplexityResponse(response) {
    try {
      console.log('Raw Perplexity response length:', response.length);
      console.log('Raw response preview:', response.substring(0, 300) + '...');
      
      // Remove <think>...</think> content if present
      let cleanResponse = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      
      // Remove any markdown code blocks
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find first { and last } to extract JSON
      const firstBrace = cleanResponse.indexOf('{');
      const lastBrace = cleanResponse.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        console.error('No braces found in response:', cleanResponse);
        throw new Error('No valid JSON found in Perplexity response');
      }
      
      const jsonString = cleanResponse.substring(firstBrace, lastBrace + 1);
      console.log('Extracted JSON string length:', jsonString.length);
      console.log('JSON preview:', jsonString.substring(0, 300) + '...');
      
      // Try to parse the JSON
      const parsed = JSON.parse(jsonString);
      console.log('Successfully parsed JSON with keys:', Object.keys(parsed));
      
      return parsed;
    } catch (error) {
      console.error('Error parsing Perplexity response:', error);
      console.error('Full raw response:', response);
      throw new Error(`Failed to parse Perplexity JSON response: ${error.message}`);
    }
  }

  getModelForTask(taskType) {
    const models = {
      'component-alternatives': this.reasoningModel,
      'supplier-search': this.deepResearchModel,
    };
    return models[taskType];
  }

  // Timeout wrapper function
  async withTimeout(promise, timeoutMs, taskType) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${taskType} request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  async generateContent(messages, taskType, options = {}) {
    const startTime = Date.now();
    const timeout = this.timeoutConfig[taskType] || this.timeoutConfig.default;
    
    try {
      const model = this.getModelForTask(taskType);

      console.log(`🤖 Perplexity ${taskType} request with model: ${model} (timeout: ${timeout}ms)`);

      const apiCall = this.client.chat.completions.create({
        messages,
        model,
        temperature: options.temperature || 0.3,
        max_tokens: options.max_tokens || 2000,
        ...options
      });

      // Wrap the API call with timeout
      const completion = await this.withTimeout(apiCall, timeout, taskType);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Perplexity ${taskType} completed in ${duration}ms`);

      return completion.choices[0].message.content;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Perplexity API Error (${taskType}) after ${duration}ms:`, error);
      
      // Enhanced error handling for different error types
      if (error.message.includes('timed out')) {
        throw new Error(`${taskType} request timed out after ${timeout}ms. The API may be experiencing high load.`);
      } else if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
        throw new Error(`Network connection error for ${taskType}: ${error.message}`);
      } else if (error.status === 429) {
        throw new Error(`Rate limit exceeded for ${taskType}. Please try again later.`);
      } else if (error.status >= 500) {
        throw new Error(`Perplexity server error for ${taskType}: ${error.message}`);
      }
      
      throw new Error(`Failed to process ${taskType}: ${error.message}`);
    }
  }

  async findComponentAlternatives(component, requirements) {
    const systemMessage = {
      role: 'system',
      content: `You are a procurement specialist helping find component alternatives for procurement teams. 
      Focus on finding functionally equivalent components with better cost, availability, or performance characteristics.
      Always provide real, verifiable alternatives with accurate specifications and market data.`
    };

    const userMessage = {
      role: 'user',
      content: `
Find component alternatives for this procurement request:

**Product Information:**
- Name: Drone

**Original Component:**
- Part Number: ${component.partNumber || 'N/A'}
- Name: ${component.name}
- Description: ${component.description || 'N/A'}
- Specifications: ${component.specifications || 'N/A'}
- Quantity: ${component.quantity || 1}

**Requirements Context:**
- Sourcing Location: ${requirements.sourcingLocation || 'Anywhere in the world'}
- Desired Lead Time: ${requirements.desiredLeadTime || 'Standard'}
- Compliance Requirements: ${requirements.complianceRequirements?.join(', ') || 'None specified'}
- Supplier Priority: ${requirements.supplierPriority?.join(', ') || 'Cost-effective'}

**Find alternative components that:**
1. Meet the same functional requirements
2. Offer better value proposition based on Supplier Priority mentioned
3. Are available from reliable suppliers
4. Comply with specified requirements

**IMPORTANT: Provide exactly 2 alternatives maximum. Focus on the best 2 options only.**

Focus on real, currently available components with accurate market data.
`
    };

    try {
      const response = await this.generateContent(
        [systemMessage, userMessage],
        'component-alternatives',
        {
          temperature: 0.5,
          max_tokens: 6000,
          reasoning_effort: "medium",
          response_format: {
            type: 'json_schema',
            json_schema: {
              schema: {
                type: 'object',
                properties: {
                  alternatives: {
                    type: 'array',
                    maxItems: 2,
                    items: {
                      type: 'object',
                      properties: {
                        partNumber: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        specifications: { type: 'string' },
                        costRange: { type: 'string' },
                        keyAdvantages: {
                          type: 'array',
                          items: { type: 'string' }
                        },
                        potentialDrawbacks: {
                          type: 'array',
                          items: { type: 'string' }
                        }
                      },
                      required: ['name', 'description', 'specifications', 'costRange', 'keyAdvantages', 'potentialDrawbacks']
                    }
                  },
                },
                required: ['alternatives']
              }
            }
          }
        }
      );

      console.log('Perplexity alternatives response:', response);

      return this.parsePerplexityResponse(response);
    } catch (error) {
      console.error('Error finding component alternatives:', error);
      throw error;
    }
  }

  async findComponentSuppliers(component, requirements) {
    const systemMessage = {
      role: 'system',
      content: `You are the Robbie Supplier Research (RSR) Agent responsible for intensive supplier research based on Bill of Materials (BOM). Your mission is to transform a standard BOM into an actionable "Smart BOM" by identifying, vetting, and classifying global alternative suppliers for each component.`
    };

    const userMessage = {
      role: 'user',
      content: `
**MISSION: SUPPLIER RESEARCH FOR COMPONENT**

**Component Details:**
- Part Number: ${component.partNumber || 'N/A'}
- Name: ${component.name}
- Description: ${component.description || 'N/A'}
- Specifications: ${component.specifications || 'N/A'}
- Quantity: ${component.quantity || 1}

**Requirements Context:**
- Sourcing Location: ${requirements.sourcingLocation || 'Anywhere in the world'}
- Desired Lead Time: ${requirements.desiredLeadTime || 'Standard'}
- Compliance Requirements: ${requirements.complianceRequirements?.join(', ') || 'None specified'}
- Supplier Priority: ${requirements.supplierPriority?.join(', ') || 'Cost-effective'}

**STAGE 1: BASELINE ANALYSIS**
Establish baseline using reliable websites (Robu.in, Electronicscomp.com, etc.):
- primaryCategory
- manufacturer
- keySpecifications
- baselinePriceINR
- sourceURL (real, verifiable URL or null)
- productPageURL (real, verifiable URL or null)

**STAGE 2: GLOBAL DEEP SEARCH**
Search for alternative suppliers in: India, China, South Korea, Taiwan, Hong Kong, UK, Vietnam, Japan, Germany, Italy.
Prioritize India-based OEMs. For drone components, focus on specialized suppliers.

**STAGE 3: CLASSIFICATION & FINANCIAL ANALYSIS**
Classify each supplier into one of these 10 categories:
1. Better Quality but similar price
2. Better Quality but lower price
3. Better Quality but higher price
4. Better Quality, higher price and higher reliability
5. Better Quality, lower price and more established company
6. Better Quality, higher price and a more established company
7. Better Quality, lower price and better support
8. Better Quality, higher price and better support
9. Better Quality, lower price and better returns and warranty support
10. Better Quality, higher price and better returns and warranty support

Calculate landed cost including shipping and customs duties.

**IMPORTANT:** Only provide real, verifiable URLs. If no real URL exists, use null.
`
    };

    try {
      const response = await this.generateContent(
        [systemMessage, userMessage],
        'supplier-search',
        {
          temperature: 0.3,
          max_tokens: 8000,
          reasoning_effort: "medium",
          response_format: {
            type: 'json_schema',
            json_schema: {
              schema: {
                type: 'object',
                properties: {
                  baselineAnalysis: {
                    type: 'object',
                    properties: {
                      primaryCategory: { type: 'string' },
                      manufacturer: { type: 'string' },
                      keySpecifications: { type: 'string' },
                      baselinePriceINR: { type: 'number' },
                      sourceURL: { type: ['string', 'null'] },
                      productPageURL: { type: ['string', 'null'] }
                    },
                    required: ['primaryCategory', 'manufacturer', 'keySpecifications', 'baselinePriceINR']
                  },
                  alternativeSuppliers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        supplierName: { type: 'string' },
                        country: { type: 'string' },
                        classification: { type: 'integer', minimum: 1, maximum: 10 },
                        classificationDescription: { type: 'string' },
                        supplierURL: { type: ['string', 'null'] },
                        productPageURL: { type: ['string', 'null'] },
                        landedCostINR: {
                          type: 'object',
                          properties: {
                            localCurrencyPrice: { type: 'number' },
                            localCurrency: { type: 'string' },
                            exchangeRateUsed: { type: 'number' },
                            estimatedShippingINR: { type: 'number' },
                            estimatedCustomsINR: { type: 'number' },
                            totalLandedCostINR: { type: 'number' }
                          },
                          required: ['localCurrencyPrice', 'localCurrency', 'exchangeRateUsed', 'estimatedShippingINR', 'estimatedCustomsINR', 'totalLandedCostINR']
                        },
                        keyAdvantages: {
                          type: 'array',
                          items: { type: 'string' }
                        },
                        reliability: { type: 'string' },
                        leadTime: { type: 'string' }
                      },
                      required: ['supplierName', 'country', 'classification', 'classificationDescription', 'landedCostINR', 'keyAdvantages', 'reliability', 'leadTime']
                    }
                  }
                },
                required: ['baselineAnalysis', 'alternativeSuppliers']
              }
            }
          }
        }
      );

      console.log('Perplexity supplier research response:', response);

      return this.parsePerplexityResponse(response);
    } catch (error) {
      console.error('Error finding component suppliers:', error);
      throw error;
    }
  }
}

module.exports = new PerplexityService();
