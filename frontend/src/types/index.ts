// BOM Types from backend
export interface BOMComponent {
    partNumber?: string;
    name: string;
    description: string;
    specifications: string;
    quantity: number;
    costRange?: string;
    zbc?: {
        shouldCost: number;
        variance?: string;
    };
    alternatives?: Array<{
        partNumber: string;
        name: string;
        description: string;
        specifications: string;
        costRange: string;
        keyAdvantages: string[];
        potentialDrawbacks: string[];
        suppliers: BOMSupplier[];
    }>;
    suppliers?: BOMSupplier[];
}

export interface BOMSupplier {
    componentId?: string;
    name: string;
    contactInfo?: {
        email?: string;
        phone?: string;
        website?: string;
    };
    location?: string;
    certifications?: string[];
    pricing?: {
        unitCost: number;
        currency?: string;
    };
    leadTime?: string;
    reliability?: {
        trustScore: number;
    };
}

export interface BOMDocument {
    _id: string;
    rfqId: string;
    type: 'alpha' | 'beta' | 'final';
    version: number;
    components: BOMComponent[];
    metadata: {
        totalValue?: number;
        currency: string;
        modelMetadata?: any;
    };
    status: 'draft' | 'review' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export interface AnalysisData {
    components: BOMComponent[];
    modelMetadata: {
        tokenUsage?: {
            promptTokens: number;
            completionTokens: number;
            thoughtTokens: number;
        };
        provider: string;
        model: string;
    };
    processingTime: number;
    analysisDate: string;
}

// RFQ Types - Updated to match actual backend structure
export interface RFQ {
    _id: string; // MongoDB ObjectId
    rfqId: string; // Business identifier like "RFQ-4db96257-9342-4be5-a868-ed5a789858dd"
    status: 'draft' | 'in-progress' | 'completed' | 'sent' | 'cancelled';
    createdBy: string;
    bomIds: string[];
    documents: Array<{
        documentId: string;
        fileName: string;
        fileType: string;
        _id: string;
    }>;
    createdAt: string;
    updatedAt: string;
    __v?: number;

    // Analysis data directly from backend
    analysisData: AnalysisData;

    // Requirements from backend
    requirements: {
        supplierPriority: string[];
        complianceRequirements: string[];
        desiredLeadTime: string;
        additionalRequirements: string;
    };

    // BOM summary
    bomSummary: {
        totalVersions: number;
        totalComponents: number;
    };

    // Workflow state
    workflow: {
        currentStep: number;
        completedSteps: number[];
        stepData: {
            [key: string]: any;
        };
    };

    // BOM documents array
    boms?: BOMDocument[];
}

export interface SourceDocument {
    fileName: string;
    fileType: string;
    fileCategory: string;
    fileSize: number;
    processingMode: 'mock' | 'gemini';
    analysisType: 'GENERATED_ZBC' | 'EXTRACTED_ZBC' | 'BOM_PROCESSING';
}

export interface SmartBOMComponent {
    id: string;
    partName: string;
    partNumber: string;
    quantity: number;
    material: string;

    // AI Suggestions
    aiSuggestedAlternative: string;

    // Compliance
    complianceStatus: 'compliant' | 'pending' | 'non-compliant' | 'unknown';
    complianceFlags: ComplianceFlag[];

    // Risk Assessment
    riskFlag: RiskFlag;

    // Supplier Information
    aiRecommendedRegion: string;

    // Pricing
    predictedMarketRange: string;

    // ZBC Data
    zbcShouldCost: string;
    zbcVariance: string;
    zbcSource: 'AI Generated' | 'Professional Report' | 'Manual Entry';

    // Metadata
    confidence: number | string;
    notes: string;

    // Raw data for detailed views
    rawData?: {
        component: any;
        suggestions: any;
        prices: any;
    };
}

export interface ComplianceFlag {
    type: 'success' | 'warning' | 'error';
    text: string;
    icon: string;
}

export interface RiskFlag {
    level: 'Low' | 'Medium' | 'High' | 'unknown';
    color: 'green' | 'yellow' | 'red' | 'gray';
}

export interface CommercialTerms {
    desiredLeadTime: string;
    paymentTerms:
        | 'Net 30'
        | 'Net 60'
        | 'Milestone-based'
        | '2/10 Net 30'
        | 'Cash on Delivery'
        | 'Letter of Credit';
    deliveryLocation: string;
    complianceRequirements: string[];
    additionalRequirements?: string;
}

export interface RFQSummary {
    totalComponents: number;
    estimatedTotalValue?: number;
    averageZBCVariance?: number;
    highRiskComponents: number;
    complianceIssues: number;
}

// Document Processing Types
export interface DocumentProcessingResult {
    success: boolean;
    message: string;
    summary?: string;
}

export interface ProcessingSummary {
    totalComponents: number;
    analysisType: string;
    confidence: string | number;
    processingTime: string | number;
}

// API Response Types
export interface APIResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    details?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// Form Types
export interface RFQFormData {
    step1?: {
        file?: File;
        analysisType?: string;
    };
    step2?: {
        componentUpdates?: ComponentUpdate[];
        notes?: string;
    };
    step3?: CommercialTerms;
    step4?: {
        action: 'preview' | 'send';
    };
}

export interface ComponentUpdate {
    componentId: string;
    changes: Partial<SmartBOMComponent>;
}

// UI State Types
export interface LoadingState {
    isLoading: boolean;
    message?: string;
    progress?: number;
}

export interface ErrorState {
    hasError: boolean;
    message?: string;
    details?: string;
}

export interface NotificationState {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

// File Upload Types
export interface FileUploadState {
    file: File | null;
    uploading: boolean;
    progress: number;
    error: string | null;
}

export interface SupportedFileType {
    category: string;
    description: string;
    extensions: string[];
    maxSize: string;
    analysisType: string;
}

// Dashboard Types
export interface DashboardAnalytics {
    summary: {
        totalRFQs: number;
        activeRFQs: number;
        completedRFQs: number;
        totalComponents: number;
        averageZBCVariance: number;
    };
    breakdown: Array<{
        _id: string;
        count: number;
        totalComponents: number;
        avgZBCVariance?: number;
    }>;
}

// Step Navigation Types
export interface StepConfig {
    number: number;
    title: string;
    description: string;
    isCompleted: boolean;
    isActive: boolean;
    isAccessible: boolean;
}

// Table Types
export interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: any) => React.ReactNode;
}

export interface TableProps {
    columns: TableColumn[];
    data: any[];
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: any) => void;
    className?: string;
}

// Modal Types
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

// Context Types
export interface RFQContextType {
    currentRFQ: RFQ | null;
    rfqs: RFQ[];
    loading: LoadingState;
    error: ErrorState;
    createRFQ: () => Promise<RFQ>;
    updateRFQ: (id: string, data: Partial<RFQ>) => Promise<void>;
    deleteRFQ: (id: string) => Promise<void>;
    fetchRFQs: () => Promise<void>;
    fetchRFQ: (id: string) => Promise<void>;
    processDocument: (
        rfqId: string,
        file: File,
        analysisType?: string
    ) => Promise<DocumentProcessingResult>;
    updateStep: (rfqId: string, step: number, data: any) => Promise<void>;
}

export interface AppContextType {
    notifications: NotificationState[];
    addNotification: (notification: Omit<NotificationState, 'id'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}
