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

// PUT /api/rfqs/:id/analyse - Upload and analyse document
router.put('/:id/analyse', authenticateUser, documentProcessor.getUploadMiddleware(), async (req, res) => {
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

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    console.log(`🔄 Processing document: ${req.file.originalname}`);

    // Simulate processing delay (10 seconds like frontend expects)
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Get mock BOM analysis data from frontend
    const mockData = getMockData();

    // Convert mock components to smartBoM format expected by RFQ model
    const smartBoM = mockData.components.map(component => ({
      id: component.id,
      partNumber: component.partNumber,
      partName: component.partName,
      quantity: component.quantity,
      material: component.material,
      unitPrice: parseFloat(component.zbcShouldCost?.replace('$', '').replace(',', '') || '100'),
      totalPrice: parseFloat(component.zbcShouldCost?.replace('$', '').replace(',', '') || '100') * component.quantity,
      supplier: `Mock Supplier ${component.id}`,
      leadTime: Math.floor(Math.random() * 21) + 7, // 7-28 days
      category: component.material,
      complianceStatus: component.complianceStatus,
      riskLevel: component.riskFlag?.level || 'Low',
      confidence: component.confidence || 90,
      aiSuggestedAlternative: component.aiSuggestedAlternative,
      zbcVariance: component.zbcVariance,
      predictedMarketRange: component.predictedMarketRange
    }));

    // Create processing info
    const processingInfo = {
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileCategory: 'BOM',
      fileSize: req.file.size,
      processingMode: 'mock', // Valid enum: ['mock', 'gemini']
      analysisType: 'BOM_PROCESSING', // Valid enum: ['GENERATED_ZBC', 'EXTRACTED_ZBC', 'BOM_PROCESSING']
      processingTime: '10.2s',
      confidence: '94.2%',
      componentsFound: mockData.components.length
    };

    // Update RFQ with processed data
    rfq.sourceDocument = {
      fileName: processingInfo.fileName,
      fileType: processingInfo.fileType,
      fileCategory: processingInfo.fileCategory,
      fileSize: processingInfo.fileSize,
      processingMode: processingInfo.processingMode,
      analysisType: processingInfo.analysisType
    };

    rfq.components = smartBoM;
    rfq.analysisResults = {
      analysis: {
        analysisType: processingInfo.analysisType,
        confidence: processingInfo.confidence,
        componentsFound: processingInfo.componentsFound
      },
      suggestions: mockData.insights,
      marketPrices: mockData.components.map(c => ({
        partNumber: c.partNumber,
        currentPrice: c.zbcShouldCost,
        marketRange: c.predictedMarketRange,
        variance: c.zbcVariance
      })),
      processingInfo
    };

    rfq.markStepComplete(1, {
      documentProcessed: true,
      componentsCount: smartBoM.length
    });

    rfq.status = 'in-progress';
    rfq.currentStep = 2;

    await rfq.save();

    console.log(`✅ Mock BOM analysis completed for RFQ ${rfq._id}: ${smartBoM.length} components`);

    res.json({
      success: true,
      message: 'Document processed successfully with AI analysis',
      data: {
        components: mockData.components,
        suppliers: mockData.suppliers,
        insights: mockData.insights
      }
    });

  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({
      error: 'Failed to process document',
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

module.exports = router;
