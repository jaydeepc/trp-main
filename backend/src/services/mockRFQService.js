class MockRFQService {
  constructor() {
    // In-memory storage for mock RFQs
    this.rfqs = new Map();
    this.nextId = 1;
  }

  // Generate a mock RFQ ID
  generateId() {
    return `rfq-${this.nextId++}`;
  }

  // Create a mock RFQ
  createRFQ(userId) {
    const id = this.generateId();
    const rfq = {
      _id: id,
      userId,
      status: 'draft',
      currentStep: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      sourceDocument: null,
      components: [],
      analysisResults: null,
      commercialTerms: null,
      stepCompletions: {},
      sentAt: null
    };
    
    this.rfqs.set(id, rfq);
    return this.formatRFQ(rfq);
  }

  // Get RFQs for a user
  getRFQs(userId, status = null, limit = 20, page = 1) {
    const userRFQs = Array.from(this.rfqs.values())
      .filter(rfq => rfq.userId === userId)
      .filter(rfq => !status || rfq.status === status)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const total = userRFQs.length;
    const startIndex = (page - 1) * limit;
    const items = userRFQs.slice(startIndex, startIndex + limit);

    return {
      items: items.map(rfq => this.formatRFQ(rfq)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get a specific RFQ
  getRFQ(id, userId) {
    const rfq = this.rfqs.get(id);
    if (!rfq || rfq.userId !== userId) {
      return null;
    }
    return this.formatRFQ(rfq);
  }

  // Update RFQ
  updateRFQ(id, userId, updates) {
    const rfq = this.rfqs.get(id);
    if (!rfq || rfq.userId !== userId) {
      return null;
    }

    Object.assign(rfq, updates, { updatedAt: new Date() });
    this.rfqs.set(id, rfq);
    return this.formatRFQ(rfq);
  }

  // Delete RFQ
  deleteRFQ(id, userId) {
    const rfq = this.rfqs.get(id);
    if (!rfq || rfq.userId !== userId) {
      return false;
    }
    return this.rfqs.delete(id);
  }

  // Mark step as complete
  markStepComplete(id, userId, step, metadata = {}) {
    const rfq = this.rfqs.get(id);
    if (!rfq || rfq.userId !== userId) {
      return null;
    }

    rfq.stepCompletions[step] = {
      completedAt: new Date(),
      metadata
    };
    rfq.updatedAt = new Date();
    
    this.rfqs.set(id, rfq);
    return this.formatRFQ(rfq);
  }

  // Get analytics data
  getAnalyticsData(userId) {
    const userRFQs = Array.from(this.rfqs.values())
      .filter(rfq => rfq.userId === userId);

    const analytics = {};
    userRFQs.forEach(rfq => {
      if (!analytics[rfq.status]) {
        analytics[rfq.status] = {
          _id: rfq.status,
          count: 0,
          totalComponents: 0
        };
      }
      analytics[rfq.status].count++;
      analytics[rfq.status].totalComponents += rfq.components.length;
    });

    return Object.values(analytics);
  }

  // Format RFQ for response (similar to toSummary method)
  formatRFQ(rfq) {
    return {
      id: rfq._id,
      status: rfq.status,
      currentStep: rfq.currentStep,
      createdAt: rfq.createdAt,
      updatedAt: rfq.updatedAt,
      sourceDocument: rfq.sourceDocument,
      components: rfq.components,
      analysisResults: rfq.analysisResults,
      commercialTerms: rfq.commercialTerms,
      stepCompletions: rfq.stepCompletions,
      sentAt: rfq.sentAt,
      // Summary fields
      componentsCount: rfq.components.length,
      isComplete: rfq.status === 'sent' || rfq.status === 'completed',
      progress: this.calculateProgress(rfq)
    };
  }

  // Calculate progress percentage
  calculateProgress(rfq) {
    const totalSteps = 4;
    const completedSteps = Object.keys(rfq.stepCompletions).length;
    return Math.round((completedSteps / totalSteps) * 100);
  }

  // Initialize with some sample data
  initializeSampleData() {
    // Create a sample RFQ for demo purposes
    const sampleRFQ = this.createRFQ('demo-user-001');
    
    // Update it with some sample data
    this.updateRFQ(sampleRFQ.id, 'demo-user-001', {
      status: 'in-progress',
      currentStep: 2,
      sourceDocument: {
        fileName: 'sample-design.pdf',
        fileType: 'pdf',
        fileCategory: 'engineering-design',
        fileSize: 2048576,
        processingMode: 'ai-analysis',
        analysisType: 'GENERATED_ZBC'
      },
      components: [
        {
          id: 'comp-001',
          partName: 'Aluminum Mounting Bracket',
          partNumber: 'BR-001-AL',
          quantity: 10,
          material: 'Aluminum 6061-T6',
          estimatedCost: 109.04
        },
        {
          id: 'comp-002',
          partName: 'Stainless Steel Fastener',
          partNumber: 'FS-M6-SS',
          quantity: 40,
          material: 'Stainless Steel 316L',
          estimatedCost: 3.25
        }
      ]
    });

    this.markStepComplete(sampleRFQ.id, 'demo-user-001', 1, {
      documentProcessed: true,
      componentsCount: 2
    });
  }
}

// Create singleton instance
const mockRFQService = new MockRFQService();

// Initialize with sample data
mockRFQService.initializeSampleData();

module.exports = mockRFQService;
