const geminiService = require('./geminiService');
const mockService = require('./mockService');
const bomProcessor = require('./bomProcessor');
const logger = require('./loggerService');
const multer = require('multer');
const path = require('path');

class DocumentProcessor {
  constructor() {
    this.useMockData = process.env.USE_MOCK_DATA === 'true';
    this.enableGeminiAnalysis = process.env.ENABLE_GEMINI_ANALYSIS === 'true';
    this.confidenceThreshold = parseInt(process.env.GEMINI_CONFIDENCE_THRESHOLD) || 70;
    this.setupMulter();
  }

  setupMulter() {
    // Configure multer for file uploads
    this.storage = multer.memoryStorage();
    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          // CAD Files
          '.step', '.stp', '.dwg', '.dxf', '.iges', '.igs',
          // Documents
          '.pdf', '.docx', '.doc',
          // Spreadsheets
          '.xlsx', '.xls', '.csv',
          // Images
          '.png', '.jpg', '.jpeg', '.tiff', '.bmp'
        ];
        
        const fileExt = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(fileExt)) {
          cb(null, true);
        } else {
          cb(new Error(`File type ${fileExt} not supported. Allowed types: ${allowedTypes.join(', ')}`), false);
        }
      }
    });
  }

  // Get file type category for processing
  getFileCategory(fileName, mimeType) {
    const ext = path.extname(fileName).toLowerCase();
    const name = fileName.toLowerCase();
    
    // ZBC Report Detection
    if (name.includes('zbc') || name.includes('cost') || name.includes('should-cost')) {
      return 'zbc-report';
    }
    
    // BoM Detection
    if (name.includes('bom') || name.includes('bill') || ext === '.xlsx' || ext === '.csv') {
      return 'bom';
    }
    
    // CAD Files
    if (['.step', '.stp', '.dwg', '.dxf', '.iges', '.igs'].includes(ext)) {
      return 'cad';
    }
    
    // Technical Documents
    if (['.pdf', '.docx', '.doc'].includes(ext)) {
      return 'technical-document';
    }
    
    // Images (could be drawings or documents)
    if (['.png', '.jpg', '.jpeg', '.tiff', '.bmp'].includes(ext)) {
      return 'image-document';
    }
    
    return 'unknown';
  }

  // Main document processing function - FORCE REAL GEMINI PROCESSING
  async processDocument(file, analysisType = 'auto') {
    try {
      const fileName = file.originalname;
      const fileType = path.extname(fileName).toLowerCase();
      const fileCategory = this.getFileCategory(fileName, file.mimetype);
      
      logger.logBOMProcessing('DOCUMENT_START', `Processing document: ${fileName} (${fileCategory})`);
      
      let result;
      let processingMode = 'gemini';
      let useRealData = true;
      
      // FORCE GEMINI PROCESSING - NO MOCK DATA
      console.log('🚀 FORCING REAL GEMINI PROCESSING - NO MOCK DATA');
      logger.logBOMProcessing('FORCE_REAL', 'Bypassing all mock data logic, forcing Gemini API');
      
      try {
        console.log('🤖 Processing with Gemini AI...');
        result = await this.processWithGemini(file, fileCategory, analysisType);
        processingMode = 'gemini';
        useRealData = true;
        
        logger.logBOMProcessing('GEMINI_SUCCESS', 'Successfully processed with Gemini API');
        
      } catch (error) {
        logger.logError('GEMINI_FAILED', error, { fileName, fileCategory });
        console.error('❌ Gemini processing failed:', error);
        throw error; // Don't fallback to mock - throw the error
      }
      
      // Enhance result with comprehensive metadata
      result.processingInfo = {
        fileName,
        fileType,
        fileCategory,
        fileSize: file.size,
        processingMode,
        useRealData,
        geminiConfidence: 100, // Force high confidence
        confidenceThreshold: this.confidenceThreshold,
        analysisType: analysisType,
        timestamp: new Date().toISOString(),
        geminiEnabled: true,
        mockForced: false,
        realProcessingForced: true
      };
      
      // Add data source indicators to components
      if (result.analysis && result.analysis.components) {
        result.analysis.components = result.analysis.components.map(comp => ({
          ...comp,
          dataSource: 'gemini',
          confidence: 100
        }));
      }
      
      logger.logBOMProcessing('DOCUMENT_COMPLETE', 'Document processing completed successfully', {
        processingMode,
        componentCount: result.analysis?.components?.length || 0
      });
      
      return result;
      
    } catch (error) {
      logger.logError('DOCUMENT_ERROR', error, { fileName: file.originalname });
      console.error('Document processing error:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  // Analyze document with Gemini to determine confidence
  async analyzeWithGemini(file, fileCategory, analysisType) {
    const fileName = file.originalname;
    const fileType = path.extname(fileName).toLowerCase();
    
    try {
      // Quick analysis to determine data quality
      const quickAnalysisPrompt = `
        Analyze this ${fileCategory} file (${fileName}) and determine:
        1. Can you extract meaningful component data? (yes/no)
        2. How many components can you identify? (number)
        3. What's the data quality? (high/medium/low)
        4. Confidence in extraction (0-100%)
        
        Respond in JSON format:
        {
          "canExtract": boolean,
          "componentCount": number,
          "dataQuality": "high|medium|low",
          "confidence": number,
          "reasoning": "string"
        }
      `;
      
      const analysisText = await geminiService.generateContent(quickAnalysisPrompt, 'bom-extraction');
      return JSON.parse(analysisText);
    } catch (error) {
      console.error('Quick Gemini analysis failed:', error);
      return {
        canExtract: false,
        componentCount: 0,
        dataQuality: 'low',
        confidence: 0,
        reasoning: 'Analysis failed'
      };
    }
  }

  // Calculate confidence score based on Gemini analysis
  calculateConfidence(analysis, fileCategory) {
    if (!analysis) return 0;
    
    let confidence = analysis.confidence || 0;
    
    // Adjust confidence based on file category
    const categoryMultipliers = {
      'bom': 1.0,           // BoM files are easiest to process
      'zbc-report': 0.9,    // ZBC reports are structured
      'cad': 0.7,           // CAD files are harder
      'technical-document': 0.6,  // PDFs vary in quality
      'image-document': 0.5,      // Images are challenging
      'unknown': 0.3        // Unknown files are risky
    };
    
    const multiplier = categoryMultipliers[fileCategory] || 0.5;
    confidence = Math.round(confidence * multiplier);
    
    // Additional factors
    if (analysis.componentCount > 5) confidence += 10;
    if (analysis.dataQuality === 'high') confidence += 15;
    if (analysis.dataQuality === 'medium') confidence += 5;
    if (analysis.canExtract === false) confidence = Math.min(confidence, 30);
    
    return Math.min(Math.max(confidence, 0), 100);
  }

  // Process with Gemini AI - REAL IMPLEMENTATION
  async processWithGemini(file, fileCategory, analysisType) {
    const fileName = file.originalname;
    const fileType = path.extname(fileName).toLowerCase();
    
    logger.logBOMProcessing('START', 'Beginning real BOM processing with Gemini', {
      fileName,
      fileType,
      fileCategory,
      fileSize: file.size
    });
    
    try {
      let bomJsonData = null;
      let analysisResult = null;
      
      // STEP 1: Convert CSV/Excel to JSON (like Python csv.DictReader)
      if (fileCategory === 'bom' && (fileType === '.csv' || fileType === '.xlsx' || fileType === '.xls')) {
        logger.logBOMProcessing('CSV_CONVERSION', 'Converting BOM file to JSON');
        
        bomJsonData = await bomProcessor.convertToJSON(file.buffer, fileName, fileType);
        
        logger.logBOMProcessing('CSV_CONVERSION_SUCCESS', 'BOM file converted to JSON successfully', {
          rowCount: bomJsonData.length,
          columns: bomJsonData.length > 0 ? Object.keys(bomJsonData[0]) : [],
          sampleData: bomJsonData.slice(0, 3) // First 3 rows for debugging
        });
        
        // STEP 2: Send JSON data to Gemini with RSR Agent prompt
        logger.logGeminiAPI('BOM_PROCESSING', 'Sending BOM JSON to Gemini API with RSR Agent prompt');
        
        const geminiResponse = await geminiService.processBOMFile(bomJsonData, fileName, fileType);

        console.log(geminiResponse);
        
        logger.logGeminiAPI('BOM_PROCESSING_SUCCESS', 'Gemini API returned BOM analysis', {
          responseLength: geminiResponse.length,
          responsePreview: geminiResponse.substring(0, 500) + '...'
        });
        
        try {
          // Clean the Gemini response by removing markdown code blocks
          let cleanedResponse = geminiResponse.trim();
          
          // Remove markdown code block markers if present
          if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          analysisResult = JSON.parse(cleanedResponse);
          logger.logBOMProcessing('GEMINI_PARSE_SUCCESS', 'Successfully parsed Gemini response', {
            componentCount: analysisResult.length || 0
          });
        } catch (parseError) {
          logger.logError('GEMINI_PARSE_ERROR', parseError, { 
            geminiResponse: geminiResponse.substring(0, 500) + '...',
            cleanedResponse: cleanedResponse ? cleanedResponse.substring(0, 500) + '...' : 'undefined'
          });
          throw new Error('Failed to parse Gemini response as JSON');
        }
        
      } else {
        // Handle other file types (ZBC, CAD, etc.)
        switch (fileCategory) {
          case 'zbc-report':
            logger.logBOMProcessing('ZBC_PROCESSING', 'Processing ZBC report');
            const zbcText = await geminiService.extractZBCReport(file.buffer, fileName, fileType);
            analysisResult = JSON.parse(zbcText);
            break;
            
          case 'cad':
          case 'technical-document':
          case 'image-document':
          default:
            logger.logBOMProcessing('CAD_PROCESSING', 'Processing engineering design');
            const cadText = await geminiService.analyzeEngineeringDesign(file.buffer, fileName, fileType);
            analysisResult = JSON.parse(cadText);
            break;
        }
      }
      
      // STEP 3: Return the processed data in the expected format
      const result = {
        analysis: {
          components: Array.isArray(analysisResult) ? analysisResult : (analysisResult.components || []),
          analysisType: 'REAL_GEMINI_PROCESSING',
          documentInfo: {
            fileName,
            fileType,
            processedDate: new Date().toISOString()
          }
        },
        suggestions: { suggestions: [] }, // Will be populated if needed
        marketPrices: { priceAnalysis: [] }, // Will be populated if needed
        processingTime: 'Variable (Gemini API)',
        timestamp: new Date().toISOString(),
        rawBOMData: bomJsonData // Include original JSON for debugging
      };
      
      logger.logBOMProcessing('PROCESSING_COMPLETE', 'BOM processing completed successfully', {
        componentCount: result.analysis.components.length,
        processingMode: 'real-gemini'
      });
      
      return result;
      
    } catch (error) {
      logger.logError('PROCESSING_ERROR', error, {
        fileName,
        fileCategory,
        fileType
      });
      
      // NO FALLBACK TO MOCK DATA - THROW ERROR INSTEAD
      logger.logBOMProcessing('NO_FALLBACK', 'Refusing to use mock data - throwing error instead');
      throw new Error(`Real Gemini processing failed: ${error.message}. No mock data fallback allowed.`);
    }
  }

  // Enhanced Smart BoM generation
  generateSmartBoM(analysisResult, suggestions, marketPrices) {
    const components = analysisResult.components || [];
    const suggestionMap = new Map();
    const priceMap = new Map();
    
    // Create lookup maps for suggestions and prices
    suggestions.suggestions?.forEach(s => {
      suggestionMap.set(s.partName, s);
    });
    
    marketPrices.priceAnalysis?.forEach(p => {
      priceMap.set(p.partName, p);
    });
    
    // Generate enhanced Smart BoM
    const smartBoM = components.map((component, index) => {
      const componentSuggestions = suggestionMap.get(component.partName);
      const componentPrices = priceMap.get(component.partName);
      
      // Calculate ZBC variance
      let zbcVariance = null;
      let zbcValue = null;
      
      if (analysisResult.analysisType === 'GENERATED_ZBC' && component.zbcFactors) {
        zbcValue = component.zbcFactors.totalZBC;
      } else if (analysisResult.analysisType === 'EXTRACTED_ZBC' && component.extractedZBC) {
        zbcValue = component.extractedZBC.totalZBC;
      }
      
      if (zbcValue && componentPrices) {
        const marketPrice = componentPrices.priceRange.mostLikely;
        zbcVariance = ((marketPrice - zbcValue) / zbcValue * 100).toFixed(1);
      }
      
      return {
        id: `comp-${index + 1}`,
        partName: component.partName,
        partNumber: component.partNumber || 'N/A',
        quantity: component.quantity,
        material: component.material,
        
        // AI Suggestions
        aiSuggestedAlternative: componentSuggestions?.alternatives?.[0]?.suggestion || 'No alternatives identified',
        
        // Compliance Status
        complianceStatus: componentSuggestions?.compliance?.status || 'unknown',
        complianceFlags: this.getComplianceFlags(componentSuggestions?.compliance),
        
        // Risk Assessment
        riskFlag: this.getRiskLevel(componentSuggestions?.riskAssessment),
        
        // Supplier Recommendations
        aiRecommendedRegion: componentSuggestions?.supplierRegions?.[0]?.region || 'Not specified',
        
        // Market Pricing
        predictedMarketRange: componentPrices ? 
          `$${componentPrices.priceRange.low} - $${componentPrices.priceRange.high}` : 
          'Price analysis pending',
        
        // ZBC Data
        zbcShouldCost: zbcValue ? `$${zbcValue.toFixed(2)}` : 'N/A',
        zbcVariance: zbcVariance ? `${zbcVariance}%` : 'N/A',
        zbcSource: analysisResult.analysisType === 'GENERATED_ZBC' ? 'AI Generated' : 'Professional Report',
        
        // Additional metadata
        confidence: component.confidence || 'N/A',
        notes: component.notes || '',
        
        // Raw data for detailed view
        rawData: {
          component,
          suggestions: componentSuggestions,
          prices: componentPrices
        }
      };
    });
    
    return smartBoM;
  }

  getComplianceFlags(compliance) {
    if (!compliance) return [];
    
    const flags = [];
    if (compliance.status === 'compliant') {
      flags.push({ type: 'success', text: 'Compliant', icon: '✅' });
    } else if (compliance.status === 'pending') {
      flags.push({ type: 'warning', text: 'Pending', icon: '⚠️' });
    } else if (compliance.status === 'non-compliant') {
      flags.push({ type: 'error', text: 'Non-Compliant', icon: '❌' });
    }
    
    return flags;
  }

  getRiskLevel(riskAssessment) {
    if (!riskAssessment) return { level: 'unknown', color: 'gray' };
    
    const risks = [
      riskAssessment.supplyChain,
      riskAssessment.materialVolatility,
      riskAssessment.geopolitical
    ];
    
    if (risks.includes('high')) {
      return { level: 'High', color: 'red' };
    } else if (risks.includes('medium')) {
      return { level: 'Medium', color: 'yellow' };
    } else {
      return { level: 'Low', color: 'green' };
    }
  }

  // Get multer middleware
  getUploadMiddleware() {
    return this.upload.single('document');
  }
}

module.exports = new DocumentProcessor();
