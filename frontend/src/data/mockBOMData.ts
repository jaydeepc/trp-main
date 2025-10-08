// Mock Supplier Data matching BOM schema
// Will be merged with real component data from backend

export interface BOMSupplier {
    name: string;
    contactInfo?: {
        email?: string;
        phone?: string;
        website?: string;
    };
    location: string;
    certifications: string[];
    pricing: {
        unitCost: number;
        currency: string;
    };
    leadTime: string;
    reliability: {
        trustScore: number; // 0-10
    };
}

// Mock suppliers for components (matching BOM schema)
export const mockSuppliersPool: BOMSupplier[] = [
    {
        name: 'LG Electronics',
        location: 'South Korea',
        certifications: ['ISO 9001', 'AEC-Q200', 'TS 16949'],
        pricing: { unitCost: 335, currency: 'USD' },
        leadTime: '6-8 weeks',
        reliability: { trustScore: 9.6 },
        contactInfo: { email: 'sales@lg.com', website: 'www.lg.com' },
    },
    {
        name: 'Samsung Electronics',
        location: 'South Korea',
        certifications: ['ISO 9001', 'AEC-Q200', 'TS 16949'],
        pricing: { unitCost: 342, currency: 'USD' },
        leadTime: '6-8 weeks',
        reliability: { trustScore: 9.5 },
        contactInfo: { email: 'sales@samsung.com', website: 'www.samsung.com' },
    },
    {
        name: 'Continental AG',
        location: 'Germany',
        certifications: [
            'ISO 9001',
            'AEC-Q200',
            'TS 16949',
            'Mercedes Approved',
        ],
        pricing: { unitCost: 358, currency: 'USD' },
        leadTime: '8-10 weeks',
        reliability: { trustScore: 9.4 },
        contactInfo: {
            email: 'sales@continental.com',
            website: 'www.continental.com',
        },
    },
    {
        name: 'BOE Technology',
        location: 'China',
        certifications: ['ISO 9001', 'AEC-Q200'],
        pricing: { unitCost: 298, currency: 'USD' },
        leadTime: '4-6 weeks',
        reliability: { trustScore: 8.2 },
        contactInfo: { email: 'sales@boe.com', website: 'www.boe.com' },
    },
    {
        name: 'AU Optronics',
        location: 'Taiwan',
        certifications: ['ISO 9001', 'AEC-Q200', 'TS 16949'],
        pricing: { unitCost: 315, currency: 'USD' },
        leadTime: '5-7 weeks',
        reliability: { trustScore: 8.7 },
        contactInfo: { email: 'sales@auo.com', website: 'www.auo.com' },
    },
    {
        name: 'Sharp Corporation',
        location: 'Japan',
        certifications: ['ISO 9001', 'AEC-Q200', 'TS 16949'],
        pricing: { unitCost: 226, currency: 'USD' },
        leadTime: '6-8 weeks',
        reliability: { trustScore: 8.9 },
        contactInfo: { email: 'sales@sharp.co.jp', website: 'www.sharp.co.jp' },
    },
    {
        name: 'Innolux Corporation',
        location: 'Taiwan',
        certifications: ['ISO 9001', 'AEC-Q200'],
        pricing: { unitCost: 289, currency: 'USD' },
        leadTime: '5-7 weeks',
        reliability: { trustScore: 8.1 },
        contactInfo: { email: 'sales@innolux.com', website: 'www.innolux.com' },
    },
    {
        name: 'Tianma Microelectronics',
        location: 'China',
        certifications: ['ISO 9001'],
        pricing: { unitCost: 275, currency: 'USD' },
        leadTime: '4-6 weeks',
        reliability: { trustScore: 7.8 },
        contactInfo: { email: 'sales@tianma.com', website: 'www.tianma.com' },
    },
    {
        name: 'Japan Display Inc',
        location: 'Japan',
        certifications: ['ISO 9001', 'AEC-Q200', 'TS 16949'],
        pricing: { unitCost: 235, currency: 'USD' },
        leadTime: '7-9 weeks',
        reliability: { trustScore: 8.6 },
        contactInfo: {
            email: 'sales@j-display.com',
            website: 'www.j-display.com',
        },
    },
    {
        name: 'Visteon Corporation',
        location: 'USA',
        certifications: ['ISO 9001', 'AEC-Q200', 'TS 16949'],
        pricing: { unitCost: 365, currency: 'USD' },
        leadTime: '10-12 weeks',
        reliability: { trustScore: 9.1 },
        contactInfo: { email: 'sales@visteon.com', website: 'www.visteon.com' },
    },
    {
        name: 'Qualcomm',
        location: 'USA',
        certifications: ['ISO 9001', 'TS 16949', 'AEC-Q100'],
        pricing: { unitCost: 95, currency: 'USD' },
        leadTime: '12-14 weeks',
        reliability: { trustScore: 9.7 },
        contactInfo: {
            email: 'sales@qualcomm.com',
            website: 'www.qualcomm.com',
        },
    },
    {
        name: 'MediaTek',
        location: 'Taiwan',
        certifications: ['ISO 9001', 'TS 16949'],
        pricing: { unitCost: 88, currency: 'USD' },
        leadTime: '10-12 weeks',
        reliability: { trustScore: 8.9 },
        contactInfo: {
            email: 'sales@mediatek.com',
            website: 'www.mediatek.com',
        },
    },
    {
        name: 'SK Hynix',
        location: 'South Korea',
        certifications: ['ISO 9001', 'AEC-Q100'],
        pricing: { unitCost: 52, currency: 'USD' },
        leadTime: '10-12 weeks',
        reliability: { trustScore: 9.5 },
        contactInfo: { email: 'sales@skhynix.com', website: 'www.skhynix.com' },
    },
    {
        name: 'Micron Technology',
        location: 'USA',
        certifications: ['ISO 9001', 'AEC-Q100', 'TS 16949'],
        pricing: { unitCost: 51, currency: 'USD' },
        leadTime: '12-14 weeks',
        reliability: { trustScore: 9.6 },
        contactInfo: { email: 'sales@micron.com', website: 'www.micron.com' },
    },
];

// Helper function to get random suppliers for a component
export const getRandomSuppliers = (count: number = 7): BOMSupplier[] => {
    const shuffled = [...mockSuppliersPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const mockBOMAnalysisResults = {
    suppliers: mockSuppliersPool,
};
