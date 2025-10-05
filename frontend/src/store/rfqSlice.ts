import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Component interface
interface Component {
    id: string;
    partName: string;
    partNumber: string;
    quantity: number;
    material: string;
    aiSuggestedAlternative: string;
    aiSuggestedAlternativeReasoning?: string;
    complianceStatus: 'compliant' | 'pending' | 'non-compliant';
    complianceFlags: Array<{
        type: 'success' | 'warning' | 'error';
        text: string;
        icon: string;
    }>;
    riskFlag: {
        level: 'Low' | 'Medium' | 'High';
        color: 'green' | 'yellow' | 'red';
    };
    aiRecommendedRegion: string;
    predictedMarketRange: string;
    zbcShouldCost: string;
    zbcVariance: string;
    zbcSource: 'AI Generated' | 'Professional Report' | 'Manual Entry';
    confidence: number;
    notes?: string;
}

// Supplier interface
interface Supplier {
    id: string;
    name: string;
    cost: number;
    trustScore: number;
    category: 'trusted' | 'empanelled' | 'new';
    region: string;
    certifications: string[];
    riskLevel: 'Low' | 'Medium' | 'High';
}

export interface CommercialTermsData {
    desiredLeadTime: string;
    paymentTerms: string;
    deliveryLocation: string;
    complianceRequirements: string[];
    additionalRequirements: string;
    supplierPriority: string;
}

export interface ExtractedDocumentData {
    documentTypes: string[];
    components: any[];
    projectInfo?: {
        projectName?: string;
        projectNumber?: string;
        date?: string;
        budget?: number;
        industry?: string;
    };
    technicalRequirements?: {
        materials: string[];
        finishes: string[];
        tolerances?: string;
        standards: string[];
        testingRequired?: string;
    };
    metadata: {
        confidence: number;
        extractionNotes?: string;
        fileNames?: string[];
        fileCount?: number;
        processingTime?: string;
    };
}

export interface RFQState {
    components: Component[];
    suppliers: Record<string, Supplier[]>;
    insights: string[];
    currentRFQId?: string;
    currentStep: number;
    commercialTerms: CommercialTermsData;
    uploadedFiles: Array<{
        name: string;
        size: number;
        type: string;
    }>;
    extractedData?: ExtractedDocumentData;
    isLoading: boolean;
    error?: string;
}

const initialState: RFQState = {
    components: [],
    suppliers: {},
    insights: [],
    currentStep: 1,
    commercialTerms: {
        desiredLeadTime: '',
        paymentTerms: '',
        deliveryLocation: '',
        complianceRequirements: [],
        additionalRequirements: '',
        supplierPriority: '',
    },
    uploadedFiles: [],
    isLoading: false,
};

const rfqSlice = createSlice({
    name: 'rfq',
    initialState,
    reducers: {
        setRFQData: (
            state,
            action: PayloadAction<{
                components: any[];
                suppliers: Record<string, Supplier[]>;
                insights: string[];
            }>
        ) => {
            state.components = action.payload.components as Component[];
            state.suppliers = action.payload.suppliers;
            state.insights = action.payload.insights;
            state.isLoading = false;
            console.log('📊 Redux: RFQ data updated');
        },
        updateComponent: (
            state,
            action: PayloadAction<{ id: string; updates: Partial<Component> }>
        ) => {
            const { id, updates } = action.payload;
            const componentIndex = state.components.findIndex(
                (c) => c.id === id
            );
            if (componentIndex !== -1) {
                state.components[componentIndex] = {
                    ...state.components[componentIndex],
                    ...updates,
                };
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        clearError: (state) => {
            state.error = undefined;
        },
        setCurrentRFQ: (state, action: PayloadAction<string>) => {
            state.currentRFQId = action.payload;
        },
        setCurrentStep: (state, action: PayloadAction<number>) => {
            state.currentStep = action.payload;
            console.log('📊 Redux: Current step updated to', action.payload);
        },
        updateCommercialTerms: (
            state,
            action: PayloadAction<Partial<CommercialTermsData>>
        ) => {
            state.commercialTerms = {
                ...state.commercialTerms,
                ...action.payload,
            };
            console.log('📊 Redux: Commercial terms updated', action.payload);
        },
        setLeadTime: (state, action: PayloadAction<string>) => {
            state.commercialTerms.desiredLeadTime = action.payload;
            console.log('📊 Redux: Lead time set to', action.payload);
        },
        setPaymentTerms: (state, action: PayloadAction<string>) => {
            state.commercialTerms.paymentTerms = action.payload;
            console.log('📊 Redux: Payment terms set to', action.payload);
        },
        setDeliveryLocation: (state, action: PayloadAction<string>) => {
            state.commercialTerms.deliveryLocation = action.payload;
            console.log('📊 Redux: Delivery location set to', action.payload);
        },
        setComplianceRequirements: (state, action: PayloadAction<string[]>) => {
            state.commercialTerms.complianceRequirements = action.payload;
            console.log(
                '📊 Redux: Compliance requirements set to',
                action.payload
            );
        },
        addComplianceRequirement: (state, action: PayloadAction<string>) => {
            if (
                !state.commercialTerms.complianceRequirements.includes(
                    action.payload
                )
            ) {
                state.commercialTerms.complianceRequirements.push(
                    action.payload
                );
                console.log(
                    '📊 Redux: Added compliance requirement',
                    action.payload
                );
            }
        },
        removeComplianceRequirement: (state, action: PayloadAction<string>) => {
            state.commercialTerms.complianceRequirements =
                state.commercialTerms.complianceRequirements.filter(
                    (req) => req !== action.payload
                );
            console.log(
                '📊 Redux: Removed compliance requirement',
                action.payload
            );
        },
        setAdditionalRequirements: (state, action: PayloadAction<string>) => {
            state.commercialTerms.additionalRequirements = action.payload;
            console.log(
                '📊 Redux: Additional requirements set to',
                action.payload
            );
        },
        setSupplierPriority: (state, action: PayloadAction<string>) => {
            state.commercialTerms.supplierPriority = action.payload;
            console.log(
                '📊 Redux: Supplier priority set to',
                action.payload
            );
        },
        setUploadedFiles: (
            state,
            action: PayloadAction<
                Array<{ name: string; size: number; type: string }>
            >
        ) => {
            state.uploadedFiles = action.payload;
            console.log(
                '📊 Redux: Uploaded files set to',
                action.payload.length,
                'files'
            );
        },
        clearUploadedFiles: (state) => {
            state.uploadedFiles = [];
            console.log('📊 Redux: Uploaded files cleared');
        },
        setExtractedData: (
            state,
            action: PayloadAction<ExtractedDocumentData>
        ) => {
            state.extractedData = action.payload;
            console.log(
                '📊 Redux: Extracted data set -',
                action.payload.components?.length,
                'components,',
                action.payload.documentTypes?.join(', ')
            );
        },
        clearExtractedData: (state) => {
            state.extractedData = undefined;
            console.log('📊 Redux: Extracted data cleared');
        },
    },
});

export const {
    setRFQData,
    updateComponent,
    setLoading,
    setError,
    clearError,
    setCurrentRFQ,
    setCurrentStep,
    updateCommercialTerms,
    setLeadTime,
    setPaymentTerms,
    setDeliveryLocation,
    setComplianceRequirements,
    addComplianceRequirement,
    removeComplianceRequirement,
    setAdditionalRequirements,
    setSupplierPriority,
    setUploadedFiles,
    clearUploadedFiles,
    setExtractedData,
    clearExtractedData,
} = rfqSlice.actions;

export default rfqSlice.reducer;
