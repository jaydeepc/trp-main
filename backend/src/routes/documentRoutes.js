const express = require('express');
const router = express.Router();
const documentProcessor = require('../services/documentProcessor');

// POST /api/documents/process - Process uploaded document
router.post('/process', documentProcessor.getUploadMiddleware(), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    const { analysisType = 'auto' } = req.body;
    
    console.log(`📄 Processing document: ${req.file.originalname} (${req.file.size} bytes)`);
    
    // Process the document
    const result = await documentProcessor.processDocument(req.file, analysisType);
    
    // Generate Smart BoM
    const smartBoM = documentProcessor.generateSmartBoM(
      result.analysis,
      result.suggestions,
      result.marketPrices
    );
    
    // Return comprehensive response
    res.json({
      success: true,
      message: 'Document processed successfully',
      data: {
        processingInfo: result.processingInfo,
        smartBoM,
        analysisResults: {
          analysis: result.analysis,
          suggestions: result.suggestions,
          marketPrices: result.marketPrices
        },
        summary: {
          totalComponents: smartBoM.length,
          analysisType: result.analysis.analysisType,
          confidence: result.analysis.overallAnalysis?.confidence || 'N/A',
          processingTime: result.processingTime
        }
      }
    });
    
  } catch (error) {
    console.error('Document processing error:', error);
    
    res.status(500).json({
      error: 'Document processing failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/documents/supported-types - Get supported file types
router.get('/supported-types', (req, res) => {
  res.json({
    success: true,
    data: {
      categories: {
        'Engineering Design': {
          description: 'CAD files and technical drawings for ZBC generation',
          extensions: ['.step', '.stp', '.dwg', '.dxf', '.iges', '.igs', '.pdf'],
          maxSize: '50MB',
          analysisType: 'GENERATED_ZBC'
        },
        'ZBC Report': {
          description: 'Professional cost analysis reports for ZBC extraction',
          extensions: ['.pdf', '.docx', '.doc', '.xlsx'],
          maxSize: '50MB',
          analysisType: 'EXTRACTED_ZBC'
        },
        'Bill of Materials': {
          description: 'BoM spreadsheets and component lists',
          extensions: ['.xlsx', '.xls', '.csv'],
          maxSize: '50MB',
          analysisType: 'BOM_PROCESSING'
        },
        'Technical Images': {
          description: 'Engineering drawings and technical diagrams',
          extensions: ['.png', '.jpg', '.jpeg', '.tiff', '.bmp'],
          maxSize: '50MB',
          analysisType: 'GENERATED_ZBC'
        }
      },
      limits: {
        maxFileSize: '50MB',
        maxFiles: 1,
        allowedMimeTypes: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
          'image/png',
          'image/jpeg',
          'image/tiff',
          'application/step',
          'application/iges'
        ]
      }
    }
  });
});

// POST /api/documents/validate - Validate file before upload
router.post('/validate', documentProcessor.getUploadMiddleware(), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        valid: false,
        error: 'No file provided'
      });
    }
    
    const fileCategory = documentProcessor.getFileCategory(req.file.originalname, req.file.mimetype);
    
    res.json({
      valid: true,
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        category: fileCategory,
        estimatedProcessingTime: process.env.USE_MOCK_DATA === 'true' ? 
          `${process.env.MOCK_DELAY_MS || 1500}ms` : 
          'Variable (AI processing)'
      }
    });
    
  } catch (error) {
    res.status(400).json({
      valid: false,
      error: error.message
    });
  }
});

// GET /api/documents/processing-status/:jobId - Check processing status (future enhancement)
router.get('/processing-status/:jobId', (req, res) => {
  // Placeholder for async processing status checking
  res.json({
    success: true,
    data: {
      jobId: req.params.jobId,
      status: 'completed',
      message: 'Processing status endpoint - future enhancement'
    }
  });
});

module.exports = router;
