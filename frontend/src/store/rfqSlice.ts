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

export interface RFQState {
    components: Component[];
    suppliers: Record<string, Supplier[]>;
    insights: string[];
    currentRFQId?: string;
    currentStep: number;
    isLoading: boolean;
    error?: string;
}

const initialState: RFQState = {
    components: [],
    suppliers: {},
    insights: [],
    currentStep: 1,
    isLoading: false,
};

const rfqSlice = createSlice({
    name: 'rfq',
    initialState,
    reducers: {
        setRFQData: (
            state,
            action: PayloadAction<{
                components: Component[];
                suppliers: Record<string, Supplier[]>;
                insights: string[];
            }>
        ) => {
            state.components = action.payload.components;
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
} = rfqSlice.actions;

export default rfqSlice.reducer;
