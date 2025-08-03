// Voice Function Registry for Gemini Live Integration
// Handles automatic function calling based on voice input

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  function: (args: any) => Promise<any> | any;
}

export interface ConversationState {
  uploadedFiles: UploadedFile[];
  currentView: string;
  currentStep: number;
  activeAnalysis: any;
  userPreferences: Record<string, any>;
  lastAction: string;
  context: Record<string, any>;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'uploaded' | 'processing' | 'analyzed' | 'error';
  analysisResult?: any;
}

export interface StateUpdateCallbacks {
  setShowUploadForm: (show: boolean) => void;
  setCurrentStep: (step: number) => void;
  navigateTo: (destination: string) => void;
  updateFiles: (files: UploadedFile[]) => void;
  showNotification: (message: string, type?: 'info' | 'success' | 'error') => void;
}

class VoiceFunctionRegistry {
  private functions: Map<string, FunctionDefinition> = new Map();
  private conversationState: ConversationState = {
    uploadedFiles: [],
    currentView: 'voice-landing',
    currentStep: 1,
    activeAnalysis: null,
    userPreferences: {},
    lastAction: '',
    context: {}
  };
  
  private callbacks: StateUpdateCallbacks | null = null;

  // Initialize the registry with callback functions from UI components
  initialize(callbacks: StateUpdateCallbacks) {
    this.callbacks = callbacks;
    this.registerDefaultFunctions();
  }

  // Register a new function
  registerFunction(definition: FunctionDefinition) {
    this.functions.set(definition.name, definition);
  }

  // Get all function definitions for Gemini Live
  getFunctionDefinitions(): FunctionDefinition[] {
    return Array.from(this.functions.values());
  }

  // Execute a function by name
  async executeFunction(name: string, parameters: any = {}) {
    const func = this.functions.get(name);
    if (!func) {
      throw new Error(`Function ${name} not found`);
    }

    try {
      // Validate parameters
      this.validateParameters(parameters, func.parameters);
      
      // Execute function
      const result = await func.function(parameters);
      
      // Update conversation state
      this.updateConversationState(name, parameters, result);
      
      return result;
    } catch (error) {
      console.error(`Error executing function ${name}:`, error);
      throw error;
    }
  }

  // Update conversation state after function execution
  private updateConversationState(functionName: string, parameters: any, result: any) {
    this.conversationState.lastAction = functionName;
    this.conversationState.context = {
      ...this.conversationState.context,
      [functionName]: { parameters, result, timestamp: new Date() }
    };
  }

  // Get current conversation state (for context injection)
  getConversationState(): ConversationState {
    return { ...this.conversationState };
  }

  // Update conversation state from UI actions
  updateState(action: string, data: any) {
    switch (action) {
      case 'FILE_UPLOADED':
        this.conversationState.uploadedFiles.push(data);
        break;
      case 'NAVIGATE_TO':
        this.conversationState.currentView = data.destination;
        break;
      case 'STEP_CHANGED':
        this.conversationState.currentStep = data.step;
        break;
      case 'ANALYSIS_COMPLETE':
        this.conversationState.activeAnalysis = data;
        break;
      default:
        this.conversationState.context[action] = data;
    }
  }

  // Validate function parameters
  private validateParameters(parameters: any, schema: any) {
    const required = schema.required || [];
    for (const param of required) {
      if (!(param in parameters)) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    }
  }

  // Register default functions for Step 1
  private registerDefaultFunctions() {
    // UI Control Functions
    this.registerFunction({
      name: 'show_upload_form',
      description: 'Show the document upload form to the user',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Reason for showing the upload form'
          },
          focus: {
            type: 'boolean',
            description: 'Whether to focus on the upload area'
          }
        },
        required: []
      },
      function: this.showUploadForm.bind(this)
    });

    this.registerFunction({
      name: 'hide_upload_form',
      description: 'Hide the document upload form',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      },
      function: this.hideUploadForm.bind(this)
    });

    this.registerFunction({
      name: 'show_bom_analysis',
      description: 'Show the BOM analysis interface to review and analyze uploaded files',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Reason for showing BOM analysis'
          }
        },
        required: []
      },
      function: this.showBOMAnalysis.bind(this)
    });

    this.registerFunction({
      name: 'hide_bom_analysis',
      description: 'Hide the BOM analysis interface',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      },
      function: this.hideBOMAnalysis.bind(this)
    });

    this.registerFunction({
      name: 'navigate_to',
      description: 'Navigate to different sections of the application',
      parameters: {
        type: 'object',
        properties: {
          destination: {
            type: 'string',
            enum: ['dashboard', 'rfq-wizard', 'bom-review', 'commercial-terms', 'preview'],
            description: 'Where to navigate to'
          },
          step: {
            type: 'number',
            description: 'Specific step number (for wizard navigation)'
          }
        },
        required: ['destination']
      },
      function: this.navigateTo.bind(this)
    });

    // State Query Functions
    this.registerFunction({
      name: 'get_uploaded_files',
      description: 'Get information about files the user has uploaded',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      },
      function: this.getUploadedFiles.bind(this)
    });

    this.registerFunction({
      name: 'get_current_view',
      description: 'Get information about what the user is currently viewing',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      },
      function: this.getCurrentView.bind(this)
    });

    this.registerFunction({
      name: 'get_conversation_context',
      description: 'Get the current conversation context and application state',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      },
      function: this.getConversationContext.bind(this)
    });

    // File Management Functions
    this.registerFunction({
      name: 'clear_uploaded_files',
      description: 'Clear all uploaded files and reset the upload state',
      parameters: {
        type: 'object',
        properties: {
          confirm: {
            type: 'boolean',
            description: 'Confirmation to clear files'
          }
        },
        required: ['confirm']
      },
      function: this.clearUploadedFiles.bind(this)
    });
  }

  // Function Implementations

  private async showUploadForm(args: { reason?: string; focus?: boolean }) {
    if (!this.callbacks) {
      throw new Error('Callbacks not initialized');
    }

    this.callbacks.setShowUploadForm(true);
    
    if (args.focus) {
      // Focus on upload area after a short delay
      setTimeout(() => {
        const uploadArea = document.querySelector('[data-upload-area]') as HTMLElement;
        if (uploadArea) {
          uploadArea.focus();
        }
      }, 100);
    }

    return {
      success: true,
      message: 'Upload form displayed',
      action: 'show_upload_form',
      reason: args.reason || 'User requested document upload'
    };
  }

  private async hideUploadForm() {
    if (!this.callbacks) {
      throw new Error('Callbacks not initialized');
    }

    this.callbacks.setShowUploadForm(false);

    return {
      success: true,
      message: 'Upload form hidden',
      action: 'hide_upload_form'
    };
  }

  private async showBOMAnalysis(args: { reason?: string }) {
    if (!this.callbacks) {
      throw new Error('Callbacks not initialized');
    }

    // For now, we'll use setCurrentStep to show BOM analysis
    // This will need to be updated when we add proper BOM analysis state management
    this.callbacks.setCurrentStep(2);

    return {
      success: true,
      message: 'BOM analysis interface displayed',
      action: 'show_bom_analysis',
      reason: args.reason || 'User requested BOM analysis'
    };
  }

  private async hideBOMAnalysis() {
    if (!this.callbacks) {
      throw new Error('Callbacks not initialized');
    }

    // Reset back to step 1
    this.callbacks.setCurrentStep(1);

    return {
      success: true,
      message: 'BOM analysis interface hidden',
      action: 'hide_bom_analysis'
    };
  }

  private async navigateTo(args: { destination: string; step?: number }) {
    if (!this.callbacks) {
      throw new Error('Callbacks not initialized');
    }

    const destinations = {
      'dashboard': () => this.callbacks!.navigateTo('dashboard'),
      'rfq-wizard': () => this.callbacks!.navigateTo('rfq-wizard'),
      'bom-review': () => this.callbacks!.setCurrentStep(2),
      'commercial-terms': () => this.callbacks!.setCurrentStep(3),
      'preview': () => this.callbacks!.setCurrentStep(4)
    };

    if (destinations[args.destination as keyof typeof destinations]) {
      destinations[args.destination as keyof typeof destinations]();
      
      // Update conversation state
      this.updateState('NAVIGATE_TO', { destination: args.destination });

      return {
        success: true,
        message: `Navigated to ${args.destination}`,
        destination: args.destination,
        step: args.step
      };
    }

    throw new Error(`Invalid destination: ${args.destination}`);
  }

  private async getUploadedFiles() {
    return {
      files: this.conversationState.uploadedFiles.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: file.uploadedAt,
        status: file.status
      })),
      count: this.conversationState.uploadedFiles.length,
      hasFiles: this.conversationState.uploadedFiles.length > 0
    };
  }

  private async getCurrentView() {
    return {
      view: this.conversationState.currentView,
      step: this.conversationState.currentStep,
      availableActions: this.getAvailableActions(),
      context: this.conversationState.context
    };
  }

  private async getConversationContext() {
    return {
      state: this.getConversationState(),
      availableActions: this.getAvailableActions(),
      recentActions: Object.keys(this.conversationState.context).slice(-5)
    };
  }

  private async clearUploadedFiles(args: { confirm: boolean }) {
    if (!args.confirm) {
      return {
        success: false,
        message: 'Confirmation required to clear files',
        requiresConfirmation: true
      };
    }

    this.conversationState.uploadedFiles = [];
    
    if (this.callbacks) {
      this.callbacks.updateFiles([]);
      this.callbacks.showNotification('All uploaded files cleared', 'info');
    }

    return {
      success: true,
      message: 'All uploaded files cleared',
      filesCleared: true
    };
  }

  private getAvailableActions(): string[] {
    const actions = ['show_upload_form', 'hide_upload_form', 'get_uploaded_files'];
    
    if (this.conversationState.uploadedFiles.length > 0) {
      actions.push('clear_uploaded_files', 'navigate_to');
    }

    if (this.conversationState.currentView === 'voice-landing') {
      actions.push('navigate_to');
    }

    return actions;
  }
}

// Export singleton instance
export const voiceFunctionRegistry = new VoiceFunctionRegistry();
export default voiceFunctionRegistry;
