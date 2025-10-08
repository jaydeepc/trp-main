import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BOMComponent, BOMSupplier, AnalysisData, RFQ } from '../types';

// Use actual backend types
type Component = BOMComponent;

// Define a simplified supplier type for the Redux store (alternatives from backend)
interface AlternativeComponents {
    partNumber: string;
    name: string;
    description: string;
    specifications: string;
    costRange: string;
    keyAdvantages: string[];
    potentialDrawbacks: string[];
    suppliers: BOMSupplier[];
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
    // Store the entire RFQ from backend
    rfqData: RFQ | null;

    currentRFQId?: string;
    currentStep: number;
    commercialTerms: CommercialTermsData;
    uploadedFiles: Array<{
        name: string;
        size: number;
        type: string;
    }>;
    isLoading: boolean;
    error?: string;
}

const initialState: RFQState = {
    rfqData: null,
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
        // New action: Just store the entire RFQ from backend
        setRFQ: (state, action: PayloadAction<RFQ>) => {
            state.rfqData = action.payload;
            state.currentStep = action.payload.workflow?.currentStep || 1;
            state.isLoading = false;
            console.log('📊 Redux: Full RFQ data stored', {
                rfqId: action.payload.rfqId,
                step: action.payload.workflow?.currentStep,
                boms: action.payload.boms?.length,
                hasAnalysisData: !!action.payload.analysisData,
            });
        },
        // Add BOM to existing RFQ
        addBOM: (state, action: PayloadAction<any>) => {
            if (state.rfqData) {
                if (!state.rfqData.boms) {
                    state.rfqData.boms = [];
                }
                state.rfqData.boms.push(action.payload);
                console.log('📊 Redux: BOM added to RFQ', {
                    bomId: action.payload._id,
                    components: action.payload.components?.length,
                });
            }
        },
        // Set analysis data from document extraction (Step 1)
        setAnalysisData: (state, action: PayloadAction<any>) => {
            if (state.rfqData) {
                state.rfqData.analysisData = action.payload;
                console.log('📊 Redux: Analysis data set', {
                    components: action.payload.components?.length,
                    documentTypes: action.payload.documentTypes,
                });
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
            console.log('📊 Redux: Supplier priority set to', action.payload);
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
    },
});

export const {
    setRFQ,
    addBOM,
    setAnalysisData,
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
} = rfqSlice.actions;

export default rfqSlice.reducer;
