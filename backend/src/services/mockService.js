class MockService {
  constructor() {
    this.mockDelay = parseInt(process.env.MOCK_DELAY_MS) || 1500;
  }

  // Simulate API delay for realistic experience
  async delay() {
    return new Promise(resolve => setTimeout(resolve, this.mockDelay));
  }

  // Mock Engineering Design Analysis (Generated ZBC)
  async analyzeEngineeringDesign(fileName, fileType) {
    await this.delay();
    
    return JSON.stringify({
      "analysisType": "GENERATED_ZBC",
      "documentInfo": {
        "fileName": fileName,
        "type": fileType,
        "analysisDate": new Date().toISOString()
      },
      "components": [
        {
          "partName": "Aluminum Mounting Bracket",
          "partNumber": "BR-001-AL",
          "quantity": 10,
          "material": "Aluminum 6061-T6",
          "dimensions": "150mm x 75mm x 12mm",
          "process": "CNC Machining + Anodizing",
          "complexity": 3,
          "surfaceFinish": "Clear Anodized",
          "zbcFactors": {
            "materialCost": 8.50,
            "processingCost": 45.20,
            "laborHours": 0.75,
            "toolingCost": 12.30,
            "overheadRate": 25.00,
            "totalZBC": 109.04
          },
          "confidence": 85
        },
        {
          "partName": "Stainless Steel Fastener",
          "partNumber": "FS-M6-SS",
          "quantity": 40,
          "material": "Stainless Steel 316L",
          "dimensions": "M6 x 25mm",
          "process": "Cold Forming + Passivation",
          "complexity": 2,
          "surfaceFinish": "Passivated",
          "zbcFactors": {
            "materialCost": 0.85,
            "processingCost": 1.20,
            "laborHours": 0.05,
            "toolingCost": 0.15,
            "overheadRate": 0.80,
            "totalZBC": 3.25
          },
          "confidence": 92
        },
        {
          "partName": "Rubber Gasket",
          "partNumber": "GS-NBR-001",
          "quantity": 10,
          "material": "NBR (Nitrile) 70 Shore A",
          "dimensions": "Ø80mm x 3mm thickness",
          "process": "Compression Molding",
          "complexity": 2,
          "surfaceFinish": "Smooth",
          "zbcFactors": {
            "materialCost": 2.10,
            "processingCost": 8.50,
            "laborHours": 0.15,
            "toolingCost": 15.00,
            "overheadRate": 5.20,
            "totalZBC": 18.75
          },
          "confidence": 78
        }
      ],
      "overallAnalysis": {
        "totalComponents": 3,
        "averageComplexity": 2.3,
        "recommendedSupplierType": "Tier 2 Precision Machining",
        "estimatedLeadTime": "4-6 weeks",
        "confidence": 85,
        "assumptions": [
          "Standard tolerances assumed (±0.1mm)",
          "Medium volume production (100-1000 units)",
          "Current material prices as of Q4 2024",
          "Standard surface finish requirements"
        ]
      }
    });
  }

  // Mock ZBC Report Extraction (Extracted ZBC)
  async extractZBCReport(fileName, fileType) {
    await this.delay();
    
    return JSON.stringify({
      "analysisType": "EXTRACTED_ZBC",
      "documentInfo": {
        "fileName": fileName,
        "type": fileType,
        "extractionDate": new Date().toISOString()
      },
      "components": [
        {
          "partName": "Precision Bearing Housing",
          "partNumber": "BH-2024-001",
          "quantity": 5,
          "material": "Cast Iron GG25",
          "extractedZBC": {
            "materialCost": 45.80,
            "laborCost": 125.50,
            "overheadCost": 67.20,
            "totalZBC": 238.50,
            "methodology": "Activity-Based Costing"
          },
          "reportData": {
            "analyst": "Sarah Chen, Cost Engineer",
            "analysisDate": "2024-11-15",
            "confidence": 94,
            "notes": "Based on supplier quotes and historical data"
          }
        },
        {
          "partName": "Titanium Shaft",
          "partNumber": "SH-TI-001",
          "quantity": 2,
          "material": "Titanium Grade 5 (Ti-6Al-4V)",
          "extractedZBC": {
            "materialCost": 180.00,
            "laborCost": 320.00,
            "overheadCost": 145.00,
            "totalZBC": 645.00,
            "methodology": "Zero-Based Costing with Market Validation"
          },
          "reportData": {
            "analyst": "Michael Rodriguez, Senior Cost Analyst",
            "analysisDate": "2024-11-20",
            "confidence": 89,
            "notes": "High-precision machining requirements included"
          }
        }
      ],
      "reportMetadata": {
        "reportDate": "2024-11-25",
        "analyst": "Cost Engineering Team - Precision Manufacturing Division",
        "methodology": "Hybrid ZBC with Activity-Based Costing",
        "scope": "Complete assembly cost breakdown with supplier validation",
        "assumptions": [
          "Current titanium market prices",
          "Standard lead times (8-12 weeks)",
          "Quality requirements per AS9100 standards"
        ],
        "limitations": [
          "Market volatility not fully accounted",
          "Single supplier quotes for specialized materials"
        ]
      }
    });
  }

  // Mock BoM File Processing
  async processBOMFile(fileName, fileType) {
    await this.delay();
    
    return JSON.stringify({
      "documentInfo": {
        "fileName": fileName,
        "type": fileType,
        "processedDate": new Date().toISOString()
      },
      "components": [
        {
          "partName": "Main Housing Assembly",
          "partNumber": "MHA-001",
          "quantity": 1,
          "material": "Aluminum 7075-T6",
          "dimensions": "200mm x 150mm x 80mm",
          "process": "CNC Machining",
          "compliance": ["RoHS", "REACH"],
          "supplier": "Precision Parts Ltd.",
          "notes": "Critical dimension: ±0.05mm tolerance"
        },
        {
          "partName": "O-Ring Seal",
          "partNumber": "OR-125-VITON",
          "quantity": 8,
          "material": "Viton FKM",
          "dimensions": "125mm ID x 3mm CS",
          "process": "Molded",
          "compliance": ["FDA", "USP Class VI"],
          "supplier": "Sealing Solutions Inc.",
          "notes": "High temperature application"
        },
        {
          "partName": "Hex Socket Cap Screw",
          "partNumber": "HSCS-M8-40",
          "quantity": 12,
          "material": "Stainless Steel 316",
          "dimensions": "M8 x 40mm",
          "process": "Cold Formed",
          "compliance": ["RoHS"],
          "supplier": "Standard Fasteners Co.",
          "notes": "Torque specification: 25 Nm"
        }
      ],
      "summary": {
        "totalComponents": 3,
        "documentType": "Excel BoM",
        "confidence": 95,
        "extractionNotes": [
          "All part numbers successfully extracted",
          "Material specifications clearly defined",
          "Supplier information available for all items"
        ]
      }
    });
  }

  // Mock AI Suggestions Generation
  async generateSuggestions(componentData) {
    await this.delay();
    
    return JSON.stringify({
      "suggestions": [
        {
          "componentId": "comp-001",
          "partName": "Aluminum Mounting Bracket",
          "alternatives": [
            {
              "type": "material",
              "suggestion": "Switch from 6061-T6 to 6063-T5 aluminum",
              "costImpact": "-15%",
              "riskLevel": "low",
              "reasoning": "6063 offers similar strength with better extrudability and lower cost",
              "tradeoffs": ["Slightly lower tensile strength", "Better corrosion resistance"]
            },
            {
              "type": "process",
              "suggestion": "Consider investment casting instead of machining",
              "costImpact": "-25%",
              "riskLevel": "medium",
              "reasoning": "For quantities >500 units, casting becomes more economical",
              "tradeoffs": ["Higher tooling cost", "Longer lead time", "Better material utilization"]
            }
          ],
          "supplierRegions": [
            {
              "region": "India - Gujarat",
              "advantages": ["Lower labor costs", "Established aluminum industry", "Good quality standards"],
              "risks": ["Longer shipping times", "Currency fluctuation"],
              "estimatedCostSaving": "30-40%",
              "leadTimeImpact": "+2-3 weeks"
            },
            {
              "region": "Mexico - Bajío",
              "advantages": ["USMCA benefits", "Shorter lead times", "Growing manufacturing base"],
              "risks": ["Limited specialized suppliers", "Infrastructure constraints"],
              "estimatedCostSaving": "20-25%",
              "leadTimeImpact": "+1 week"
            }
          ],
          "compliance": {
            "status": "compliant",
            "certifications": ["RoHS", "REACH"],
            "risks": ["None identified"],
            "recommendations": ["Maintain current compliance documentation"]
          },
          "riskAssessment": {
            "supplyChain": "low",
            "singleSource": false,
            "materialVolatility": "medium",
            "geopolitical": "low"
          }
        }
      ],
      "overallRecommendations": {
        "costOptimization": [
          "Consider material grade optimization for 15-20% savings",
          "Evaluate regional sourcing for 25-35% cost reduction",
          "Implement design for manufacturing principles"
        ],
        "riskMitigation": [
          "Develop dual-source strategy for critical components",
          "Monitor aluminum market trends for procurement timing",
          "Establish quality agreements with new suppliers"
        ],
        "complianceActions": [
          "Verify supplier certifications quarterly",
          "Maintain traceability documentation",
          "Monitor regulatory changes in target markets"
        ]
      }
    });
  }

  // Mock Market Price Prediction
  async predictMarketPrices(componentData) {
    await this.delay();
    
    return JSON.stringify({
      "priceAnalysis": [
        {
          "componentId": "comp-001",
          "partName": "Aluminum Mounting Bracket",
          "priceRange": {
            "low": 200,
            "high": 280,
            "mostLikely": 240,
            "currency": "USD"
          },
          "confidence": 82,
          "marketFactors": [
            "Aluminum commodity price volatility",
            "Energy costs affecting processing",
            "Regional manufacturing capacity",
            "Transportation costs"
          ],
          "priceDrivers": [
            "Raw material cost (35%)",
            "Machining time (40%)",
            "Setup and tooling (15%)",
            "Overhead and margin (10%)"
          ],
          "regionalVariation": {
            "asia": "-30% vs baseline",
            "europe": "+15% vs baseline",
            "northAmerica": "baseline"
          },
          "trends": {
            "direction": "increasing",
            "volatility": "medium",
            "outlook": "Prices expected to stabilize in Q2 2025"
          }
        }
      ],
      "marketSummary": {
        "overallTrend": "Moderate price increases due to energy costs and supply chain normalization",
        "keyRisks": [
          "Aluminum commodity price volatility",
          "Energy cost fluctuations",
          "Geopolitical supply chain disruptions"
        ],
        "opportunities": [
          "Regional sourcing optimization",
          "Long-term supplier partnerships",
          "Alternative material evaluation"
        ]
      }
    });
  }

  // Mock comprehensive document processing (main entry point)
  async processDocument(fileName, fileType, analysisType = 'auto') {
    // Determine analysis type based on file name or explicit type
    let actualAnalysisType = analysisType;
    
    if (analysisType === 'auto') {
      if (fileName.toLowerCase().includes('zbc') || fileName.toLowerCase().includes('cost')) {
        actualAnalysisType = 'zbc-extraction';
      } else if (fileName.toLowerCase().includes('bom') || fileType === 'xlsx' || fileType === 'csv') {
        actualAnalysisType = 'bom-processing';
      } else {
        actualAnalysisType = 'engineering-design';
      }
    }

    let analysisResult;
    switch (actualAnalysisType) {
      case 'zbc-extraction':
        analysisResult = await this.extractZBCReport(fileName, fileType);
        break;
      case 'bom-processing':
        analysisResult = await this.processBOMFile(fileName, fileType);
        break;
      case 'engineering-design':
      default:
        analysisResult = await this.analyzeEngineeringDesign(fileName, fileType);
        break;
    }

    const parsedResult = JSON.parse(analysisResult);
    
    // Generate additional insights
    const suggestions = await this.generateSuggestions(parsedResult.components || []);
    const marketPrices = await this.predictMarketPrices(parsedResult.components || []);

    return {
      analysis: parsedResult,
      suggestions: JSON.parse(suggestions),
      marketPrices: JSON.parse(marketPrices),
      processingTime: this.mockDelay,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new MockService();
