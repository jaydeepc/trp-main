const mongoose = require('mongoose');
const { ComponentSchema } = require('./schemas/CommonSchemas');

// Supplier Schema (specific to BOM context)
const BOMSupplierSchema = new mongoose.Schema({
  componentId: String,
  name: String,
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  location: String,
  certifications: [String],
  pricing: {
    unitCost: Number,
    currency: { type: String, default: 'USD' }
  },
  leadTime: String,
  reliability: {
    trustScore: { type: Number, min: 0, max: 10 }
  },
}, { _id: false });

// Enhanced Component Schema for BOM (extends base ComponentSchema)
const BOMComponentSchema = new mongoose.Schema({
  id: { type: String },
  partNumber: String,
  name: { type: String },
  description: String,
  specifications: String,
  quantity: { type: Number, min: 1 },
  costRange: String,

  // Alternative Components
  alternatives: [{
    id: String,
    partNumber: String,
    name: String,
    description: String,
    specifications: String,
    costRange: String,
    recommendationReason: String,
    suppliers: [BOMSupplierSchema]
  }],

  // Suppliers for this component (main + alternatives)
  suppliers: [BOMSupplierSchema]
}, { _id: false });

// Main BOM Schema
const BOMSchema = new mongoose.Schema({
  rfqId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['alpha', 'beta', 'final'],
    required: true,
    index: true
  },
  version: Number, // e.g., 1, 2, 3...

  components: [BOMComponentSchema],

  // BOM Metadata
  metadata: {
    createdFrom: {
      type: String,
      enum: ['analysis', 'manual', 'import']
    },
    totalValue: Number,
    currency: { type: String, default: 'USD' },
    estimatedLeadTime: String,
    notes: String
  },

  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'rejected'],
    default: 'draft'
  },

  approvedBy: String,
  approvedAt: Date
}, {
  timestamps: true,
  collection: 'boms'
});

// Compound indexes for performance
BOMSchema.index({ rfqId: 1, type: 1 });
BOMSchema.index({ rfqId: 1, createdAt: -1 });
BOMSchema.index({ type: 1, status: 1 });

// Pre-save middleware to auto-generate version
BOMSchema.pre('save', async function (next) {
  if (this.isNew && !this.version) {
    const existingVersions = await this.constructor.find({
      rfqId: this.rfqId,
      type: this.type
    }).countDocuments();

    this.version = existingVersions + 1;
  }

  // Calculate total value from suppliers
  if (this.components && this.components.length > 0) {
    this.metadata.totalValue = this.components.reduce((total, component) => {
      // Get lowest cost from suppliers
      const lowestCost = component.suppliers?.reduce((min, supplier) => {
        const cost = supplier.pricing?.unitCost || 0;
        return cost < min ? cost : min;
      }, Infinity) || 0;
      
      return total + (lowestCost * (component.quantity || 1));
    }, 0);
  }

  next();
});

// Instance methods
BOMSchema.methods.getComponentCount = function () {
  return this.components ? this.components.length : 0;
};

BOMSchema.methods.getTotalSuppliers = function () {
  if (!this.components) return 0;
  return this.components.reduce((total, component) => {
    return total + (component.suppliers ? component.suppliers.length : 0);
  }, 0);
};

BOMSchema.methods.getComponentById = function (componentId) {
  return this.components ? this.components.find(c => c.id === componentId) : null;
};

BOMSchema.methods.toSummary = function () {
  return {
    id: this._id.toString(),
    rfqId: this.rfqId,
    type: this.type,
    version: this.version,
    status: this.status,
    componentCount: this.getComponentCount(),
    supplierCount: this.getTotalSuppliers(),
    totalValue: this.metadata?.totalValue,
    currency: this.metadata?.currency,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static methods
BOMSchema.statics.findByRFQ = function (rfqId) {
  return this.find({ rfqId }).sort({ type: 1, createdAt: -1 });
};

BOMSchema.statics.findActiveByRFQ = function (rfqId) {
  return this.findOne({
    rfqId,
    status: { $in: ['review', 'approved'] }
  }).sort({ createdAt: -1 });
};

BOMSchema.statics.getLatestVersion = function (rfqId, type) {
  return this.findOne({ rfqId, type }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('BOM', BOMSchema);
