// Comprehensive Mock Data for Project Robbie
// This file contains realistic procurement data for demonstration

// Supplier Categories and Regions
const supplierCategories = ['trusted', 'empanelled', 'new'];
const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'];
const certifications = [
  'ISO 9001', 'ISO 14001', 'ISO 27001', 'SOC 2', 'GDPR Compliant', 
  'FDA Approved', 'CE Marking', 'RoHS Compliant', 'REACH Compliant',
  'UL Listed', 'FCC Certified', 'Energy Star', 'LEED Certified'
];

// Component Categories for Precision Procurement
const componentCategories = [
  'Electronic Components', 'Mechanical Parts', 'Software Licenses',
  'Raw Materials', 'Packaging Materials', 'Testing Equipment',
  'Manufacturing Tools', 'Safety Equipment', 'Quality Control Instruments',
  'Precision Instruments', 'Optical Components', 'Sensors & Actuators',
  'Semiconductors', 'Circuit Boards', 'Connectors & Cables',
  'Power Supplies', 'Display Components', 'Memory Modules',
  'Processors & Controllers', 'Passive Components', 'Thermal Management',
  'Enclosures & Housings', 'Fasteners & Hardware', 'Adhesives & Sealants'
];

// Material Categories for Smart BOM
const materialCategories = [
  'Aluminum Alloys', 'Steel Alloys', 'Titanium', 'Copper',
  'Plastics & Polymers', 'Ceramics', 'Composites', 'Rare Earth Elements',
  'Silicon Wafers', 'Gold & Precious Metals', 'Magnetic Materials', 'Optical Materials'
];

// Generate realistic supplier names
const companyPrefixes = [
  'TechCorp', 'Global', 'Precision', 'Advanced', 'Elite', 'Premier', 'Superior',
  'Innovative', 'Dynamic', 'Strategic', 'Optimal', 'Quantum', 'Digital', 'Smart',
  'Integrated', 'Universal', 'International', 'Continental', 'Metropolitan', 'Apex'
];

const companySuffixes = [
  'Solutions', 'Systems', 'Technologies', 'Industries', 'Manufacturing', 'Enterprises',
  'Corporation', 'Group', 'Holdings', 'Partners', 'Associates', 'Dynamics',
  'Innovations', 'Labs', 'Works', 'Engineering', 'Precision', 'Components'
];

// Generate 200 suppliers
export const mockSuppliers = Array.from({ length: 200 }, (_, index) => {
  const category = supplierCategories[Math.floor(Math.random() * supplierCategories.length)];
  const region = regions[Math.floor(Math.random() * regions.length)];
  
  // Trust score based on category
  let trustScore;
  if (category === 'trusted') {
    trustScore = 8.5 + Math.random() * 1.5; // 8.5-10
  } else if (category === 'empanelled') {
    trustScore = 7.0 + Math.random() * 2.0; // 7.0-9.0
  } else {
    trustScore = 5.0 + Math.random() * 3.0; // 5.0-8.0
  }
  
  // Cost varies by region and category
  const baseCost = 5000 + Math.random() * 45000; // $5K-$50K
  const regionMultiplier = region === 'North America' ? 1.2 : region === 'Europe' ? 1.1 : 0.9;
  const categoryMultiplier = category === 'trusted' ? 1.15 : category === 'empanelled' ? 1.0 : 0.85;
  
  const cost = Math.round(baseCost * regionMultiplier * categoryMultiplier);
  
  // Risk level based on trust score
  let riskLevel;
  if (trustScore >= 8.5) riskLevel = 'Low';
  else if (trustScore >= 7.0) riskLevel = 'Medium';
  else riskLevel = 'High';
  
  // Random certifications
  const supplierCertifications = [];
  const numCerts = Math.floor(Math.random() * 4) + (category === 'trusted' ? 2 : 0);
  for (let i = 0; i < numCerts; i++) {
    const cert = certifications[Math.floor(Math.random() * certifications.length)];
    if (!supplierCertifications.includes(cert)) {
      supplierCertifications.push(cert);
    }
  }
  
  const prefix = companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)];
  const suffix = companySuffixes[Math.floor(Math.random() * companySuffixes.length)];
  
  return {
    id: `supplier-${index + 1}`,
    name: `${prefix} ${suffix}`,
    cost: cost,
    trustScore: Math.round(trustScore * 10) / 10,
    category: category,
    region: region,
    certifications: supplierCertifications,
    riskLevel: riskLevel,
    specialties: [
      componentCategories[Math.floor(Math.random() * componentCategories.length)],
      componentCategories[Math.floor(Math.random() * componentCategories.length)]
    ].filter((item, index, arr) => arr.indexOf(item) === index),
    responseTime: Math.floor(Math.random() * 48) + 2, // 2-50 hours
    qualityRating: Math.round((trustScore * 0.9 + Math.random() * 1) * 10) / 10,
    deliveryRating: Math.round((8 + Math.random() * 2) * 10) / 10,
    communicationRating: Math.round((7.5 + Math.random() * 2.5) * 10) / 10,
    lastOrderDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    totalOrders: Math.floor(Math.random() * 50) + (category === 'trusted' ? 20 : 5),
    averageOrderValue: Math.round((cost * 0.7 + Math.random() * cost * 0.6)),
    paymentTerms: ['Net 30', 'Net 45', 'Net 60', '2/10 Net 30'][Math.floor(Math.random() * 4)],
    minimumOrderValue: Math.round(cost * 0.1),
    leadTime: Math.floor(Math.random() * 21) + 7, // 7-28 days
    capacity: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
    sustainability: Math.round((6 + Math.random() * 4) * 10) / 10
  };
});

// Smart BOM Components with detailed explanations
export const smartBOMComponents = [
  {
    id: 'bom-1',
    name: 'Precision Optical Sensor Assembly',
    description: 'High-precision optical sensor for industrial automation',
    components: [
      {
        id: 'comp-1',
        partNumber: 'OPT-SENS-001',
        description: 'Primary Optical Sensor',
        category: 'Optical Components',
        quantity: 1,
        unitPrice: 245.50,
        totalPrice: 245.50,
        supplier: 'Precision Optics Solutions',
        leadTime: 14,
        specifications: {
          wavelength: '850nm',
          sensitivity: '0.1 lux',
          operatingTemp: '-40°C to +85°C',
          dimensions: '12x8x4mm'
        },
        qualityGrade: 'A+',
        riskLevel: 'Low',
        alternativeSuppliers: 3,
        complianceStatus: 'RoHS Compliant',
        businessImpact: 'Critical - Core functionality component',
        technicalNotes: 'Requires calibration during assembly'
      },
      {
        id: 'comp-2',
        partNumber: 'PCB-MAIN-002',
        description: 'Main Control PCB',
        category: 'Electronic Components',
        quantity: 1,
        unitPrice: 89.75,
        totalPrice: 89.75,
        supplier: 'Advanced Electronics Corp',
        leadTime: 21,
        specifications: {
          layers: '4-layer',
          material: 'FR4',
          thickness: '1.6mm',
          surfaceFinish: 'HASL'
        },
        qualityGrade: 'A',
        riskLevel: 'Medium',
        alternativeSuppliers: 5,
        complianceStatus: 'UL Listed',
        businessImpact: 'High - Controls sensor operation',
        technicalNotes: 'Custom design, requires design review'
      },
      {
        id: 'comp-3',
        partNumber: 'HOUS-ALU-003',
        description: 'Aluminum Housing',
        category: 'Mechanical Parts',
        quantity: 1,
        unitPrice: 34.20,
        totalPrice: 34.20,
        supplier: 'Global Manufacturing Inc',
        leadTime: 10,
        specifications: {
          material: '6061-T6 Aluminum',
          finish: 'Anodized',
          tolerance: '±0.1mm',
          weight: '45g'
        },
        qualityGrade: 'B+',
        riskLevel: 'Low',
        alternativeSuppliers: 8,
        complianceStatus: 'ISO 9001',
        businessImpact: 'Medium - Protective housing',
        technicalNotes: 'Standard machining process'
      }
    ],
    totalCost: 369.45,
    estimatedLeadTime: 21,
    riskAssessment: 'Medium',
    qualityScore: 8.7,
    supplierDiversity: 3,
    complianceScore: 95
  },
  {
    id: 'bom-2',
    name: 'Smart Temperature Controller',
    description: 'IoT-enabled temperature control system',
    components: [
      {
        id: 'comp-4',
        partNumber: 'TEMP-SENS-004',
        description: 'Digital Temperature Sensor',
        category: 'Sensors & Actuators',
        quantity: 2,
        unitPrice: 12.45,
        totalPrice: 24.90,
        supplier: 'Smart Sensors Ltd',
        leadTime: 7,
        specifications: {
          accuracy: '±0.5°C',
          range: '-55°C to +125°C',
          interface: 'I2C',
          resolution: '12-bit'
        },
        qualityGrade: 'A',
        riskLevel: 'Low',
        alternativeSuppliers: 6,
        complianceStatus: 'RoHS Compliant',
        businessImpact: 'Critical - Primary sensing element',
        technicalNotes: 'Requires calibration certificate'
      },
      {
        id: 'comp-5',
        partNumber: 'MCU-ARM-005',
        description: 'ARM Cortex-M4 Microcontroller',
        category: 'Electronic Components',
        quantity: 1,
        unitPrice: 8.95,
        totalPrice: 8.95,
        supplier: 'TechCorp Solutions',
        leadTime: 14,
        specifications: {
          core: 'ARM Cortex-M4',
          frequency: '168MHz',
          flash: '512KB',
          ram: '128KB'
        },
        qualityGrade: 'A+',
        riskLevel: 'Low',
        alternativeSuppliers: 4,
        complianceStatus: 'CE Marking',
        businessImpact: 'Critical - Main processing unit',
        technicalNotes: 'Automotive grade available'
      }
    ],
    totalCost: 156.80,
    estimatedLeadTime: 14,
    riskAssessment: 'Low',
    qualityScore: 9.2,
    supplierDiversity: 5,
    complianceScore: 98
  },
  {
    id: 'bom-3',
    name: 'Industrial Servo Motor Assembly',
    description: 'High-torque servo motor for precision positioning',
    components: [
      {
        id: 'comp-6',
        partNumber: 'SERVO-MOT-006',
        description: 'Brushless Servo Motor',
        category: 'Mechanical Parts',
        quantity: 1,
        unitPrice: 485.00,
        totalPrice: 485.00,
        supplier: 'Elite Motors Group',
        leadTime: 28,
        specifications: {
          torque: '5.2 Nm',
          speed: '3000 RPM',
          voltage: '24V DC',
          encoder: '2500 PPR'
        },
        qualityGrade: 'A+',
        riskLevel: 'Medium',
        alternativeSuppliers: 2,
        complianceStatus: 'UL Listed',
        businessImpact: 'Critical - Primary actuator',
        technicalNotes: 'Requires motor controller pairing'
      }
    ],
    totalCost: 485.00,
    estimatedLeadTime: 28,
    riskAssessment: 'Medium',
    qualityScore: 9.0,
    supplierDiversity: 2,
    complianceScore: 92
  },
  {
    id: 'bom-4',
    name: 'Wireless Communication Module',
    description: 'Multi-protocol wireless communication system',
    components: [
      {
        id: 'comp-7',
        partNumber: 'WIFI-MOD-007',
        description: 'WiFi 6 Module',
        category: 'Electronic Components',
        quantity: 1,
        unitPrice: 28.50,
        totalPrice: 28.50,
        supplier: 'Digital Dynamics Corp',
        leadTime: 12,
        specifications: {
          standard: '802.11ax',
          frequency: '2.4/5GHz',
          dataRate: '1.2Gbps',
          antenna: 'Integrated'
        },
        qualityGrade: 'A',
        riskLevel: 'Low',
        alternativeSuppliers: 7,
        complianceStatus: 'FCC Certified',
        businessImpact: 'High - Connectivity function',
        technicalNotes: 'Requires antenna tuning'
      }
    ],
    totalCost: 28.50,
    estimatedLeadTime: 12,
    riskAssessment: 'Low',
    qualityScore: 8.8,
    supplierDiversity: 7,
    complianceScore: 96
  },
  {
    id: 'bom-5',
    name: 'Power Management System',
    description: 'Efficient power conversion and management',
    components: [
      {
        id: 'comp-8',
        partNumber: 'PWR-CONV-008',
        description: 'DC-DC Converter',
        category: 'Electronic Components',
        quantity: 1,
        unitPrice: 45.80,
        totalPrice: 45.80,
        supplier: 'Superior Power Systems',
        leadTime: 16,
        specifications: {
          inputVoltage: '9-36V',
          outputVoltage: '5V',
          current: '10A',
          efficiency: '95%'
        },
        qualityGrade: 'A',
        riskLevel: 'Low',
        alternativeSuppliers: 5,
        complianceStatus: 'Energy Star',
        businessImpact: 'Critical - Power supply',
        technicalNotes: 'Thermal management required'
      }
    ],
    totalCost: 45.80,
    estimatedLeadTime: 16,
    riskAssessment: 'Low',
    qualityScore: 8.9,
    supplierDiversity: 5,
    complianceScore: 94
  },
  {
    id: 'bom-6',
    name: 'Safety Interlock System',
    description: 'Multi-level safety system for industrial equipment',
    components: [
      {
        id: 'comp-9',
        partNumber: 'SAFE-CTRL-009',
        description: 'Safety Controller',
        category: 'Safety Equipment',
        quantity: 1,
        unitPrice: 320.00,
        totalPrice: 320.00,
        supplier: 'Optimal Safety Solutions',
        leadTime: 25,
        specifications: {
          safetyLevel: 'SIL 3',
          inputs: '16 Digital',
          outputs: '8 Safety',
          certification: 'TÜV Certified'
        },
        qualityGrade: 'A+',
        riskLevel: 'Low',
        alternativeSuppliers: 3,
        complianceStatus: 'TÜV Certified',
        businessImpact: 'Critical - Safety compliance',
        technicalNotes: 'Requires safety validation'
      }
    ],
    totalCost: 320.00,
    estimatedLeadTime: 25,
    riskAssessment: 'Low',
    qualityScore: 9.5,
    supplierDiversity: 3,
    complianceScore: 99
  },
  {
    id: 'bom-7',
    name: 'Precision Measurement Instrument',
    description: 'High-accuracy measurement and calibration system',
    components: [
      {
        id: 'comp-10',
        partNumber: 'MEAS-UNIT-010',
        description: 'Precision ADC Module',
        category: 'Precision Instruments',
        quantity: 1,
        unitPrice: 156.75,
        totalPrice: 156.75,
        supplier: 'Quantum Precision Labs',
        leadTime: 18,
        specifications: {
          resolution: '24-bit',
          accuracy: '0.01%',
          sampleRate: '1kSPS',
          channels: '8 Differential'
        },
        qualityGrade: 'A+',
        riskLevel: 'Medium',
        alternativeSuppliers: 2,
        complianceStatus: 'NIST Traceable',
        businessImpact: 'Critical - Measurement accuracy',
        technicalNotes: 'Requires calibration certificate'
      }
    ],
    totalCost: 156.75,
    estimatedLeadTime: 18,
    riskAssessment: 'Medium',
    qualityScore: 9.3,
    supplierDiversity: 2,
    complianceScore: 97
  },
  {
    id: 'bom-8',
    name: 'Environmental Monitoring Array',
    description: 'Multi-parameter environmental sensing system',
    components: [
      {
        id: 'comp-11',
        partNumber: 'ENV-SENS-011',
        description: 'Multi-Parameter Sensor',
        category: 'Sensors & Actuators',
        quantity: 1,
        unitPrice: 89.25,
        totalPrice: 89.25,
        supplier: 'Universal Sensors Inc',
        leadTime: 14,
        specifications: {
          parameters: 'Temp, Humidity, Pressure, Gas',
          accuracy: '±2%',
          interface: 'RS485',
          housing: 'IP67'
        },
        qualityGrade: 'A',
        riskLevel: 'Low',
        alternativeSuppliers: 6,
        complianceStatus: 'REACH Compliant',
        businessImpact: 'High - Environmental monitoring',
        technicalNotes: 'Weatherproof installation'
      }
    ],
    totalCost: 89.25,
    estimatedLeadTime: 14,
    riskAssessment: 'Low',
    qualityScore: 8.6,
    supplierDiversity: 6,
    complianceScore: 93
  }
];

// BOM Column Definitions for Business Understanding
export const bomColumnDefinitions = {
  partNumber: {
    title: 'Part Number',
    businessMeaning: 'Unique identifier for the component',
    importance: 'Critical for inventory management and supplier communication',
    tooltip: 'Standardized code used to identify and order specific components'
  },
  description: {
    title: 'Description',
    businessMeaning: 'Human-readable name and function of the component',
    importance: 'Helps stakeholders understand component purpose',
    tooltip: 'Clear description of what the component does and its role in the assembly'
  },
  category: {
    title: 'Category',
    businessMeaning: 'Classification of component type for procurement strategy',
    importance: 'Enables category-based sourcing and supplier specialization',
    tooltip: 'Groups similar components for strategic sourcing and supplier management'
  },
  quantity: {
    title: 'Quantity',
    businessMeaning: 'Number of units required per assembly',
    importance: 'Determines order volumes and inventory requirements',
    tooltip: 'How many of this component are needed for one complete product'
  },
  unitPrice: {
    title: 'Unit Price',
    businessMeaning: 'Cost per individual component',
    importance: 'Base for cost calculations and supplier negotiations',
    tooltip: 'Price for one unit of this component from the selected supplier'
  },
  totalPrice: {
    title: 'Total Price',
    businessMeaning: 'Extended cost (quantity × unit price)',
    importance: 'Shows component contribution to total product cost',
    tooltip: 'Total cost for all units of this component (Quantity × Unit Price)'
  },
  supplier: {
    title: 'Supplier',
    businessMeaning: 'Selected vendor for this component',
    importance: 'Defines supply chain relationships and risk exposure',
    tooltip: 'Chosen supplier based on cost, quality, and reliability factors'
  },
  leadTime: {
    title: 'Lead Time (Days)',
    businessMeaning: 'Time from order to delivery',
    importance: 'Critical for production planning and inventory management',
    tooltip: 'Number of days between placing order and receiving components'
  },
  qualityGrade: {
    title: 'Quality Grade',
    businessMeaning: 'Assessment of component quality level',
    importance: 'Indicates expected reliability and performance',
    tooltip: 'Quality rating based on specifications, testing, and supplier track record'
  },
  riskLevel: {
    title: 'Risk Level',
    businessMeaning: 'Supply chain risk assessment',
    importance: 'Helps prioritize risk mitigation strategies',
    tooltip: 'Overall risk rating considering supplier stability, market conditions, and alternatives'
  },
  alternativeSuppliers: {
    title: 'Alternative Suppliers',
    businessMeaning: 'Number of backup supplier options',
    importance: 'Indicates supply chain resilience and negotiation power',
    tooltip: 'How many qualified alternative suppliers are available for this component'
  },
  complianceStatus: {
    title: 'Compliance Status',
    businessMeaning: 'Regulatory and certification compliance',
    importance: 'Ensures product meets legal and industry requirements',
    tooltip: 'Certifications and regulatory compliance status of the component'
  },
  businessImpact: {
    title: 'Business Impact',
    businessMeaning: 'Criticality to product function and business',
    importance: 'Helps prioritize procurement attention and risk management',
    tooltip: 'How critical this component is to product functionality and business success'
  },
  technicalNotes: {
    title: 'Technical Notes',
    businessMeaning: 'Special requirements or considerations',
    importance: 'Ensures proper handling and integration',
    tooltip: 'Important technical considerations for procurement and manufacturing'
  }
};

// Dashboard Section Definitions
export const dashboardSectionDefinitions = {
  metrics: {
    title: 'Key Performance Metrics',
    description: 'Real-time overview of procurement performance and AI-driven insights.',
    businessValue: 'Track efficiency gains and cost savings from intelligent procurement processes.'
  },
  supplierTrustGraph: {
    title: 'Supplier Intelligence Matrix',
    description: 'Visual analysis of supplier relationships balancing trust scores against cost factors.',
    businessValue: 'Identify optimal suppliers in the "sweet spot" of high trust and competitive pricing.'
  },
  aiInsights: {
    title: 'AI-Powered Insights',
    description: 'Machine learning recommendations for cost optimization and risk management.',
    businessValue: 'Leverage artificial intelligence to make data-driven procurement decisions.'
  },
  quickActions: {
    title: 'Quick Actions',
    description: 'Streamlined access to frequently used procurement functions and tools.',
    businessValue: 'Accelerate procurement workflows with one-click access to key features.'
  },
  recentActivity: {
    title: 'Recent RFQ Activity',
    description: 'Latest Request for Quotation submissions and their current status.',
    businessValue: 'Monitor procurement pipeline and ensure timely processing of requests.'
  }
};

// Get subset of suppliers for trust graph (25 suppliers)
export const getTrustGraphSuppliers = () => {
  return mockSuppliers.slice(0, 25).map(supplier => ({
    ...supplier,
    // Ensure good distribution across categories
    category: supplier.id.endsWith('1') || supplier.id.endsWith('6') ? 'trusted' :
              supplier.id.endsWith('2') || supplier.id.endsWith('7') ? 'empanelled' : 
              supplier.category
  }));
};

export default {
  mockSuppliers,
  smartBOMComponents,
  bomColumnDefinitions,
  dashboardSectionDefinitions,
  getTrustGraphSuppliers
};
