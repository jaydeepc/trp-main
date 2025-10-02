const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentProcessor = require('../services/documentProcessor');
const { validateFiles } = require('../middleware/fileValidation');
const documentController = require('../controllers/documentController');

// Configure multer for memory storage (files stored in memory as buffers)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 10 // Max 10 files
  }
});

// POST /api/documents/extract - Extract data from multiple uploaded documents
router.post('/extract', upload.array('files', 10), validateFiles, documentController.extractDocuments);

// POST /api/documents/process - Process uploaded document (OLD WORKFLOW - kept for compatibility)
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
          description: 'CAD files, technical drawings, and SolidWorks files',
          extensions: ['.step', '.stp', '.dwg', '.dxf', '.iges', '.igs', '.sldasm', '.sldprt', '.slddrw', '.pdf'],
          maxSize: '50MB',
          analysisType: 'Design'
        },
        'BOM & Specifications': {
          description: 'Bill of Materials, spreadsheets, and specifications',
          extensions: ['.xlsx', '.xls', '.csv', '.pdf', '.docx', '.doc'],
          maxSize: '50MB',
          analysisType: 'BOM'
        },
        'Images': {
          description: 'Technical images, photos, handwritten notes',
          extensions: ['.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif', '.webp'],
          maxSize: '50MB',
          analysisType: 'Design'
        },
        'Archives': {
          description: 'ZIP files containing multiple documents',
          extensions: ['.zip'],
          maxSize: '50MB',
          analysisType: 'Multiple'
        }
      },
      limits: {
        maxFileSize: '50MB',
        maxFiles: 10,
        supportedFormats: 'Images, PDFs, Excel, CSV, Word, CAD (DWG, DXF), SolidWorks (.sldasm, .sldprt, .slddrw), ZIP archives'
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
