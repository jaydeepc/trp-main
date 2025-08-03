import { useCallback, useEffect, useState } from 'react';
import voiceFunctionRegistry, { 
  ConversationState, 
  UploadedFile, 
  StateUpdateCallbacks 
} from '../services/voiceFunctionRegistry';

interface UseVoiceFunctionsProps {
  setShowUploadForm: (show: boolean) => void;
  setCurrentStep: (step: number) => void;
  onNavigateToDashboard: () => void;
  onNavigateToRFQ: () => void;
}

interface VoiceFunctionExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  action?: string;
}

export const useVoiceFunctions = ({
  setShowUploadForm,
  setCurrentStep,
  onNavigateToDashboard,
  onNavigateToRFQ
}: UseVoiceFunctionsProps) => {
  const [conversationState, setConversationState] = useState<ConversationState>(
    voiceFunctionRegistry.getConversationState()
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastFunctionResult, setLastFunctionResult] = useState<VoiceFunctionExecutionResult | null>(null);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'error';
    timestamp: Date;
  }>>([]);

  // Navigation handler
  const navigateTo = useCallback((destination: string) => {
    switch (destination) {
      case 'dashboard':
        onNavigateToDashboard();
        break;
      case 'rfq-wizard':
        onNavigateToRFQ();
        break;
      default:
        console.warn(`Unknown navigation destination: ${destination}`);
    }
  }, [onNavigateToDashboard, onNavigateToRFQ]);

  // File update handler
  const updateFiles = useCallback((files: UploadedFile[]) => {
    setConversationState(prev => ({
      ...prev,
      uploadedFiles: files
    }));
  }, []);

  // Notification handler
  const showNotification = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const notification = {
      id: `notification-${Date.now()}`,
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  // Initialize function registry
  useEffect(() => {
    const callbacks: StateUpdateCallbacks = {
      setShowUploadForm,
      setCurrentStep,
      navigateTo,
      updateFiles,
      showNotification
    };

    voiceFunctionRegistry.initialize(callbacks);
  }, [setShowUploadForm, setCurrentStep, navigateTo, updateFiles, showNotification]);

  // Execute a voice function
  const executeFunction = useCallback(async (functionName: string, parameters: any = {}) => {
    setIsExecuting(true);
    setLastFunctionResult(null);

    try {
      const result = await voiceFunctionRegistry.executeFunction(functionName, parameters);
      
      const executionResult: VoiceFunctionExecutionResult = {
        success: true,
        message: result.message || `Successfully executed ${functionName}`,
        data: result,
        action: functionName
      };

      setLastFunctionResult(executionResult);
      
      // Update local conversation state
      setConversationState(voiceFunctionRegistry.getConversationState());

      return executionResult;
    } catch (error) {
      const executionResult: VoiceFunctionExecutionResult = {
        success: false,
        message: error instanceof Error ? error.message : `Failed to execute ${functionName}`,
        action: functionName
      };

      setLastFunctionResult(executionResult);
      showNotification(executionResult.message, 'error');
      
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [showNotification]);

  // Update state from UI actions (for context injection)
  const updateStateFromUI = useCallback((action: string, data: any) => {
    voiceFunctionRegistry.updateState(action, data);
    setConversationState(voiceFunctionRegistry.getConversationState());
  }, []);

  // Handle file upload from UI
  const handleFileUpload = useCallback((file: File) => {
    const uploadedFile: UploadedFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      status: 'uploaded'
    };

    // Update conversation state
    updateStateFromUI('FILE_UPLOADED', uploadedFile);
    
    // Show notification
    showNotification(`File "${file.name}" uploaded successfully`, 'success');

    return uploadedFile;
  }, [updateStateFromUI, showNotification]);

  // Mock Gemini Live integration (for testing)
  const mockGeminiLiveCall = useCallback(async (userInput: string) => {
    // This would be replaced with actual Gemini Live integration
    console.log('Mock Gemini Live Input:', userInput);
    
    // Simple intent detection for testing
    const intents = {
      'show upload': { function: 'show_upload_form', params: { reason: 'User requested upload form' } },
      'hide upload': { function: 'hide_upload_form', params: {} },
      'upload form': { function: 'show_upload_form', params: { focus: true } },
      'analyze bom': { function: 'show_bom_analysis', params: { reason: 'User requested BOM analysis' } },
      'show bom': { function: 'show_bom_analysis', params: { reason: 'User requested BOM analysis' } },
      'hide bom': { function: 'hide_bom_analysis', params: {} },
      'dashboard': { function: 'navigate_to', params: { destination: 'dashboard' } },
      'rfq wizard': { function: 'navigate_to', params: { destination: 'rfq-wizard' } },
      'files': { function: 'get_uploaded_files', params: {} },
      'current view': { function: 'get_current_view', params: {} },
      'context': { function: 'get_conversation_context', params: {} },
      'clear files': { function: 'clear_uploaded_files', params: { confirm: true } }
    };

    // Find matching intent
    const matchedIntent = Object.entries(intents).find(([key]) => 
      userInput.toLowerCase().includes(key)
    );

    if (matchedIntent) {
      const [, { function: functionName, params }] = matchedIntent;
      const result = await executeFunction(functionName, params);
      return {
        response: `I've executed ${functionName}. ${result.message}`,
        functionCalled: functionName,
        result
      };
    }

    return {
      response: "I didn't understand that request. Try saying 'show upload form', 'dashboard', or 'files'.",
      functionCalled: null,
      result: null
    };
  }, [executeFunction]);

  // Get available functions for current context
  const getAvailableFunctions = useCallback(() => {
    return voiceFunctionRegistry.getFunctionDefinitions().map(def => ({
      name: def.name,
      description: def.description,
      parameters: def.parameters
    }));
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    // State
    conversationState,
    isExecuting,
    lastFunctionResult,
    notifications,

    // Actions
    executeFunction,
    updateStateFromUI,
    handleFileUpload,
    mockGeminiLiveCall,
    getAvailableFunctions,
    clearNotifications,

    // Utilities
    hasUploadedFiles: conversationState.uploadedFiles.length > 0,
    currentView: conversationState.currentView,
    currentStep: conversationState.currentStep
  };
};

export default useVoiceFunctions;
