const mongoose = require('mongoose');
const { ModelMetadataSchema, ComponentSchema } = require('./schemas/CommonSchemas');

// Main RFQ Schema (Core)
const RFQSchema = new mongoose.Schema({
  rfqId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  createdBy: {
    type: String,
    default: 'system',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'completed', 'sent', 'cancelled'],
    default: 'draft',
    index: true
  },

  // Document references (not base64 content)
  documents: [{
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true
    },
    fileName: String,
    fileType: String,
  }],

  // Gemini Analysis Results
  analysisData: {
    components: [ComponentSchema],
    modelMetadata: ModelMetadataSchema,
    processingTime: Number,
    analysisDate: { type: Date, default: Date.now }
  },

  requirements: {
    supplierPriority: [{
      type: String,
      enum: ['quality', 'price', 'reliability', 'established-company', 'support', 'returns-warranty']
    }],
    sourcingLocation: String,
    deliveryLocation: String,
    complianceRequirements: [{
      type: String,
      enum: ['ISO9001', 'AS9100', 'ISO14001', 'RoHS', 'REACH', 'CE', 'FDA', 'UL']
    }],
    leadTime: String,
    paymentTerms: {
      type: String,
      enum: ['Net 30', 'Net 60', 'Net 90', 'Milestone-based', '2/10 Net 30', 'COD', 'Letter of Credit']
    },
    additionalRequirements: String
  },

  // BOM Summary (for quick access without loading BOM collection)
  bomSummary: {
    activeVersion: {
      type: String,
      enum: ['alpha', 'beta', 'final']
    },
    totalVersions: { type: Number, default: 0 },
    totalComponents: { type: Number, default: 0 },
    totalValue: Number,
    lastUpdated: Date
  },

  // Workflow tracking
  currentStep: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
}, {
  timestamps: true,
  collection: 'rfqs_new'
});

// Indexes for performance
RFQSchema.index({ rfqId: 1 });
RFQSchema.index({ createdBy: 1, status: 1 });
RFQSchema.index({ status: 1, createdAt: -1 });
RFQSchema.index({ 'requirements.deliveryLocation': 1 });

// Pre-save middleware for RFQ number generation
RFQSchema.pre('save', async function (next) {
  if (this.isNew && !this.rfqId) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.rfqId = `RFQ-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Instance methods
RFQSchema.methods.updateBOMSummary = async function () {
  const BOM = mongoose.model('BOM');
  const bomVersions = await BOM.find({ rfqId: this.rfqId });

  this.bomSummary.totalVersions = bomVersions.length;
  this.bomSummary.totalComponents = bomVersions.reduce((total, bom) =>
    total + (bom.components ? bom.components.length : 0), 0);
  this.bomSummary.lastUpdated = new Date();

  return this.save();
};

RFQSchema.methods.toSummary = function () {
  return {
    id: this._id.toString(),
    rfqId: this.rfqId,
    status: this.status,
    createdBy: this.createdBy,
    currentStep: this.currentStep,
    requirements: this.requirements,
    bomSummary: this.bomSummary,
    documentsCount: this.documents.length,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static methods
RFQSchema.statics.findByUser = function (userId, status = null) {
  const query = { createdBy: userId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ updatedAt: -1 });
};

RFQSchema.statics.getAnalytics = function (userId) {
  return this.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalComponents: { $sum: '$bomSummary.totalComponents' },
        avgValue: { $avg: '$bomSummary.totalValue' }
      }
    }
  ]);
};

module.exports = mongoose.model('RFQNew', RFQSchema);
