const mongoose = require('mongoose');
const crypto = require('crypto');

// Document Schema for Base64 Storage
const DocumentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalName: String,
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: String,

  // Base64 storage (until file storage system is integrated)
  base64Data: {
    type: String,
    required: true
  },

  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'error'],
    default: 'pending'
  },

  // Analysis results reference
  analysisResults: {
    componentCount: Number,
    extractionConfidence: Number,
    processingTime: Number,
    geminiModel: String,
    errors: [String]
  },

  // Document classification
  documentType: {
    type: String,
    enum: ['BOM', 'Design', 'Specification', 'Quotation', 'Drawing', 'CAD', 'Other'],
    default: 'Other'
  },

  // Metadata
  metadata: {
    uploadedBy: {
      type: String,
      default: 'system'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: Date,
    source: {
      type: String,
      enum: ['direct', 'zip', 'api'],
      default: 'direct'
    },
    zipSource: String // If extracted from ZIP
  }
}, {
  timestamps: true,
  collection: 'documents'
});

// Indexes for performance
DocumentSchema.index({ processingStatus: 1 });
DocumentSchema.index({ 'metadata.uploadedAt': -1 });
DocumentSchema.index({ fileType: 1, documentType: 1 });

// Instance methods
DocumentSchema.methods.getFileExtension = function () {
  return this.fileName.split('.').pop().toLowerCase();
};

DocumentSchema.methods.getFileSizeFormatted = function () {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

DocumentSchema.methods.updateProcessingStatus = function (status, results = {}) {
  this.processingStatus = status;

  if (status === 'completed') {
    this.metadata.processedAt = new Date();
    this.analysisResults = {
      ...this.analysisResults,
      ...results
    };
  }

  return this.save();
};

DocumentSchema.methods.toSummary = function () {
  return {
    id: this._id.toString(),
    fileName: this.fileName,
    originalName: this.originalName,
    fileType: this.fileType,
    fileSize: this.fileSize,
    fileSizeFormatted: this.getFileSizeFormatted(),
    documentType: this.documentType,
    processingStatus: this.processingStatus,
    analysisResults: this.analysisResults,
    metadata: this.metadata,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Get base64 data (separate method for security)
DocumentSchema.methods.getBase64Data = function () {
  return this.base64Data;
};

// Static methods
DocumentSchema.statics.findByStatus = function (status) {
  return this.find({ processingStatus: status }).sort({ createdAt: -1 });
};

DocumentSchema.statics.findPendingProcessing = function () {
  return this.find({
    processingStatus: { $in: ['pending', 'processing'] }
  }).sort({ createdAt: 1 });
};

DocumentSchema.statics.getStorageStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        avgSize: { $avg: '$fileSize' },
        byType: {
          $push: {
            documentType: '$documentType',
            fileType: '$fileType',
            size: '$fileSize'
          }
        }
      }
    },
    {
      $project: {
        totalDocuments: 1,
        totalSize: 1,
        totalSizeMB: { $divide: ['$totalSize', 1024 * 1024] },
        avgSize: 1,
        avgSizeMB: { $divide: ['$avgSize', 1024 * 1024] },
        byType: 1
      }
    }
  ]);
};

// Check if document already exists (duplicate prevention)
DocumentSchema.statics.isDuplicate = async function (fileName, fileSize) {
  const existing = await this.findOne({ fileName, fileSize });
  return !!existing;
};

// Clean up old documents (utility method)
DocumentSchema.statics.cleanupOldDocuments = async function (daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    processingStatus: { $in: ['failed', 'error'] }
  });

  return result.deletedCount;
};

module.exports = mongoose.model('Document', DocumentSchema);
