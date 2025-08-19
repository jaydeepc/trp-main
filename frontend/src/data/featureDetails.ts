// Comprehensive feature details for the DetailModal system
// This contains mocked data for all system features

export interface FeatureDetail {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    category: 'core' | 'analysis' | 'intelligence' | 'automation' | 'optimization' | 'integration';
    description: string;
    keyFeatures: string[];
    technicalSpecs: {
        accuracy?: string;
        speed?: string;
        capacity?: string;
        uptime?: string;
        coverage?: string;
    };
    benefits: string[];
    useCases: string[];
    integrations?: string[];
    metrics?: {
        label: string;
        value: string;
        trend?: 'up' | 'down' | 'stable';
    }[];
    demoData?: any;
    relatedFeatures?: string[];
}

export const featureDetails: Record<string, FeatureDetail> = {
    // Core System Features
    'voice-interface': {
        id: 'voice-interface',
        title: 'Voice-First Interface',
        subtitle: 'Natural Language Processing',
        icon: 'Mic',
        category: 'core',
        description: 'Advanced voice recognition system powered by Google Gemini Live API that understands natural language commands and provides conversational interactions for procurement workflows.',
        keyFeatures: [
            'Real-time speech recognition with 98.5% accuracy',
            'Natural language understanding for complex queries',
            'Multi-language support (English, Spanish, French, German)',
            'Context-aware conversation management',
            'Voice-activated function calling',
            'Noise cancellation and audio optimization'
        ],
        technicalSpecs: {
            accuracy: '98.5%',
            speed: '<200ms response time',
            capacity: 'Unlimited concurrent sessions',
            coverage: '15+ languages supported'
        },
        benefits: [
            'Hands-free operation for busy procurement professionals',
            'Faster data entry and navigation',
            'Reduced learning curve for new users',
            'Improved accessibility for all users',
            'Natural, intuitive interaction model'
        ],
        useCases: [
            'Upload and analyze BOM files by voice command',
            'Query supplier information conversationally',
            'Navigate through procurement workflows hands-free',
            'Get instant answers about system capabilities',
            'Voice-guided RFQ creation process'
        ],
        metrics: [
            { label: 'Recognition Accuracy', value: '98.5%', trend: 'up' },
            { label: 'Response Time', value: '<200ms', trend: 'stable' },
            { label: 'User Satisfaction', value: '4.9/5', trend: 'up' },
            { label: 'Daily Voice Commands', value: '12,450', trend: 'up' }
        ],
        relatedFeatures: ['bom-analysis', 'supplier-intelligence', 'system-info']
    },

    'bom-analysis': {
        id: 'bom-analysis',
        title: 'Smart BOM Analysis',
        subtitle: 'AI-Powered Cost Optimization',
        icon: 'BarChart3',
        category: 'analysis',
        description: 'Intelligent Bill of Materials analysis system that processes complex component lists, identifies cost optimization opportunities, and provides AI-driven recommendations for better procurement decisions.',
        keyFeatures: [
            'Automated component classification and categorization',
            'Real-time market price analysis and comparison',
            'Should-cost modeling with variance analysis',
            'Risk assessment for supply chain disruptions',
            'Alternative component suggestions with reasoning',
            'Compliance checking against industry standards'
        ],
        technicalSpecs: {
            accuracy: '94.2%',
            speed: '2.3 seconds average processing',
            capacity: '10,000+ components per analysis',
            coverage: '500+ component categories'
        },
        benefits: [
            'Average 12.8% cost reduction on analyzed BOMs',
            'Faster procurement decision making',
            'Reduced supply chain risks',
            'Improved component standardization',
            'Enhanced regulatory compliance'
        ],
        useCases: [
            'Automotive infotainment system BOM optimization',
            'Aerospace component cost analysis',
            'Medical device compliance verification',
            'Consumer electronics cost benchmarking',
            'Industrial equipment sourcing optimization'
        ],
        demoData: {
            sampleBOM: 'Mercedes-Benz Infotainment System',
            componentsAnalyzed: 847,
            costSavingsIdentified: '€127,450',
            riskComponentsFound: 23,
            alternativesRecommended: 156
        },
        metrics: [
            { label: 'Analysis Accuracy', value: '94.2%', trend: 'up' },
            { label: 'Processing Speed', value: '2.3s', trend: 'up' },
            { label: 'Cost Savings', value: '12.8%', trend: 'up' },
            { label: 'BOMs Processed', value: '8,947', trend: 'up' }
        ],
        relatedFeatures: ['supplier-intelligence', 'cost-optimization', 'compliance-automation']
    },

    'supplier-intelligence': {
        id: 'supplier-intelligence',
        title: 'Supplier Intelligence',
        subtitle: 'Global Network Analytics',
        icon: 'Users',
        category: 'intelligence',
        description: 'Comprehensive supplier intelligence platform that maintains real-time data on 200+ pre-qualified suppliers across multiple regions, providing trust scores, performance metrics, and risk assessments.',
        keyFeatures: [
            'Real-time supplier performance tracking',
            'Multi-dimensional trust scoring algorithm',
            'Geographic risk assessment and mapping',
            'Financial stability monitoring',
            'Quality certification verification',
            'Delivery performance analytics'
        ],
        technicalSpecs: {
            coverage: '200+ pre-qualified suppliers',
            accuracy: '96.7% trust score accuracy',
            uptime: '99.9% data availability',
            capacity: 'Global coverage across 45+ countries'
        },
        benefits: [
            'Reduced supplier onboarding time by 60%',
            'Improved supplier selection accuracy',
            'Enhanced supply chain risk management',
            'Better negotiation leverage with data insights',
            'Streamlined vendor management processes'
        ],
        useCases: [
            'New supplier qualification and assessment',
            'Existing supplier performance monitoring',
            'Risk-based supplier portfolio optimization',
            'Geographic diversification planning',
            'Supplier relationship management'
        ],
        demoData: {
            totalSuppliers: 247,
            regionscovered: ['North America', 'Europe', 'Asia Pacific', 'Latin America'],
            averageTrustScore: 8.4,
            topPerformingRegion: 'Europe',
            riskAlerts: 12
        },
        metrics: [
            { label: 'Supplier Network', value: '247', trend: 'up' },
            { label: 'Trust Score Accuracy', value: '96.7%', trend: 'stable' },
            { label: 'Risk Predictions', value: '89.3%', trend: 'up' },
            { label: 'Onboarding Speed', value: '60% faster', trend: 'up' }
        ],
        relatedFeatures: ['bom-analysis', 'cost-optimization', 'global-integration']
    },

    'compliance-automation': {
        id: 'compliance-automation',
        title: 'Compliance Automation',
        subtitle: 'Regulatory Standards Engine',
        icon: 'CheckCircle',
        category: 'automation',
        description: 'Automated compliance verification system that checks components and suppliers against automotive, aerospace, medical, and other industry standards with 99.1% success rate.',
        keyFeatures: [
            'Multi-industry standard compliance checking',
            'Automated regulatory documentation generation',
            'Real-time compliance status monitoring',
            'Exception handling and alert system',
            'Audit trail and documentation management',
            'Integration with certification databases'
        ],
        technicalSpecs: {
            accuracy: '99.1% compliance verification',
            coverage: '50+ industry standards',
            speed: 'Real-time verification',
            capacity: 'Unlimited component checking'
        },
        benefits: [
            'Reduced compliance-related delays by 85%',
            'Minimized regulatory risk exposure',
            'Automated documentation generation',
            'Improved audit readiness',
            'Enhanced supplier qualification process'
        ],
        useCases: [
            'Automotive IATF 16949 compliance verification',
            'Aerospace AS9100 standard checking',
            'Medical device ISO 13485 compliance',
            'RoHS and REACH regulation verification',
            'Export control and trade compliance'
        ],
        demoData: {
            standardsSupported: 52,
            complianceChecks: 15847,
            successRate: '99.1%',
            averageVerificationTime: '1.2 seconds',
            documentsGenerated: 3421
        },
        metrics: [
            { label: 'Success Rate', value: '99.1%', trend: 'stable' },
            { label: 'Standards Covered', value: '52', trend: 'up' },
            { label: 'Time Saved', value: '85%', trend: 'up' },
            { label: 'Checks Performed', value: '15,847', trend: 'up' }
        ],
        relatedFeatures: ['bom-analysis', 'supplier-intelligence', 'global-integration']
    },

    'cost-optimization': {
        id: 'cost-optimization',
        title: 'Cost Optimization',
        subtitle: 'Should-Cost Intelligence',
        icon: 'DollarSign',
        category: 'optimization',
        description: 'Advanced cost optimization engine that uses AI-driven should-cost modeling to identify savings opportunities, benchmark prices, and provide actionable recommendations for procurement cost reduction.',
        keyFeatures: [
            'AI-powered should-cost modeling',
            'Real-time market price benchmarking',
            'Cost variance analysis and reporting',
            'Savings opportunity identification',
            'ROI calculation and tracking',
            'Negotiation support with data insights'
        ],
        technicalSpecs: {
            accuracy: '91.5% cost prediction accuracy',
            coverage: '1M+ component price points',
            speed: 'Real-time cost analysis',
            capacity: 'Unlimited cost scenarios'
        },
        benefits: [
            'Average 12.8% cost reduction achieved',
            'Improved negotiation outcomes',
            'Better budget planning and forecasting',
            'Enhanced cost visibility and control',
            'Data-driven procurement decisions'
        ],
        useCases: [
            'BOM cost optimization and variance analysis',
            'Supplier price benchmarking and negotiation',
            'Budget planning and cost forecasting',
            'Make-vs-buy decision support',
            'Cost reduction initiative tracking'
        ],
        demoData: {
            averageSavings: '12.8%',
            totalSavingsGenerated: '€2.4M',
            costAnalysesPerformed: 5632,
            benchmarkDataPoints: '1.2M+',
            negotiationWinRate: '78%'
        },
        metrics: [
            { label: 'Cost Reduction', value: '12.8%', trend: 'up' },
            { label: 'Prediction Accuracy', value: '91.5%', trend: 'up' },
            { label: 'Total Savings', value: '€2.4M', trend: 'up' },
            { label: 'Negotiation Success', value: '78%', trend: 'stable' }
        ],
        relatedFeatures: ['bom-analysis', 'supplier-intelligence', 'voice-interface']
    },

    'global-integration': {
        id: 'global-integration',
        title: 'Global Integration',
        subtitle: 'Enterprise Connectivity',
        icon: 'Network',
        category: 'integration',
        description: 'Enterprise-grade integration platform that seamlessly connects with ERP, PLM, and procurement systems worldwide, ensuring 99.9% uptime and real-time data synchronization.',
        keyFeatures: [
            'Pre-built connectors for major ERP systems',
            'Real-time data synchronization',
            'API-first architecture with REST/GraphQL',
            'Enterprise security and compliance',
            'Multi-tenant cloud deployment',
            'Scalable microservices architecture'
        ],
        technicalSpecs: {
            uptime: '99.9% SLA guarantee',
            capacity: 'Unlimited API calls',
            speed: '<100ms API response time',
            coverage: '50+ system integrations'
        },
        benefits: [
            'Seamless workflow integration',
            'Reduced data silos and manual entry',
            'Improved data accuracy and consistency',
            'Faster deployment and onboarding',
            'Enhanced system interoperability'
        ],
        useCases: [
            'SAP ERP integration for procurement workflows',
            'PLM system integration for BOM management',
            'Supplier portal integration and data sync',
            'Financial system integration for cost tracking',
            'Quality management system connectivity'
        ],
        integrations: [
            'SAP S/4HANA', 'Oracle ERP Cloud', 'Microsoft Dynamics 365',
            'Workday', 'NetSuite', 'Infor CloudSuite', 'Epicor ERP',
            'PTC Windchill', 'Siemens Teamcenter', 'Dassault ENOVIA'
        ],
        metrics: [
            { label: 'System Uptime', value: '99.9%', trend: 'stable' },
            { label: 'API Response Time', value: '<100ms', trend: 'up' },
            { label: 'Integrations Active', value: '127', trend: 'up' },
            { label: 'Data Sync Success', value: '99.7%', trend: 'stable' }
        ],
        relatedFeatures: ['supplier-intelligence', 'compliance-automation', 'cost-optimization']
    },

    'system-info': {
        id: 'system-info',
        title: 'System Overview',
        subtitle: 'Platform Capabilities',
        icon: 'Bot',
        category: 'core',
        description: 'Comprehensive overview of the AI-powered procurement platform, showcasing all capabilities, performance metrics, and system status in an intuitive interface.',
        keyFeatures: [
            'Real-time system performance monitoring',
            'Interactive capability demonstrations',
            'Live metrics and analytics dashboard',
            'Feature usage tracking and insights',
            'System health and status indicators',
            'User onboarding and guidance'
        ],
        technicalSpecs: {
            uptime: '99.9% system availability',
            accuracy: '94.2% overall AI accuracy',
            speed: 'Sub-second response times',
            capacity: 'Enterprise-scale processing'
        },
        benefits: [
            'Complete visibility into system capabilities',
            'Real-time performance monitoring',
            'Guided user onboarding experience',
            'Transparent system metrics',
            'Continuous improvement insights'
        ],
        useCases: [
            'New user system orientation',
            'Feature discovery and exploration',
            'Performance monitoring and reporting',
            'System capability assessment',
            'Training and demonstration purposes'
        ],
        metrics: [
            { label: 'User Satisfaction', value: '4.8/5', trend: 'up' },
            { label: 'Feature Adoption', value: '87%', trend: 'up' },
            { label: 'System Reliability', value: '99.9%', trend: 'stable' },
            { label: 'Active Users', value: '2,847', trend: 'up' }
        ],
        relatedFeatures: ['voice-interface', 'bom-analysis', 'supplier-intelligence']
    },

    'file-upload': {
        id: 'file-upload',
        title: 'Document Upload',
        subtitle: 'Multi-Format Processing',
        icon: 'Upload',
        category: 'core',
        description: 'Advanced document processing system that handles multiple file formats including Excel, CSV, PDF, and XML for BOM analysis and procurement document management.',
        keyFeatures: [
            'Multi-format file support (Excel, CSV, PDF, XML)',
            'Drag-and-drop interface with progress tracking',
            'Automatic file validation and error detection',
            'Batch upload processing capabilities',
            'File preview and content verification',
            'Secure cloud storage with encryption'
        ],
        technicalSpecs: {
            capacity: 'Up to 100MB per file',
            speed: '5-10 seconds processing time',
            accuracy: '99.2% data extraction accuracy',
            coverage: '15+ file formats supported'
        },
        benefits: [
            'Streamlined document processing workflow',
            'Reduced manual data entry errors',
            'Faster BOM analysis initiation',
            'Improved data quality and consistency',
            'Enhanced user experience with visual feedback'
        ],
        useCases: [
            'BOM file upload for cost analysis',
            'Supplier documentation processing',
            'RFQ template and specification upload',
            'Compliance document verification',
            'Historical data import and migration'
        ],
        demoData: {
            filesProcessed: 12847,
            averageProcessingTime: '7.2 seconds',
            successRate: '99.2%',
            totalDataExtracted: '2.1M+ rows',
            supportedFormats: 15
        },
        metrics: [
            { label: 'Processing Success', value: '99.2%', trend: 'stable' },
            { label: 'Average Speed', value: '7.2s', trend: 'up' },
            { label: 'Files Processed', value: '12,847', trend: 'up' },
            { label: 'User Satisfaction', value: '4.7/5', trend: 'up' }
        ],
        relatedFeatures: ['bom-analysis', 'voice-interface', 'compliance-automation']
    }
};

// Helper function to get feature by ID
export const getFeatureDetail = (featureId: string): FeatureDetail | null => {
    return featureDetails[featureId] || null;
};

// Helper function to get features by category
export const getFeaturesByCategory = (category: FeatureDetail['category']): FeatureDetail[] => {
    return Object.values(featureDetails).filter(feature => feature.category === category);
};

// Helper function to search features
export const searchFeatures = (query: string): FeatureDetail[] => {
    const lowercaseQuery = query.toLowerCase();
    return Object.values(featureDetails).filter(feature => 
        feature.title.toLowerCase().includes(lowercaseQuery) ||
        feature.description.toLowerCase().includes(lowercaseQuery) ||
        feature.keyFeatures.some(f => f.toLowerCase().includes(lowercaseQuery))
    );
};
