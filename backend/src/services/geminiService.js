const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.defaultModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.complexModel = process.env.GEMINI_MODEL_COMPLEX || 'gemini-1.5-pro';
  }

  getModelForTask(taskType) {
    const models = {
      'bom-extraction': this.defaultModel,
      'cad-analysis': this.complexModel,
      'zbc-calculation': this.complexModel,
      'zbc-extraction': this.defaultModel,
      'suggestions': this.defaultModel,
      'market-analysis': this.defaultModel
    };
    return models[taskType] || this.defaultModel;
  }

  async generateContent(prompt, taskType = 'default') {
    try {
      const modelName = this.getModelForTask(taskType);
      const model = this.ai.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      console.error(`Gemini API Error (${taskType}):`, error);
      throw new Error(`Failed to process ${taskType}: ${error.message}`);
    }
  }

  // Engineering Design Analysis - Generate ZBC
  async analyzeEngineeringDesign(fileBuffer, fileName, fileType) {
    const prompt = `
You are a cost engineering expert analyzing technical designs to generate Zero-Based Costing.

IMPORTANT: You are GENERATING new ZBC calculations, not extracting existing ones.

File: ${fileName} (${fileType})

Analyze this engineering document and calculate theoretical should-cost:

1. **Component Identification & Specs**
2. **Material Cost Calculation** 
3. **Manufacturing Process Analysis**
4. **Labor & Overhead Estimation**
5. **ZBC Confidence Level** (based on data completeness)

For each component identified, provide:
- Part Name/Description
- Quantity required
- Material specification (grade, properties)
- Dimensions and tolerances
- Manufacturing process requirements
- Surface finish specifications
- Assembly complexity

Calculate Zero-Based Cost factors:
- Raw material cost drivers
- Manufacturing process complexity (1-5 scale)
- Tooling requirements
- Labor intensity (hours)
- Quality/inspection needs

Return structured JSON:
{
  "analysisType": "GENERATED_ZBC",
  "documentInfo": {
    "fileName": "${fileName}",
    "type": "${fileType}",
    "analysisDate": "${new Date().toISOString()}"
  },
  "components": [
    {
      "partName": "string",
      "partNumber": "string (if available)",
      "quantity": number,
      "material": "string",
      "dimensions": "string",
      "process": "string",
      "complexity": number,
      "surfaceFinish": "string",
      "zbcFactors": {
        "materialCost": number,
        "processingCost": number,
        "laborHours": number,
        "toolingCost": number,
        "overheadRate": number,
        "totalZBC": number
      },
      "confidence": number
    }
  ],
  "overallAnalysis": {
    "totalComponents": number,
    "averageComplexity": number,
    "recommendedSupplierType": "string",
    "estimatedLeadTime": "string",
    "confidence": number,
    "assumptions": ["array of assumptions made"]
  }
}

Ensure all costs are in USD and provide realistic estimates based on current market conditions.
`;

    return await this.generateContent(prompt, 'cad-analysis');
  }

  // ZBC Report Extraction - Extract existing ZBC
  async extractZBCReport(fileBuffer, fileName, fileType) {
    const prompt = `
You are extracting existing Zero-Based Cost data from a professional cost analysis report.

IMPORTANT: You are EXTRACTING pre-calculated ZBC values, not generating new ones.

File: ${fileName} (${fileType})

Extract from this ZBC report:

1. **Pre-calculated Component Costs**
2. **Cost Breakdown Structure** 
3. **Methodology Used** (if mentioned)
4. **Analysis Date & Validity**
5. **Confidence/Accuracy Ratings**

Look for:
- Component listings with associated costs
- Material cost breakdowns
- Labor cost calculations
- Overhead allocations
- Total should-cost values
- Cost comparison data
- Supplier recommendations
- Risk assessments

Return structured JSON:
{
  "analysisType": "EXTRACTED_ZBC",
  "documentInfo": {
    "fileName": "${fileName}",
    "type": "${fileType}",
    "extractionDate": "${new Date().toISOString()}"
  },
  "components": [
    {
      "partName": "string",
      "partNumber": "string (if available)",
      "quantity": number,
      "material": "string",
      "extractedZBC": {
        "materialCost": number,
        "laborCost": number,
        "overheadCost": number,
        "totalZBC": number,
        "methodology": "string"
      },
      "reportData": {
        "analyst": "string (if available)",
        "analysisDate": "string (if available)",
        "confidence": number,
        "notes": "string"
      }
    }
  ],
  "reportMetadata": {
    "reportDate": "string (if available)",
    "analyst": "string (if available)", 
    "methodology": "string",
    "scope": "string",
    "assumptions": ["array"],
    "limitations": ["array"]
  }
}

Extract all numerical values accurately and preserve any methodology notes or assumptions.
`;

    return await this.generateContent(prompt, 'zbc-extraction');
  }

  // BoM File Processing
  async processBOMFile(fileBuffer, fileName, fileType) {
    const prompt = `
You are an expert procurement analyst for precision manufacturing. Analyze the uploaded BoM document.

File: ${fileName} (${fileType})

Extract comprehensive Bill of Materials data:

For each component identified, provide:
- Part Name/Description
- Part Number (if available)
- Quantity required
- Material specification
- Dimensions (if available)
- Manufacturing process hints
- Any compliance markings or certifications mentioned
- Supplier information (if present)

Format response as structured JSON:
{
  "documentInfo": {
    "fileName": "${fileName}",
    "type": "${fileType}",
    "processedDate": "${new Date().toISOString()}"
  },
  "components": [
    {
      "partName": "string",
      "partNumber": "string",
      "quantity": number,
      "material": "string",
      "dimensions": "string",
      "process": "string",
      "compliance": ["array of strings"],
      "supplier": "string (if available)",
      "notes": "string"
    }
  ],
  "summary": {
    "totalComponents": number,
    "documentType": "string",
    "confidence": number,
    "extractionNotes": ["array"]
  }
}

If the document contains tables, extract all relevant data. If it's an image, use OCR capabilities to read text and identify components.
`;

    return await this.generateContent(prompt, 'bom-extraction');
  }

  // Generate AI Suggestions and Alternatives
  async generateSuggestions(componentData) {
    const prompt = `
You are a procurement optimization expert. Given these component specifications, provide intelligent alternatives and suggestions.

Components: ${JSON.stringify(componentData, null, 2)}

Provide recommendations for:

1. **Material Alternatives**: Cost-effective substitutes maintaining performance
2. **Design Optimization**: Manufacturing process improvements
3. **Supplier Region Recommendations**: Optimal geographic regions
4. **Compliance & Risk Assessment**: Regulatory status and supply chain risks

For each component, analyze:
- Alternative materials with cost/performance trade-offs
- Manufacturing process optimizations
- Standard vs custom component opportunities
- Supply chain risk factors
- Compliance implications

Return structured response:
{
  "suggestions": [
    {
      "componentId": "string",
      "partName": "string",
      "alternatives": [
        {
          "type": "material|process|design|supplier",
          "suggestion": "string",
          "costImpact": "percentage or amount",
          "riskLevel": "low|medium|high",
          "reasoning": "string",
          "tradeoffs": ["array"]
        }
      ],
      "supplierRegions": [
        {
          "region": "string",
          "advantages": ["array"],
          "risks": ["array"],
          "estimatedCostSaving": "percentage",
          "leadTimeImpact": "string"
        }
      ],
      "compliance": {
        "status": "compliant|pending|non-compliant|unknown",
        "certifications": ["array"],
        "risks": ["array"],
        "recommendations": ["array"]
      },
      "riskAssessment": {
        "supplyChain": "low|medium|high",
        "singleSource": boolean,
        "materialVolatility": "low|medium|high",
        "geopolitical": "low|medium|high"
      }
    }
  ],
  "overallRecommendations": {
    "costOptimization": ["array"],
    "riskMitigation": ["array"],
    "complianceActions": ["array"]
  }
}
`;

    return await this.generateContent(prompt, 'suggestions');
  }

  // Market Price Prediction
  async predictMarketPrices(componentData) {
    const prompt = `
You are a market intelligence analyst for manufacturing components. Predict current market pricing.

Components: ${JSON.stringify(componentData, null, 2)}

For each component, consider:
- Historical pricing trends
- Supply/demand dynamics  
- Regional price variations
- Material cost fluctuations
- Manufacturing capacity constraints
- Current market conditions

Provide realistic price predictions:
{
  "priceAnalysis": [
    {
      "componentId": "string",
      "partName": "string",
      "priceRange": {
        "low": number,
        "high": number,
        "mostLikely": number,
        "currency": "USD"
      },
      "confidence": number,
      "marketFactors": ["array of factors affecting price"],
      "priceDrivers": ["array of key cost drivers"],
      "regionalVariation": {
        "asia": "percentage vs baseline",
        "europe": "percentage vs baseline", 
        "northAmerica": "percentage vs baseline"
      },
      "trends": {
        "direction": "increasing|decreasing|stable",
        "volatility": "low|medium|high",
        "outlook": "string"
      }
    }
  ],
  "marketSummary": {
    "overallTrend": "string",
    "keyRisks": ["array"],
    "opportunities": ["array"]
  }
}

Base predictions on realistic market data and current economic conditions.
`;

    return await this.generateContent(prompt, 'market-analysis');
  }
}

module.exports = new GeminiService();
