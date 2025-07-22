export class AvatarService {
  private static instance: AvatarService;
  private apiKey: string;

  private constructor() {
    this.apiKey = process.env.REACT_APP_HEYGEN_API_KEY || 'NmEwMGUxNzNiZmM2NGM2ZWIzM2Q4ZWI4ZWRlZGY3Y2ItMTcyNjQ2MzMxMQ==';
  }

  public static getInstance(): AvatarService {
    if (!AvatarService.instance) {
      AvatarService.instance = new AvatarService();
    }
    return AvatarService.instance;
  }

  async fetchAccessToken(): Promise<string> {
    try {
      // For now, return the provided API key directly
      // In production, this should be handled by your backend
      return this.apiKey;
    } catch (error) {
      console.error('Error fetching access token:', error);
      throw error;
    }
  }

  // Process user input and generate appropriate responses
  async processUserInput(input: string, context: 'greeting' | 'rfq-creation' | 'bom-analysis' | 'dashboard' = 'greeting'): Promise<string> {
    const lowerInput = input.toLowerCase();
    
    // Greeting responses
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey') || lowerInput.includes('good morning') || lowerInput.includes('good afternoon')) {
      return "Hello! I'm Robbie, your AI procurement assistant. I'm here to help you streamline your procurement process. I can help you create smart RFQs, analyze BOMs, find suppliers, or review your procurement analytics. What would you like to work on today?";
    }
    
    // RFQ Creation
    if (lowerInput.includes('create') || lowerInput.includes('new') || lowerInput.includes('rfq') || lowerInput.includes('request for quote') || lowerInput.includes('procurement')) {
      return "Excellent! I'll help you create a new smart RFQ. I can guide you through the entire process - from defining requirements to finding the best suppliers. What type of components or materials are you looking to procure? For example, electronic components, mechanical parts, or raw materials?";
    }
    
    // BOM Analysis
    if (lowerInput.includes('bom') || lowerInput.includes('bill of materials') || lowerInput.includes('analyze') || lowerInput.includes('upload') || lowerInput.includes('document')) {
      return "Perfect! I can analyze your Bill of Materials and provide intelligent insights. I'll help identify components, suggest alternative parts, find optimal suppliers, and estimate costs. You can upload your BOM file, design documents, or even describe your requirements, and I'll take care of the rest.";
    }
    
    // Supplier Management
    if (lowerInput.includes('supplier') || lowerInput.includes('vendor') || lowerInput.includes('find') || lowerInput.includes('recommend')) {
      return "I can help you find the best suppliers for your needs! I have access to a database of 200+ verified suppliers across different categories. I'll match you with trusted partners based on your requirements for quality, cost, delivery time, and compliance standards. What type of suppliers are you looking for?";
    }
    
    // Dashboard and Analytics
    if (lowerInput.includes('dashboard') || lowerInput.includes('analytics') || lowerInput.includes('metrics') || lowerInput.includes('report') || lowerInput.includes('data')) {
      return "I'd be happy to show you your procurement dashboard! It includes real-time analytics, supplier performance metrics, cost optimization insights, and AI-powered recommendations. You can view procurement trends, supplier trust scores, and identify opportunities for savings. Would you like me to navigate you there?";
    }
    
    // Help and Capabilities
    if (lowerInput.includes('help') || lowerInput.includes('what can you do') || lowerInput.includes('capabilities') || lowerInput.includes('features')) {
      return "I'm your comprehensive procurement assistant! Here's what I can help you with: 1) Create smart RFQs with AI-powered supplier matching, 2) Analyze BOMs and suggest optimizations, 3) Find and evaluate suppliers from our database of 200+ partners, 4) Set up commercial terms and compliance requirements, 5) Provide procurement analytics and insights. What would you like to start with?";
    }
    
    // Cost and Pricing
    if (lowerInput.includes('cost') || lowerInput.includes('price') || lowerInput.includes('budget') || lowerInput.includes('savings')) {
      return "I can help you optimize costs and find savings opportunities! I analyze supplier pricing, identify cost-effective alternatives, and provide market insights. Our AI has helped clients achieve an average of 15-20% cost savings. Would you like me to analyze your current procurement costs or help you create a cost-optimized RFQ?";
    }
    
    // Compliance and Quality
    if (lowerInput.includes('compliance') || lowerInput.includes('quality') || lowerInput.includes('certification') || lowerInput.includes('standard')) {
      return "Quality and compliance are crucial in procurement! I can help you find suppliers with the right certifications like ISO 9001, RoHS compliance, CE marking, and more. I'll ensure your suppliers meet all regulatory requirements and quality standards. What specific compliance requirements do you have?";
    }
    
    // Timeline and Delivery
    if (lowerInput.includes('delivery') || lowerInput.includes('timeline') || lowerInput.includes('urgent') || lowerInput.includes('when') || lowerInput.includes('time')) {
      return "I understand timing is important! I can help you find suppliers who can meet your delivery requirements, whether it's urgent orders or planned procurement. I'll match you with suppliers based on their lead times and delivery capabilities. What's your target timeline for this procurement?";
    }
    
    // Default response with more context
    return "I'm here to help with all your procurement needs! I specialize in creating smart RFQs, analyzing BOMs, finding optimal suppliers, and providing procurement insights. Could you tell me more about what specific procurement task you'd like assistance with? For example, are you looking to source new components, analyze existing suppliers, or create a new RFQ?";
  }

  // Extract form data from conversation
  extractFormData(conversation: string[]): Partial<any> {
    const formData: any = {};
    const fullText = conversation.join(' ').toLowerCase();
    
    // Extract quantity
    const quantityMatch = fullText.match(/(\d+)\s*(pieces?|units?|pcs?)/i);
    if (quantityMatch) {
      formData.quantity = parseInt(quantityMatch[1]);
    }
    
    // Extract component types
    if (fullText.includes('electronic') || fullText.includes('component')) {
      formData.category = 'Electronics';
    }
    if (fullText.includes('mechanical') || fullText.includes('hardware')) {
      formData.category = 'Mechanical';
    }
    
    // Extract urgency/timeline
    if (fullText.includes('urgent') || fullText.includes('asap')) {
      formData.urgency = 'High';
    }
    if (fullText.includes('week')) {
      formData.timeline = 'weeks';
    }
    if (fullText.includes('month')) {
      formData.timeline = 'months';
    }
    
    return formData;
  }
}

export const avatarService = AvatarService.getInstance();
