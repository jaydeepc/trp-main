import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { RFQ, LoadingState, ErrorState, DocumentProcessingResult, RFQContextType } from '../types';
import { setCurrentStep, setRFQ } from '../store/rfqSlice';
import apiService from '../services/api';
import { getRandomSuppliers } from '../data/mockBOMData';

// Action types
type RFQAction =
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'SET_ERROR'; payload: ErrorState }
  | { type: 'SET_RFQS'; payload: RFQ[] }
  | { type: 'SET_CURRENT_RFQ'; payload: RFQ | null }
  | { type: 'ADD_RFQ'; payload: RFQ }
  | { type: 'UPDATE_RFQ'; payload: RFQ }
  | { type: 'REMOVE_RFQ'; payload: string }
  | { type: 'SET_CURRENT_STEP'; payload: string }
  | { type: 'CLEAR_ERROR' };

// State interface
interface RFQState {
  currentRFQ: RFQ | null;
  rfqs: RFQ[];
  loading: LoadingState;
  error: ErrorState;
}

// Initial state
const initialState: RFQState = {
  currentRFQ: null,
  rfqs: [],
  loading: { isLoading: false },
  error: { hasError: false },
};

// Reducer function
function rfqReducer(state: RFQState, action: RFQAction): RFQState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: { hasError: false }, // Clear error when loading starts
      };

    case 'SET_ERROR':
      return {
        ...state,
        loading: { isLoading: false },
        error: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: { hasError: false },
      };

    case 'SET_RFQS':
      return {
        ...state,
        rfqs: action.payload,
        loading: { isLoading: false },
        error: { hasError: false },
      };

    case 'SET_CURRENT_RFQ':
      return {
        ...state,
        currentRFQ: action.payload,
        loading: { isLoading: false },
        error: { hasError: false },
      };

    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentRFQ: state.currentRFQ
          ? { ...state.currentRFQ, workflow: { ...state.currentRFQ.workflow, currentStep: parseInt(action.payload) } }
          : null,
        loading: { isLoading: false },
        error: { hasError: false },
      };

    case 'ADD_RFQ':
      return {
        ...state,
        rfqs: [action.payload, ...state.rfqs],
        currentRFQ: action.payload,
        loading: { isLoading: false },
        error: { hasError: false },
      };

    case 'UPDATE_RFQ':
      const updatedRFQs = state.rfqs.map(rfq =>
        rfq.rfqId === action.payload.rfqId ? action.payload : rfq
      );
      return {
        ...state,
        rfqs: updatedRFQs,
        currentRFQ: state.currentRFQ?.rfqId === action.payload.rfqId ? action.payload : state.currentRFQ,
        loading: { isLoading: false },
        error: { hasError: false },
      };

    case 'REMOVE_RFQ':
      return {
        ...state,
        rfqs: state.rfqs.filter(rfq => rfq.rfqId !== action.payload),
        currentRFQ: state.currentRFQ?.rfqId === action.payload ? null : state.currentRFQ,
        loading: { isLoading: false },
        error: { hasError: false },
      };

    default:
      return state;
  }
}

// Create context
const RFQContext = createContext<RFQContextType | undefined>(undefined);

// Provider component
interface RFQProviderProps {
  children: ReactNode;
}

export function RFQProvider({ children }: RFQProviderProps) {
  const [state, dispatch] = useReducer(rfqReducer, initialState);
  const reduxDispatch = useDispatch();

  // Helper function to handle errors
  const handleError = useCallback((error: any, defaultMessage: string) => {
    const errorMessage = apiService.getErrorMessage(error);
    dispatch({
      type: 'SET_ERROR',
      payload: {
        hasError: true,
        message: errorMessage || defaultMessage,
        details: error.response?.data?.details,
      },
    });
  }, []);

  // Create new RFQ
  const createRFQ = useCallback(async (): Promise<RFQ> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: 'Creating new RFQ...' } });

      const newRFQ = await apiService.createRFQ();
      dispatch({ type: 'ADD_RFQ', payload: newRFQ });

      return newRFQ;
    } catch (error) {
      handleError(error, 'Failed to create RFQ');
      throw error;
    }
  }, [handleError]);

  // Fetch all RFQs
  const fetchRFQs = useCallback(async (params?: { status?: string; page?: number; limit?: number }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: 'Loading RFQs...' } });

      const response = await apiService.getRFQs(params);
      dispatch({ type: 'SET_RFQS', payload: response.items || [] });
    } catch (error) {
      handleError(error, 'Failed to fetch RFQs');
    }
  }, [handleError]);

  // Fetch specific RFQ
  const fetchRFQ = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: 'Loading RFQ...' } });

      const rawRfq = await apiService.getRFQ(id);
      console.log('🔍 Raw API Response:', rawRfq);

      // Populate mock suppliers if missing
      const enhancedRfq = {
        ...rawRfq,
        boms: rawRfq.boms?.map((bom: any) => ({
          ...bom,
          components: bom.components?.map((component: any) => ({
            ...component,
            // Add mock suppliers to main component if missing (5-10 suppliers)
            suppliers: component.suppliers?.length > 0
              ? component.suppliers
              : getRandomSuppliers(Math.floor(Math.random() * 6) + 5),
            // Add mock suppliers to each alternative if missing
            alternatives: component.alternatives?.map((alt: any) => ({
              ...alt,
              suppliers: alt.suppliers?.length > 0
                ? alt.suppliers
                : getRandomSuppliers(Math.floor(Math.random() * 3) + 2)
            }))
          }))
        }))
      };

      console.log('📦 Enhanced RFQ with suppliers:', enhancedRfq.boms?.[0]?.components?.length, 'components');

      // Set current RFQ in context
      dispatch({ type: 'SET_CURRENT_RFQ', payload: enhancedRfq });
      dispatch({ type: 'SET_CURRENT_STEP', payload: (enhancedRfq.workflow?.currentStep || 1).toString() });

      // Dump entire RFQ to Redux - let components decide what to show based on workflow step
      reduxDispatch(setRFQ(enhancedRfq));
      reduxDispatch(setCurrentStep(enhancedRfq.workflow?.currentStep + 1 || 1));

      console.log('✅ Complete RFQ data with suppliers stored in Redux');
    } catch (error) {
      handleError(error, 'Failed to fetch RFQ');
    }
  }, [handleError, reduxDispatch]);

  // Update RFQ
  const updateRFQ = useCallback(async (rfqId: string, data: Partial<RFQ>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: 'Updating RFQ...' } });

      // For now, we'll update the local state directly
      // In a real implementation, this would make an API call
      const currentRFQ = state.currentRFQ;
      if (currentRFQ && currentRFQ.rfqId === rfqId) {
        const updatedRFQ = { ...currentRFQ, ...data };
        dispatch({ type: 'UPDATE_RFQ', payload: updatedRFQ });
      }
    } catch (error) {
      handleError(error, 'Failed to update RFQ');
    }
  }, [state.currentRFQ, handleError]);

  // Delete RFQ
  const deleteRFQ = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: 'Deleting RFQ...' } });

      await apiService.deleteRFQ(id);
      dispatch({ type: 'REMOVE_RFQ', payload: id });
    } catch (error) {
      handleError(error, 'Failed to delete RFQ');
    }
  }, [handleError]);

  // Process document for RFQ
  const processDocument = useCallback(async (
    rfqId: string,
    file: File,
  ): Promise<DocumentProcessingResult> => {
    try {
      dispatch({
        type: 'SET_LOADING',
        payload: {
          isLoading: true,
          message: 'Processing document...',
          progress: 0
        }
      });

      const result = await apiService.updateRFQStep1(rfqId, file);

      console.log('🔄 API Response received:', result);

      await fetchRFQ(rfqId);

      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });

      const totalComponents = result.components?.length || 0;
      const components = result.components || [];

      // Calculate analysis statistics
      const compliantCount = components.filter((c: any) => c.complianceStatus === 'compliant').length;
      const mediumRiskCount = components.filter((c: any) => c.riskFlag?.level === 'Medium').length;

      // Calculate average ZBC variance
      const avgVariance = components.length > 0 ? Math.round(
        components.reduce((sum: number, c: any) => {
          const variance = parseFloat(c.zbcVariance?.replace('%', '') || '0');
          return sum + variance;
        }, 0) / components.length
      ) : 0;

      // Build human-readable summary
      let analysisSummary = [
        `I've analyzed your Mercedes-Benz infotainment system BOM with ${totalComponents} components.`,
        `${compliantCount} components are fully compliant with automotive standards.`,
        mediumRiskCount > 0
          ? `${mediumRiskCount} components have medium supply chain risk levels.`
          : 'All components have low supply chain risk.',
        `The average cost variance is ${avgVariance}% compared to should-cost targets.`,
        '',
      ].join('\n');

      // Build detailed part-by-part analysis
      let componentAnalysis = `Here's what I found for each part: `;

      components.forEach((component: any, index: number) => {
        componentAnalysis += `Component ${index + 1}: ${component.partName} (${component.partNumber}) - `;
        componentAnalysis += `This ${component.material} component has ${component.complianceStatus} regulatory status with ${component.riskFlag?.level?.toLowerCase() || 'low'} supply chain risk. `;
        componentAnalysis += `Current market price range is ${component.predictedMarketRange} with ${component.zbcVariance} variance from should-cost target of ${component.zbcShouldCost}. `;
        componentAnalysis += `Our recommendation: ${component.aiSuggestedAlternative}. `;
        componentAnalysis += `Confidence level: ${component.confidence}%. `;

        // Add supplier information
        const componentSuppliers = result.suppliers?.[component.id];
        if (componentSuppliers && componentSuppliers.length > 0) {
          componentAnalysis += `Available suppliers (${componentSuppliers.length}): `;

          componentSuppliers.forEach((supplier: any, supplierIndex: number) => {
            componentAnalysis += `${supplier.name} (${supplier.region}) - $${supplier.cost}, Trust Score: ${supplier.trustScore}/10, Risk: ${supplier.riskLevel}, Certifications: ${supplier.certifications?.join(', ') || 'None'}`;
            if (supplierIndex < componentSuppliers.length - 1) componentAnalysis += '; ';
          });
        }
        componentAnalysis += `.\n\n`;
      });

      const totalSuppliers = Object.values(result.suppliers || {}).reduce((sum: number, suppliers: any) => sum + suppliers.length, 0);
      const supplierSummary = `\n\nSupplier Intelligence: I have ${totalSuppliers} verified suppliers available across all components with regional coverage and trust scoring. The system includes detailed supplier certifications, cost analysis, and risk assessments for procurement optimization.`;

      const nextSteps = "\n\nNext steps:\nAnalysis results is displayed in the UI to the user. Share just a brief summary of the recommended alternatives.";

      const voiceFeedback = `Analysis Complete: BOM analysis has finished successfully. 

Results Summary:
- ${totalComponents} components analyzed
- Analysis type: BOM Processing
- Processing completed successfully

${analysisSummary}

Component Analysis:
${componentAnalysis}

${supplierSummary}

${nextSteps}`;


      // Return formatted result WITH voice feedback for Step1 to use
      return {
        success: true,
        message: 'Document processed successfully',
        summary: voiceFeedback
      };
    } catch (error) {
      handleError(error, 'Failed to process document');
      throw error;
    }
  }, [handleError]);

  // Update RFQ step
  const updateStep = useCallback(async (rfqId: string, step: number, data: any) => {
    try {
      dispatch({
        type: 'SET_LOADING',
        payload: {
          isLoading: true,
          message: `Updating step ${step}...`
        }
      });

      let result;
      switch (step) {
        case 2:
          result = await apiService.updateRFQStep2(rfqId, data);
          break;
        case 3:
          result = await apiService.updateRFQStep3(rfqId, data);
          break;
        case 4:
          result = await apiService.updateRFQStep4(rfqId, data.action);
          break;
        default:
          throw new Error(`Invalid step: ${step}`);
      }

      if (result.rfq) {
        dispatch({ type: 'UPDATE_RFQ', payload: result.rfq });
      }
    } catch (error) {
      handleError(error, `Failed to update step ${step}`);
      throw error;
    }
  }, [handleError]);


  // Context value
  const contextValue: RFQContextType = {
    currentRFQ: state.currentRFQ,
    rfqs: state.rfqs,
    loading: state.loading,
    error: state.error,
    createRFQ,
    updateRFQ,
    deleteRFQ,
    fetchRFQs,
    fetchRFQ,
    processDocument,
    updateStep,
  };

  return (
    <RFQContext.Provider value={contextValue}>
      {children}
    </RFQContext.Provider>
  );
}

// Custom hook to use RFQ context
export function useRFQ(): RFQContextType {
  const context = useContext(RFQContext);
  if (context === undefined) {
    throw new Error('useRFQ must be used within a RFQProvider');
  }
  return context;
}

// Export context for testing
export { RFQContext };
