const express = require('express');
const router = express.Router();
const RFQ = require('../models/RFQ');
const documentProcessor = require('../services/documentProcessor');
const mockRFQService = require('../services/mockRFQService');

// Helper function to determine if we should use mock data
const useMockData = () => process.env.USE_MOCK_DATA === 'true';

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
    
    if (useMockData()) {
      const result = mockRFQService.getRFQs(req.userId, status, parseInt(limit), parseInt(page));
      return res.json({
        success: true,
        data: result
      });
    }
    
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
    if (useMockData()) {
      const rfq = mockRFQService.createRFQ(req.userId);
      return res.status(201).json({
        success: true,
        message: 'RFQ created successfully',
        data: rfq
      });
    }
    
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

// PUT /api/rfqs/:id/step1 - Update Step 1 (Document Processing)
router.put('/:id/step1', authenticateUser, documentProcessor.getUploadMiddleware(), async (req, res) => {
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
    
    // Process the document
    const result = await documentProcessor.processDocument(req.file, req.body.analysisType);
    
    // Generate Smart BoM
    const smartBoM = documentProcessor.generateSmartBoM(
      result.analysis,
      result.suggestions,
      result.marketPrices
    );
    
    // Update RFQ with processed data
    rfq.sourceDocument = {
      fileName: result.processingInfo.fileName,
      fileType: result.processingInfo.fileType,
      fileCategory: result.processingInfo.fileCategory,
      fileSize: result.processingInfo.fileSize,
      processingMode: result.processingInfo.processingMode,
      analysisType: result.analysis.analysisType
    };
    
    rfq.components = smartBoM;
    rfq.analysisResults = {
      analysis: result.analysis,
      suggestions: result.suggestions,
      marketPrices: result.marketPrices,
      processingInfo: result.processingInfo
    };
    
    rfq.markStepComplete(1, {
      documentProcessed: true,
      componentsCount: smartBoM.length
    });
    
    rfq.status = 'in-progress';
    rfq.currentStep = 2;
    
    await rfq.save();
    
    res.json({
      success: true,
      message: 'Step 1 completed successfully',
      data: {
        rfq: rfq.toSummary(),
        smartBoM,
        processingInfo: result.processingInfo
      }
    });
    
  } catch (error) {
    console.error('Error updating RFQ Step 1:', error);
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
