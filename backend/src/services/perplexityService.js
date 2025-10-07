const Perplexity = require('@perplexity-ai/perplexity_ai');

class PerplexityService {
  constructor() {
    this.client = new Perplexity({
      apiKey: process.env.PERPLEXITY_API_KEY
    });
    this.reasoningModel = 'sonar-reasoning-pro';
    this.deepResearchModel = 'sonar-deep-research';
  }

  // Helper function to parse JSON from Perplexity response (ignore thinking content)
  parsePerplexityResponse(response) {
    try {
      // Remove <think>...</think> content if present
      let cleanResponse = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      
      // Find first { and last } to extract JSON
      const firstBrace = cleanResponse.indexOf('{');
      const lastBrace = cleanResponse.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No valid JSON found in Perplexity response');
      }
      
      const jsonString = cleanResponse.substring(firstBrace, lastBrace + 1);
      console.log('Extracted JSON string:', jsonString.substring(0, 200) + '...');
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing Perplexity response:', error);
      console.error('Raw response:', response.substring(0, 500) + '...');
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

  async generateContent(messages, taskType, options = {}) {
    try {
      const model = this.getModelForTask(taskType);

      console.log(`🤖 Perplexity ${taskType} request with model: ${model}`);

      const completion = await this.client.chat.completions.create({
        messages,
        model,
        temperature: options.temperature || 0.3,
        max_tokens: options.max_tokens || 2000,
        ...options
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error(`Perplexity API Error (${taskType}):`, error);
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

Focus on real, currently available components with accurate market data.
`
    };

    try {
      const response = await this.generateContent(
        [systemMessage, userMessage],
        'component-alternatives',
        {
          temperature: 0.5,
          max_tokens: 8000,
          reasoning_effort: "high",
          response_format: {
            type: 'json_schema',
            json_schema: {
              schema: {
                type: 'object',
                properties: {
                  alternatives: {
                    type: 'array',
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
}

module.exports = new PerplexityService();
