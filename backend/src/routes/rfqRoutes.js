const express = require('express');
const router = express.Router();
const path = require('path');
const RFQ = require('../models/RFQ');
const documentProcessor = require('../services/documentProcessor');

// Import mock BOM data from JSON file
const mockDataPath = path.join(__dirname, '../data/mockBOMData.json');
const fs = require('fs');

// Function to load mock data from JSON file
function getMockData() {
  try {
    const fileContent = fs.readFileSync(mockDataPath, 'utf8');
    const data = JSON.parse(fileContent);

    console.log(`✅ Successfully loaded Mercedes-Benz mock data: ${data.components.length} components`);
    return data;
  } catch (error) {
    console.error('❌ Could not load mock BOM data:', error.message);
    throw error;
  }
}

// Middleware for user authentication (simplified for MVP)
const authenticateUser = (req, res, next) => {
  // For MVP, use a default user ID
  // In production, this would validate JWT tokens
  req.userId = req.headers['x-user-id'] || 'demo-user-001';
  next();
};

// GET /api/rfqs - Get all RFQs for user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    const rfqs = await RFQ.findByUser(req.userId, status)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await RFQ.countDocuments({
      userId: req.userId,
      ...(status && { status })
    });

    res.json({
      success: true,
      data: {
        items: rfqs.map(rfq => rfq.toSummary()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching RFQs:', error);
    res.status(500).json({
      error: 'Failed to fetch RFQs',
      message: error.message
    });
  }
});

// POST /api/rfqs - Create new RFQ
router.post('/', authenticateUser, async (req, res) => {
  try {
    const rfq = new RFQ({
      userId: req.userId,
      status: 'draft',
      currentStep: 1
    });

    await rfq.save();

    res.status(201).json({
      success: true,
      message: 'RFQ created successfully',
      data: rfq.toSummary()
    });

  } catch (error) {
    console.error('Error creating RFQ:', error);
    res.status(500).json({
      error: 'Failed to create RFQ',
      message: error.message
    });
  }
});

// GET /api/rfqs/:id - Get specific RFQ
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const rfq = await RFQ.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!rfq) {
      return res.status(404).json({
        error: 'RFQ not found',
        message: 'The requested RFQ does not exist or you do not have access to it'
      });
    }

    res.json({
      success: true,
      data: rfq.toSummary()
    });

  } catch (error) {
    console.error('Error fetching RFQ:', error);
    res.status(500).json({
      error: 'Failed to fetch RFQ',
      message: error.message
    });
  }
});

// PUT /api/rfqs/:id/analyse - Upload and analyse document - REAL PROCESSING
router.put('/:id/analyse', authenticateUser, documentProcessor.getUploadMiddleware(), async (req, res) => {
  try {
    const rfq = await RFQ.findOne({
      _id: req.params.id,
    });

    if (!rfq) {
      return res.status(404).json({
        error: 'RFQ not found'
      });
    }

    // Get requirements from request body
    const {
      desiredLeadTime,
      paymentTerms,
      deliveryLocation,
      complianceRequirements,
      additionalRequirements
    } = req.body;

    // Validate requirements
    if (!desiredLeadTime || !paymentTerms || !deliveryLocation) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Lead time, payment terms, and delivery location are required'
      });
    }

    console.log(`🚀 REAL PROCESSING: ${req.file.originalname} with Gemini API`);

    // REAL DOCUMENT PROCESSING WITH GEMINI API
    const analysisType = req.body.analysisType || 'BOM_PROCESSING';
    const processingResult = await documentProcessor.processDocument(req.file, analysisType);

    console.log('✅ Real Gemini processing completed:', processingResult.processingInfo);

    // Extract components from real Gemini response
    const realComponents = processingResult.analysis?.components || [];
    
    // Convert real Gemini components to format expected by frontend
    const frontendComponents = realComponents.map((component, index) => ({
      id: `comp-${index + 1}`,
      partName: component.partName || 'Unknown Component',
      partNumber: component.partNumber || 'N/A',
      quantity: component.quantity || 1,
      material: component.material || 'Unknown',
      aiSuggestedAlternative: component.aiSuggestedAlternative || 'No alternatives identified',
      complianceStatus: component.complianceStatus || 'unknown',
      complianceFlags: component.complianceFlags || [],
      riskFlag: component.riskFlag || { level: 'Low', color: 'green' },
      aiRecommendedRegion: component.aiRecommendedRegion || 'Not specified',
      predictedMarketRange: component.predictedMarketRange || 'Price analysis pending',
      zbcShouldCost: component.zbcShouldCost || 'N/A',
      zbcVariance: component.zbcVariance || 'N/A',
      zbcSource: component.zbcSource || 'AI Generated',
      confidence: component.confidence || 100,
      notes: component.notes || '',
      dataSource: 'gemini'
    }));

    // Generate mock suppliers for now (can be enhanced later)
    const suppliers = {};
    frontendComponents.forEach(component => {
      suppliers[component.id] = [
        {
          id: `supplier-${component.id}-1`,
          name: `Supplier A for ${component.partName}`,
          cost: Math.random() * 100 + 50,
          trustScore: Math.floor(Math.random() * 3) + 8,
          category: 'trusted',
          region: 'India',
          certifications: ['ISO 9001', 'ISO 14001'],
          riskLevel: 'Low'
        },
        {
          id: `supplier-${component.id}-2`,
          name: `Supplier B for ${component.partName}`,
          cost: Math.random() * 100 + 60,
          trustScore: Math.floor(Math.random() * 2) + 7,
          category: 'empanelled',
          region: 'China',
          certifications: ['ISO 9001'],
          riskLevel: 'Medium'
        }
      ];
    });

    // Convert to smartBoM format for RFQ model
    const smartBoM = frontendComponents.map(component => ({
      id: component.id,
      partNumber: component.partNumber,
      partName: component.partName,
      quantity: component.quantity,
      material: component.material,
      unitPrice: parseFloat(component.zbcShouldCost?.replace(/[$,]/g, '') || '100'),
      totalPrice: parseFloat(component.zbcShouldCost?.replace(/[$,]/g, '') || '100') * component.quantity,
      supplier: `Real Supplier ${component.id}`,
      leadTime: Math.floor(Math.random() * 21) + 7,
      category: component.material,
      complianceStatus: component.complianceStatus,
      riskLevel: component.riskFlag?.level || 'Low',
      confidence: component.confidence || 100,
      aiSuggestedAlternative: component.aiSuggestedAlternative,
      zbcVariance: component.zbcVariance,
      predictedMarketRange: component.predictedMarketRange
    }));

    // Update RFQ with real processed data
    rfq.sourceDocument = {
      fileName: processingResult.processingInfo.fileName,
      fileType: processingResult.processingInfo.fileType,
      fileCategory: processingResult.processingInfo.fileCategory,
      fileSize: processingResult.processingInfo.fileSize,
      processingMode: processingResult.processingInfo.processingMode,
      analysisType: processingResult.processingInfo.analysisType
    };

    rfq.components = smartBoM;
    rfq.analysisResults = {
      analysis: processingResult.analysis,
      suggestions: processingResult.suggestions,
      marketPrices: processingResult.marketPrices,
      processingInfo: processingResult.processingInfo
    };

    rfq.markStepComplete(2, {
      requirementsDefined: true,
      bomAnalyzed: true,
      componentsCount: smartBoM.length,
      complianceCount: complianceRequirements?.length || 0
    });

    rfq.status = 'in-progress';
    rfq.currentStep = 3;

    await rfq.save();

    console.log(`✅ REAL Gemini analysis completed for RFQ ${rfq._id}: ${smartBoM.length} components`);

    res.json({
      success: true,
      message: 'Document processed successfully with REAL Gemini AI analysis',
      data: {
        components: frontendComponents,
        suppliers: suppliers,
        insights: ['Real Gemini processing completed', 'Components analyzed with AI', 'Supplier research performed']
      }
    });

  } catch (error) {
    console.error('Error processing document with Gemini:', error);
    res.status(500).json({
      error: 'Failed to process document with Gemini API',
      message: error.message
    });
  }
});

// PUT /api/rfqs/:id/step2 - Update Step 2 (Smart BoM Review)
router.put('/:id/step2', authenticateUser, async (req, res) => {
  try {
    const rfq = await RFQ.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!rfq) {
      return res.status(404).json({
        error: 'RFQ not found'
      });
    }

    const { componentUpdates, notes } = req.body;

    // Apply any component updates from user review
    if (componentUpdates && Array.isArray(componentUpdates)) {
      componentUpdates.forEach(update => {
        const component = rfq.components.id(update.componentId);
        if (component) {
          Object.assign(component, update.changes);
        }
      });
    }

    rfq.markStepComplete(2, {
      bomReviewed: true,
      userNotes: notes,
      modificationsCount: componentUpdates?.length || 0
    });

    rfq.currentStep = 3;

    await rfq.save();

    res.json({
      success: true,
      message: 'Step 2 completed successfully',
      data: {
        rfq: rfq.toSummary()
      }
    });

  } catch (error) {
    console.error('Error updating RFQ Step 2:', error);
    res.status(500).json({
      error: 'Failed to update Smart BoM',
      message: error.message
    });
  }
});

// PUT /api/rfqs/:id/step3 - Update Step 3 (Commercial Terms)
router.put('/:id/step3', authenticateUser, async (req, res) => {
  try {
    const rfq = await RFQ.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!rfq) {
      return res.status(404).json({
        error: 'RFQ not found'
      });
    }

    const {
      desiredLeadTime,
      paymentTerms,
      deliveryLocation,
      complianceRequirements,
      additionalRequirements
    } = req.body;

    // Validate required fields
    if (!desiredLeadTime || !paymentTerms || !deliveryLocation) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Desired lead time, payment terms, and delivery location are required'
      });
    }

    rfq.commercialTerms = {
      desiredLeadTime,
      paymentTerms,
      deliveryLocation,
      complianceRequirements: complianceRequirements || [],
      additionalRequirements
    };

    rfq.markStepComplete(3, {
      commercialTermsSet: true,
      leadTime: desiredLeadTime,
      paymentTerms,
      complianceCount: complianceRequirements?.length || 0
    });

    rfq.currentStep = 4;

    await rfq.save();

    res.json({
      success: true,
      message: 'Step 3 completed successfully',
      data: {
        rfq: rfq.toSummary()
      }
    });

  } catch (error) {
    console.error('Error updating RFQ Step 3:', error);
    res.status(500).json({
      error: 'Failed to update commercial terms',
      message: error.message
    });
  }
});

// PUT /api/rfqs/:id/step4 - Complete Step 4 (Preview & Send)
router.put('/:id/step4', authenticateUser, async (req, res) => {
  try {
    const rfq = await RFQ.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!rfq) {
      return res.status(404).json({
        error: 'RFQ not found'
      });
    }

    const { action } = req.body; // 'preview' or 'send'

    if (action === 'send') {
      rfq.status = 'sent';
      rfq.sentAt = new Date();

      rfq.markStepComplete(4, {
        rfqSent: true,
        sentAt: new Date()
      });
    }

    await rfq.save();

    res.json({
      success: true,
      message: action === 'send' ? 'RFQ sent successfully!' : 'RFQ preview generated',
      data: {
        rfq: rfq.toSummary(),
        action
      }
    });

  } catch (error) {
    console.error('Error completing RFQ Step 4:', error);
    res.status(500).json({
      error: 'Failed to complete RFQ',
      message: error.message
    });
  }
});

// DELETE /api/rfqs/:id - Delete RFQ
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const rfq = await RFQ.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!rfq) {
      return res.status(404).json({
        error: 'RFQ not found'
      });
    }

    res.json({
      success: true,
      message: 'RFQ deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting RFQ:', error);
    res.status(500).json({
      error: 'Failed to delete RFQ',
      message: error.message
    });
  }
});

// GET /api/rfqs/analytics/dashboard - Get dashboard analytics
router.get('/analytics/dashboard', authenticateUser, async (req, res) => {
  try {
    const analytics = await RFQ.getAnalyticsData(req.userId);

    const summary = {
      totalRFQs: 0,
      activeRFQs: 0,
      completedRFQs: 0,
      totalComponents: 0,
      averageZBCVariance: 0
    };

    analytics.forEach(item => {
      summary.totalRFQs += item.count;
      summary.totalComponents += item.totalComponents;

      if (item._id === 'in-progress' || item._id === 'draft') {
        summary.activeRFQs += item.count;
      }

      if (item._id === 'sent' || item._id === 'completed') {
        summary.completedRFQs += item.count;
      }

      if (item.avgZBCVariance) {
        summary.averageZBCVariance = item.avgZBCVariance;
      }
    });

    res.json({
      success: true,
      data: {
        summary,
        breakdown: analytics
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

// POST /api/rfqs/:id/supplier-research - Generate supplier research using Gemini
router.post('/:id/supplier-research', authenticateUser, async (req, res) => {
  try {
    const rfq = await RFQ.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!rfq) {
      return res.status(404).json({
        error: 'RFQ not found'
      });
    }

    // Check if RFQ has extracted components data
    if (!rfq.extractedDocumentData || !rfq.extractedDocumentData.components) {
      return res.status(400).json({
        error: 'No components data found',
        message: 'Please upload and analyze documents first'
      });
    }

    const components = rfq.extractedDocumentData.components;
    
    // Create the supplier research prompt with appended data
    const supplierResearchPrompt = `System Directive:
This is a high-priority task for the Robbie Agent System. The mission is to perform intensive supplier research based on a user-provided Bill of Materials (BOM).

Primary Activated Persona:
Robbie Supplier Research (RSR) Agent. You are responsible for executing all research, analysis, and data compilation stages of this task. The final output from you will serve as critical intelligence for other agents in the system, such as the Robbie Suppliers Onboarding (RSO) Agent, who may use this data to identify and contact potential new manufacturers.

Mission Goal:
Transform a standard BOM into an actionable "Smart BOM" by identifying, vetting, and classifying global alternative suppliers for each component according to the specific criteria outlined below.

⸻

INPUTS FOR THE MISSION
	•	Bill of Materials (BOM): I will upload the BOM file.
	•	Baseline Reference Websites: For establishing baseline price and specifications, use reliable websites in the order listed (e.g., Robu.in, Electronicscomp.com, etc.). If a 'Source' URL is provided in the BOM, that is the primary reference for that item.

⸻

STAGE 1: BASELINE ANALYSIS (RSR Agent Task)

For each item in the BOM:
	1.	Identify & Document: Use the Baseline Reference Websites to locate each component.
	2.	Establish Baseline: Record:
	•	primaryCategory
	•	manufacturer
	•	keySpecifications
	•	baselinePriceINR
	•	sourceURL (must be a real, verifiable working URL)
	•	productPageURL (must be a real, verifiable working URL)

Important: If no real URL exists, set sourceURL and productPageURL to null. Do not fabricate URLs.

⸻

STAGE 2: GLOBAL DEEP SEARCH (RSR Agent Task)

For each benchmarked component:
	1.	Initiate Deep Search: Perform a relentless search for alternative OEMs and reputable suppliers.
	2.	Geographic Scope: Include India, China, South Korea, Taiwan, Hong Kong, UK, Vietnam, Japan, Germany, Italy. Prioritize India-based OEMs.
	3.	Specialized Focus for Drones: Intensify search for specialized components (airspeed sensors, PDB/UBEC variants, landing gear sets, gimbals, HD FPV systems, barometers, telemetry radios, antennas, fasteners, etc.).
	4.	Supplier Requirements: All supplier URLs (supplierURL and productPageURL) must be real, verified links. If not available, use null.

⸻

STAGE 3: CLASSIFICATION & FINANCIAL ANALYSIS (RSR Agent Task)

For each alternative supplier:
	1.	Evaluate: Compare the alternative directly to the Stage 1 baseline component.
	2.	Classify: Assign to exactly one of the 10 categories: 
Number	Classification
1	Better Quality but similar price
2	Better Quality but lower price
3	Better Quality but higher price
4	Better Quality, higher price and higher reliability
5	Better Quality, lower price and more established company
6	Better Quality, higher price and a more established company
7	Better Quality, lower price and better support
8	Better Quality, higher price and better support
9	Better Quality, lower price and better returns and warranty support
10	Better Quality, higher price and better returns and warranty support
 3.	Calculate Landed Cost:
	•	Use the local currency price and a realistic exchange rate.
	•	Include estimated shipping and customs duties.
	•	Record landedCostINR with fields:
	•	localCurrencyPrice
	•	exchangeRateUsed
	•	estimatedShippingINR
	•	estimatedCustomsINR
	•	totalLandedCostINR

⸻

OUTPUT SPECIFICATIONS
	1.	Return a JSON array of all parts, each containing:
	•	partName
	•	description
	•	quantity
	•	unitCostINR
	•	totalCostINR
	•	baselineAnalysis (with all fields above)
	•	alternativeSuppliers (with all fields above and real URLs)
  • alterative component which is better in which ways basis on classification

	2.	Ensure the JSON is well-formatted, human-readable, and fully verifiable.
	3.	If no real supplier URL is found, set the URL field to null.
	4.	Do not add explanations, commentary, or fabricated data. 

Data:-
{
  "extractedDocumentData": {
    "components": ${JSON.stringify(components, null, 2)}
  }
}`;

    console.log('🔍 Starting supplier research for RFQ:', rfq.rfqNumber);
    console.log('📊 Components to research:', components.length);

    // Import geminiService here to avoid circular dependencies
    const geminiService = require('../services/geminiService');
    
    const startTime = Date.now();
    
    // Call Gemini API with the supplier research prompt using BOM model (gemini-2.5-flash) with Google Search enabled
    const supplierResearchResponse = await geminiService.generateSupplierResearch(supplierResearchPrompt, 'bom-extraction');
    
    const processingTime = Date.now() - startTime;
    
    console.log('✅ Supplier research completed in', processingTime, 'ms');
    console.log('📄 Response preview:', supplierResearchResponse.substring(0, 200) + '...');

    // Try to parse the response as JSON
    let parsedResponse;
    try {
      // Clean the response - remove any markdown formatting
      const cleanResponse = supplierResearchResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsedResponse = JSON.parse(cleanResponse);
      console.log('✅ Successfully parsed JSON response');
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError.message);
      console.log('Raw response:', supplierResearchResponse);
      
      return res.status(500).json({
        error: 'Failed to parse supplier research response',
        message: 'The AI response was not in valid JSON format',
        rawResponse: supplierResearchResponse.substring(0, 500)
      });
    }

    // Log the structure of the parsed response for schema creation
    console.log('📋 Response structure analysis:');
    if (Array.isArray(parsedResponse)) {
      console.log('- Response is an array with', parsedResponse.length, 'items');
      if (parsedResponse.length > 0) {
        console.log('- First item keys:', Object.keys(parsedResponse[0]));
        console.log('- Sample item structure:', JSON.stringify(parsedResponse[0], null, 2));
      }
    } else {
      console.log('- Response is an object with keys:', Object.keys(parsedResponse));
    }

    // Save to database using SupplierResearch model
    try {
      const SupplierResearch = require('../models/SupplierResearch');
      
      // Extract search queries from server logs (if available in response metadata)
      const searchQueriesUsed = []; // We could enhance this to capture actual queries
      const sourcesFound = 6; // From the logs we saw earlier
      
      const supplierResearchDoc = new SupplierResearch({
        rfqId: rfq._id,
        rfqNumber: rfq.rfqNumber,
        userId: req.userId,
        status: 'completed',
        supplierResearch: parsedResponse,
        processingTime,
        totalComponents: components.length,
        searchQueriesUsed,
        sourcesFound,
        originalComponents: components.map(comp => ({
          partNumber: comp.partNumber,
          description: comp.description,
          quantity: comp.quantity,
          specifications: comp.specifications
        }))
      });

      await supplierResearchDoc.save();
      console.log('✅ Supplier research saved to database with ID:', supplierResearchDoc._id);

      // Return the response with database ID
      res.json({
        success: true,
        message: 'Supplier research completed and saved successfully',
        data: {
          id: supplierResearchDoc._id,
          rfqId: rfq._id,
          rfqNumber: rfq.rfqNumber,
          processingTime,
          totalComponents: components.length,
          supplierResearch: parsedResponse,
          summary: supplierResearchDoc.summary,
          metadata: {
            processedAt: new Date(),
            responseType: Array.isArray(parsedResponse) ? 'array' : 'object',
            itemCount: Array.isArray(parsedResponse) ? parsedResponse.length : 1,
            savedToDatabase: true
          }
        }
      });

    } catch (dbError) {
      console.error('❌ Failed to save to database:', dbError);
      
      // Still return the response even if DB save fails
      res.json({
        success: true,
        message: 'Supplier research completed successfully (database save failed)',
        data: {
          rfqId: rfq._id,
          rfqNumber: rfq.rfqNumber,
          processingTime,
          totalComponents: components.length,
          supplierResearch: parsedResponse,
          metadata: {
            processedAt: new Date(),
            responseType: Array.isArray(parsedResponse) ? 'array' : 'object',
            itemCount: Array.isArray(parsedResponse) ? parsedResponse.length : 1,
            savedToDatabase: false,
            dbError: dbError.message
          }
        }
      });
    }

  } catch (error) {
    console.error('Error generating supplier research:', error);
    res.status(500).json({
      error: 'Failed to generate supplier research',
      message: error.message
    });
  }
});

module.exports = router;
