const { processZipFiles } = require('../utils/zipExtractor');
const { extractDocumentData } = require('../services/documentExtractor');
const RFQ = require('../models/RFQNew');
const BOM = require('../models/BOM');
const Document = require('../models/Document');
const { v4: uuidv4 } = require('uuid');

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
    console.log(`📧 Request body:`, JSON.stringify(req.body));
    console.log(`👤 User ID: ${userId}`);
    if (rfqId) {
      console.log(`🔗 RFQ ID received: "${rfqId}" (type: ${typeof rfqId})`);
    } else {
      console.log(`⚠️ NO RFQ ID received in request body`);
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
    const startTime = Date.now();
    const extractionResult = await extractDocumentData(fileBuffers, fileNames, mimeTypes);
    const processingTime = Date.now() - startTime;

    console.log(`✅ Document extraction completed`);
    console.log(`   Document Types: ${extractionResult.extraction.documentTypes.join(', ')}`);
    console.log(`   Components Found: ${extractionResult.extraction.components.length}`);
    console.log(`   Confidence: ${extractionResult.extraction.metadata.confidence}%`);

    // If RFQ ID provided, store documents and update RFQ
    if (rfqId) {
      console.log(`🔍 Attempting to find RFQ with rfqId: "${rfqId}"`);
      try {
        const rfq = await RFQ.findOne({ rfqId: rfqId });
        console.log(`📋 RFQ found:`, rfq ? `YES (${rfq.rfqId})` : 'NO');

        if (rfq) {
          // 1. Create Document records for each processed file
          const documentIds = [];
          for (const file of processedFiles) {
            const document = new Document({
              fileName: file.originalname,
              originalName: file.originalname,
              fileType: file.mimetype,
              fileSize: file.size,
              mimeType: file.mimetype,
              base64Data: file.buffer.toString('base64'),
              processingStatus: 'completed',
              analysisResults: {
                componentCount: extractionResult.extraction.components.length,
                extractionConfidence: extractionResult.extraction.metadata.confidence,
                processingTime,
                geminiModel: extractionResult.modelMetadata.model
              },
              documentType: extractionResult.extraction.documentTypes[0] || 'Other',
              metadata: {
                uploadedBy: userId,
                uploadedAt: new Date(),
                processedAt: new Date(),
                source: file.source || 'direct',
                zipSource: file.zipSource
              }
            });

            await document.save();
            documentIds.push(document._id);
            console.log(`📄 Created document: ${document.documentId}`);
          }

          // 2. Update RFQ with extracted components and document references
          rfq.documents = processedFiles.map((file, index) => ({
            documentId: documentIds[index],
            fileName: file.originalname,
            fileType: file.mimetype
          }));

          rfq.analysisData = {
            components: extractionResult.extraction.components,
            modelMetadata: extractionResult.modelMetadata,
            processingTime,
            analysisDate: new Date()
          };

          // Ensure createdBy is set correctly
          if (!rfq.createdBy) {
            rfq.createdBy = userId;
          }

          await rfq.save();
          console.log(`💾 Updated RFQ ${rfq.rfqId} with extracted components`);
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
