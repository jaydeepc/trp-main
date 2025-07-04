import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { RFQ, LoadingState, ErrorState, DocumentProcessingResult, RFQContextType } from '../types';
import apiService from '../services/api';

// Action types
type RFQAction =
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'SET_ERROR'; payload: ErrorState }
  | { type: 'SET_RFQS'; payload: RFQ[] }
  | { type: 'SET_CURRENT_RFQ'; payload: RFQ | null }
  | { type: 'ADD_RFQ'; payload: RFQ }
  | { type: 'UPDATE_RFQ'; payload: RFQ }
  | { type: 'REMOVE_RFQ'; payload: string }
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
        rfq.id === action.payload.id ? action.payload : rfq
      );
      return {
        ...state,
        rfqs: updatedRFQs,
        currentRFQ: state.currentRFQ?.id === action.payload.id ? action.payload : state.currentRFQ,
        loading: { isLoading: false },
        error: { hasError: false },
      };

    case 'REMOVE_RFQ':
      return {
        ...state,
        rfqs: state.rfqs.filter(rfq => rfq.id !== action.payload),
        currentRFQ: state.currentRFQ?.id === action.payload ? null : state.currentRFQ,
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
      
      const rfq = await apiService.getRFQ(id);
      dispatch({ type: 'SET_CURRENT_RFQ', payload: rfq });
    } catch (error) {
      handleError(error, 'Failed to fetch RFQ');
    }
  }, [handleError]);

  // Update RFQ
  const updateRFQ = useCallback(async (id: string, data: Partial<RFQ>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: 'Updating RFQ...' } });
      
      // For now, we'll update the local state directly
      // In a real implementation, this would make an API call
      const currentRFQ = state.currentRFQ;
      if (currentRFQ && currentRFQ.id === id) {
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
    analysisType?: string
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

      const result = await apiService.updateRFQStep1(rfqId, file, analysisType);
      
      // Update the current RFQ with the processed data
      if (result.rfq) {
        dispatch({ type: 'UPDATE_RFQ', payload: result.rfq });
      }

      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });

      // Return a formatted result
      return {
        success: true,
        message: 'Document processed successfully',
        data: {
          processingInfo: result.processingInfo,
          smartBoM: result.smartBoM,
          analysisResults: {
            analysis: {},
            suggestions: {},
            marketPrices: {}
          },
          summary: {
            totalComponents: result.smartBoM?.length || 0,
            analysisType: result.processingInfo?.analysisType || 'Unknown',
            confidence: 'N/A',
            processingTime: 'N/A'
          }
        }
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
