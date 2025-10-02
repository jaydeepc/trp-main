const mongoose = require('mongoose');

// Schema for baseline analysis
const baselineAnalysisSchema = new mongoose.Schema({
  primaryCategory: String,
  manufacturer: String,
  keySpecifications: String,
  baselinePriceINR: Number,
  sourceURL: String,
  productPageURL: String
}, { _id: false });

// Schema for landed cost calculation
const landedCostSchema = new mongoose.Schema({
  localCurrencyPrice: Number,
  exchangeRateUsed: Number,
  estimatedShippingINR: Number,
  estimatedCustomsINR: Number,
  totalLandedCostINR: Number
}, { _id: false });

// Schema for alternative suppliers
const alternativeSupplierSchema = new mongoose.Schema({
  supplierName: String,
  supplierURL: String,
  productPageURL: String,
  primaryCategory: String,
  manufacturer: String,
  keySpecifications: String,
  classification: String, // 1-10 categories
  landedCostINR: landedCostSchema,
  alternative_component_better_in_which_ways: String
}, { _id: false });

// Schema for individual component research
const componentResearchSchema = new mongoose.Schema({
  partName: String,
  description: String,
  quantity: Number,
  unitCostINR: Number,
  totalCostINR: Number,
  baselineAnalysis: baselineAnalysisSchema,
  alternativeSuppliers: [alternativeSupplierSchema]
}, { _id: false });

// Main SupplierResearch schema
const supplierResearchSchema = new mongoose.Schema({
  rfqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: true,
    index: true
  },
  rfqNumber: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'completed'
  },
  
  // Core research data
  supplierResearch: [componentResearchSchema],
  
  // Processing metadata
  processingTime: {
    type: Number, // in milliseconds
    required: true
  },
  totalComponents: {
    type: Number,
    required: true
  },
  searchQueriesUsed: [String], // Store the actual search queries
  sourcesFound: {
    type: Number,
    default: 0
  },
  
  // Summary statistics
  totalAlternativeSuppliers: {
    type: Number,
    default: 0
  },
  averageAlternativesPerComponent: {
    type: Number,
    default: 0
  },
  
  // Original components for reference
  originalComponents: [{
    partNumber: String,
    description: String,
    quantity: Number,
    specifications: mongoose.Schema.Types.Mixed
  }],
  
  // Error handling
  error: {
    message: String,
    stack: String,
    timestamp: Date
  }
}, {
  timestamps: true,
  collection: 'supplierresearch'
});

// Indexes for better query performance
supplierResearchSchema.index({ rfqId: 1, status: 1 });
supplierResearchSchema.index({ userId: 1, createdAt: -1 });
supplierResearchSchema.index({ rfqNumber: 1 });
supplierResearchSchema.index({ createdAt: -1 });

// Virtual for getting research summary
supplierResearchSchema.virtual('summary').get(function() {
  if (!this.supplierResearch || !Array.isArray(this.supplierResearch)) {
    return null;
  }
  
  const totalAlternatives = this.supplierResearch.reduce((sum, component) => {
    return sum + (component.alternativeSuppliers ? component.alternativeSuppliers.length : 0);
  }, 0);
  
  return {
    totalComponents: this.supplierResearch.length,
    totalAlternatives,
    avgAlternativesPerComponent: this.supplierResearch.length > 0 ? 
      (totalAlternatives / this.supplierResearch.length).toFixed(2) : 0,
    processingTimeMinutes: (this.processingTime / 60000).toFixed(2),
    sourcesFound: this.sourcesFound,
    searchQueriesCount: this.searchQueriesUsed ? this.searchQueriesUsed.length : 0
  };
});

// Method to calculate statistics
supplierResearchSchema.methods.calculateStatistics = function() {
  if (!this.supplierResearch || !Array.isArray(this.supplierResearch)) {
    return;
  }
  
  const totalAlternatives = this.supplierResearch.reduce((sum, component) => {
    return sum + (component.alternativeSuppliers ? component.alternativeSuppliers.length : 0);
  }, 0);
  
  this.totalAlternativeSuppliers = totalAlternatives;
  this.averageAlternativesPerComponent = this.supplierResearch.length > 0 ? 
    totalAlternatives / this.supplierResearch.length : 0;
};

// Pre-save middleware to calculate statistics
supplierResearchSchema.pre('save', function(next) {
  this.calculateStatistics();
  next();
});

// Static method to find by RFQ
supplierResearchSchema.statics.findByRFQ = function(rfqId) {
  return this.findOne({ rfqId }).populate('rfqId', 'rfqNumber status');
};

// Static method to find by user
supplierResearchSchema.statics.findByUser = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('rfqId', 'rfqNumber status');
};

// Ensure virtual fields are serialized
supplierResearchSchema.set('toJSON', { virtuals: true });
supplierResearchSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SupplierResearch', supplierResearchSchema);
