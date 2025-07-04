const geminiService = require('./geminiService');
const mockService = require('./mockService');
const multer = require('multer');
const path = require('path');

class DocumentProcessor {
  constructor() {
    this.useMockData = process.env.USE_MOCK_DATA === 'true';
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

  // Main document processing function
  async processDocument(file, analysisType = 'auto') {
    try {
      const fileName = file.originalname;
      const fileType = path.extname(fileName).toLowerCase();
      const fileCategory = this.getFileCategory(fileName, file.mimetype);
      
      console.log(`📄 Processing document: ${fileName} (${fileCategory})`);
      
      let result;
      
      if (this.useMockData) {
        console.log('🎭 Using mock data for processing');
        result = await mockService.processDocument(fileName, fileType, analysisType);
      } else {
        console.log('🤖 Using Gemini AI for processing');
        result = await this.processWithGemini(file, fileCategory, analysisType);
      }
      
      // Enhance result with additional metadata
      result.processingInfo = {
        fileName,
        fileType,
        fileCategory,
        fileSize: file.size,
        processingMode: this.useMockData ? 'mock' : 'gemini',
        timestamp: new Date().toISOString()
      };
      
      return result;
      
    } catch (error) {
      console.error('Document processing error:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  // Process with Gemini AI
  async processWithGemini(file, fileCategory, analysisType) {
    const fileName = file.originalname;
    const fileType = path.extname(fileName).toLowerCase();
    
    let analysisResult;
    
    try {
      // Route to appropriate Gemini service based on file category
      switch (fileCategory) {
        case 'zbc-report':
          console.log('🔍 Extracting ZBC data from report');
          const zbcText = await geminiService.extractZBCReport(file.buffer, fileName, fileType);
          analysisResult = JSON.parse(zbcText);
          break;
          
        case 'bom':
          console.log('📋 Processing BoM file');
          const bomText = await geminiService.processBOMFile(file.buffer, fileName, fileType);
          analysisResult = JSON.parse(bomText);
          break;
          
        case 'cad':
        case 'technical-document':
        case 'image-document':
        default:
          console.log('🔧 Analyzing engineering design');
          const cadText = await geminiService.analyzeEngineeringDesign(file.buffer, fileName, fileType);
          analysisResult = JSON.parse(cadText);
          break;
      }
      
      // Generate additional insights using Gemini
      console.log('💡 Generating AI suggestions');
      const suggestionsText = await geminiService.generateSuggestions(analysisResult.components || []);
      const suggestions = JSON.parse(suggestionsText);
      
      console.log('📈 Predicting market prices');
      const marketPricesText = await geminiService.predictMarketPrices(analysisResult.components || []);
      const marketPrices = JSON.parse(marketPricesText);
      
      return {
        analysis: analysisResult,
        suggestions,
        marketPrices,
        processingTime: 'Variable (Gemini API)',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Gemini processing error:', error);
      
      // Fallback to mock data if Gemini fails
      console.log('⚠️ Falling back to mock data due to Gemini error');
      return await mockService.processDocument(fileName, fileType, analysisType);
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
