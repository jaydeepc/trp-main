const { processZipFiles } = require('../utils/zipExtractor');
const { extractDocumentData } = require('../services/documentExtractor');
const RFQ = require('../models/RFQ');

const extractDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
        message: 'Please upload at least one file'
      });
    }

    const { rfqId } = req.body;
    const userId = req.headers['x-user-id'];

    console.log(`🔄 Starting document extraction`);
    console.log(`📁 Files received: ${req.files.length}`);
    if (rfqId) {
      console.log(`🔗 RFQ ID: ${rfqId}`);
    }

    const { files: processedFiles, zipResults } = await processZipFiles(req.files);

    console.log(`📦 Total files after ZIP extraction: ${processedFiles.length}`);
    if (zipResults.length > 0) {
      zipResults.forEach(result => {
        console.log(`   ZIP: ${result.zipName} → ${result.extractedCount} files extracted, ${result.skippedCount} skipped`);
      });
    }

    const fileBuffers = processedFiles.map(f => f.buffer);
    const fileNames = processedFiles.map(f => f.originalname);
    const mimeTypes = processedFiles.map(f => f.mimetype);

    console.log(`🤖 Calling Gemini for document understanding...`);
    const extractionResult = await extractDocumentData(fileBuffers, fileNames, mimeTypes);

    console.log(`✅ Document extraction completed`);
    console.log(`   Document Types: ${extractionResult.extraction.documentTypes.join(', ')}`);
    console.log(`   Components Found: ${extractionResult.extraction.components.length}`);
    console.log(`   Confidence: ${extractionResult.extraction.metadata.confidence}%`);

    // If RFQ ID provided, update the RFQ in database
    if (rfqId) {
      try {
        const rfq = await RFQ.findOne({ _id: rfqId });

        if (rfq) {
          // Update RFQ with extracted data
          rfq.extractedDocumentData = {
            documentTypes: extractionResult.extraction.documentTypes,
            components: extractionResult.extraction.components,
            projectInfo: extractionResult.extraction.projectInfo || {},
            technicalRequirements: extractionResult.extraction.technicalRequirements || {},
            metadata: {
              ...extractionResult.extraction.metadata,
              filesProcessed: processedFiles.length,
              originalFiles: req.files.length,
              zipFilesExtracted: zipResults.reduce((sum, r) => sum + r.extractedCount, 0),
              extractedAt: new Date()
            }
          };

          // Update source documents
          rfq.sourceDocuments = processedFiles.map(file => ({
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            source: file.source || 'direct',
            zipSource: file.zipSource
          }));

          rfq.markStepComplete(1, {
            documentsUploaded: true,
            documentsExtracted: true,
            componentsExtracted: extractionResult.extraction.components.length,
            filesProcessed: processedFiles.length
          });

          await rfq.save();
          console.log(`💾 RFQ ${rfqId} updated with extracted data`);
        } else {
          console.warn(`⚠️ RFQ ${rfqId} not found for user ${userId}`);
        }
      } catch (dbError) {
        console.error(`❌ Failed to update RFQ ${rfqId}:`, dbError.message);
        // Don't fail the whole request if DB update fails
      }
    }

    res.json({
      success: true,
      message: 'Documents extracted successfully',
      data: {
        ...extractionResult.extraction,
        filesProcessed: processedFiles.length,
        filesUploaded: req.files.length,
        zipResults: zipResults.length > 0 ? zipResults : undefined,
        fileDetails: processedFiles.map(file => ({
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          source: file.source || 'direct',
          zipSource: file.zipSource
        }))
      }
    });

  } catch (error) {
    console.error('❌ Document extraction error:', error);
    res.status(500).json({
      success: false,
      error: 'Document extraction failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  extractDocuments,
};
