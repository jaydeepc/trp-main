const mongoose = require('mongoose');

// Component Schema for Smart BoM
const ComponentSchema = new mongoose.Schema({
  partName: {
    type: String,
    required: true
  },
  partNumber: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  material: String,
  dimensions: String,
  process: String,
  
  // AI Suggestions
  aiSuggestedAlternative: String,
  
  // Compliance
  complianceStatus: {
    type: String,
    enum: ['compliant', 'pending', 'non-compliant', 'unknown'],
    default: 'unknown'
  },
  complianceFlags: [{
    type: {
      type: String,
      enum: ['success', 'warning', 'error']
    },
    text: String,
    icon: String
  }],
  
  // Risk Assessment
  riskFlag: {
    level: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'unknown'],
      default: 'unknown'
    },
    color: {
      type: String,
      enum: ['green', 'yellow', 'red', 'gray'],
      default: 'gray'
    }
  },
  
  // Supplier Information
  aiRecommendedRegion: String,
  
  // Pricing
  predictedMarketRange: String,
  
  // ZBC Data
  zbcShouldCost: String,
  zbcVariance: String,
  zbcSource: {
    type: String,
    enum: ['AI Generated', 'Professional Report', 'Manual Entry']
  },
  
  // Metadata
  confidence: Number,
  notes: String,
  
  // Raw analysis data (for detailed views)
  rawData: {
    component: mongoose.Schema.Types.Mixed,
    suggestions: mongoose.Schema.Types.Mixed,
    prices: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Commercial Terms Schema
const CommercialTermsSchema = new mongoose.Schema({
  desiredLeadTime: {
    type: String,
    required: true
  },
  paymentTerms: {
    type: String,
    required: true,
    enum: ['Net 30', 'Net 60', 'Milestone-based', '2/10 Net 30', 'Cash on Delivery', 'Letter of Credit']
  },
  deliveryLocation: {
    type: String,
    required: true
  },
  complianceRequirements: [{
    type: String,
    enum: ['ISO 9001', 'AS9100', 'ISO 14001', 'OHSAS 18001', 'RoHS', 'REACH', 'FDA', 'CE Marking', 'UL Listed']
  }],
  additionalRequirements: String
}, {
  timestamps: true
});

// Main RFQ Schema
const RFQSchema = new mongoose.Schema({
  // User Information
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // RFQ Identification
  rfqNumber: {
    type: String,
    unique: true,
    required: false // Will be generated in pre-save middleware
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'completed', 'sent', 'cancelled'],
    default: 'draft'
  },
  
  // Document Processing Information
  sourceDocument: {
    fileName: String,
    fileType: String,
    fileCategory: String,
    fileSize: Number,
    processingMode: {
      type: String,
      enum: ['mock', 'gemini']
    },
    analysisType: {
      type: String,
      enum: ['GENERATED_ZBC', 'EXTRACTED_ZBC', 'BOM_PROCESSING']
    }
  },
  
  // Smart BoM Components
  components: [ComponentSchema],
  
  // Commercial Terms
  commercialTerms: CommercialTermsSchema,
  
  // Analysis Results (raw data from AI processing)
  analysisResults: {
    analysis: mongoose.Schema.Types.Mixed,
    suggestions: mongoose.Schema.Types.Mixed,
    marketPrices: mongoose.Schema.Types.Mixed,
    processingInfo: mongoose.Schema.Types.Mixed
  },
  
  // Summary Statistics
  summary: {
    totalComponents: {
      type: Number,
      default: 0
    },
    estimatedTotalValue: Number,
    averageZBCVariance: Number,
    highRiskComponents: {
      type: Number,
      default: 0
    },
    complianceIssues: {
      type: Number,
      default: 0
    }
  },
  
  // Workflow Steps
  currentStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 4
  },
  
  completedSteps: [{
    step: Number,
    completedAt: Date,
    data: mongoose.Schema.Types.Mixed
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  sentAt: Date,
  
  // Additional metadata
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Version control for drafts
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes for performance
RFQSchema.index({ userId: 1, status: 1 });
RFQSchema.index({ rfqNumber: 1 });
RFQSchema.index({ createdAt: -1 });
RFQSchema.index({ 'sourceDocument.analysisType': 1 });

// Pre-save middleware to generate RFQ number
RFQSchema.pre('save', async function(next) {
  if (this.isNew && !this.rfqNumber) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.rfqNumber = `RFQ-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  
  // Update summary statistics
  this.summary.totalComponents = this.components.length;
  this.summary.highRiskComponents = this.components.filter(c => c.riskFlag.level === 'High').length;
  this.summary.complianceIssues = this.components.filter(c => c.complianceStatus === 'non-compliant').length;
  
  // Calculate average ZBC variance
  const variances = this.components
    .map(c => c.zbcVariance)
    .filter(v => v && v !== 'N/A')
    .map(v => parseFloat(v.replace('%', '')));
  
  if (variances.length > 0) {
    this.summary.averageZBCVariance = variances.reduce((a, b) => a + b, 0) / variances.length;
  }
  
  this.updatedAt = new Date();
  next();
});

// Instance methods
RFQSchema.methods.toSummary = function() {
  return {
    id: this._id.toString(),
    rfqNumber: this.rfqNumber,
    status: this.status,
    currentStep: this.currentStep,
    userId: this.userId,
    sourceDocument: this.sourceDocument,
    components: this.components,
    commercialTerms: this.commercialTerms,
    summary: this.summary,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    sentAt: this.sentAt
  };
};

RFQSchema.methods.markStepComplete = function(step, data = {}) {
  this.completedSteps.push({
    step,
    completedAt: new Date(),
    data
  });
  
  if (step > this.currentStep) {
    this.currentStep = step;
  }
};

// Static methods
RFQSchema.statics.findByUser = function(userId, status = null) {
  const query = { userId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ updatedAt: -1 });
};

RFQSchema.statics.getAnalyticsData = function(userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalComponents: { $sum: '$summary.totalComponents' },
        avgZBCVariance: { $avg: '$summary.averageZBCVariance' }
      }
    }
  ]);
};

module.exports = mongoose.model('RFQ', RFQSchema);
