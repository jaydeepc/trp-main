/**
 * VoiceAppCommandBus - Centralized communication layer between Voice Interface and App
 * Handles bidirectional communication: Voice → App (commands) and App → Voice (feedback)
 */

export interface VoiceAppContext {
  currentStep: number;
  currentRFQ: any | null;
  uploadedFiles: any[];
  analysisResults: any | null;
  formState: any;
  isVoiceInitiated: boolean;
  sendText?: (message: string) => void;
  [key: string]: any;
}

export interface CommandResult {
  success: boolean;
  message?: string;
  data?: any;
}

export type AppCommandHandler = (params?: any) => Promise<CommandResult> | CommandResult;
export type VoiceFeedbackHandler = (event: string, data: any, context: VoiceAppContext) => void;

class VoiceAppCommandBus {
  private appCommands = new Map<string, AppCommandHandler>();
  private voiceFeedback: VoiceFeedbackHandler | null = null;
  private context: VoiceAppContext = {
    currentStep: 1,
    currentRFQ: null,
    uploadedFiles: [],
    analysisResults: null,
    formState: {},
    isVoiceInitiated: false
  };

  // ===============================
  // APP SIDE - Register Commands
  // ===============================

  /**
   * App registers functions that voice can call
   */
  registerAppCommand(name: string, handler: AppCommandHandler): void {
    console.log(`📡 Command Bus: Registered app command '${name}'`);
    this.appCommands.set(name, handler);
  }

  /**
   * App unregisters commands (cleanup)
   */
  unregisterAppCommand(name: string): void {
    console.log(`📡 Command Bus: Unregistered app command '${name}'`);
    this.appCommands.delete(name);
  }

  /**
   * Get all registered app commands (for debugging)
   */
  getRegisteredCommands(): string[] {
    return Array.from(this.appCommands.keys());
  }

  // ===============================
  // VOICE SIDE - Execute Commands
  // ===============================

  /**
   * Voice interface executes app commands
   */
  async executeAppCommand(name: string, params: any = {}): Promise<CommandResult> {
    console.log(`🎙️ Command Bus: Voice executing app command '${name}'`, params);

    const handler = this.appCommands.get(name);
    if (!handler) {
      const error = `Command '${name}' not registered`;
      console.error(`❌ Command Bus: ${error}`);
      return {
        success: false,
        message: error
      };
    }

    try {
      const result = await handler(params);
      console.log(`✅ Command Bus: Command '${name}' executed successfully`, result);
      
      // Update context with command result
      this.updateContext(`lastCommand_${name}`, result);
      
      return result;
    } catch (error) {
      console.error(`❌ Command Bus: Command '${name}' failed:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: error
      };
    }
  }

  /**
   * Voice interface registers to receive feedback from app
   */
  registerVoiceFeedback(handler: VoiceFeedbackHandler): void {
    console.log('📤 Command Bus: Voice feedback handler registered');
    this.voiceFeedback = handler;
  }

  /**
   * Voice interface unregisters feedback (cleanup)
   */
  unregisterVoiceFeedback(): void {
    console.log('📤 Command Bus: Voice feedback handler unregistered');
    this.voiceFeedback = null;
  }

  // ===============================
  // APP SIDE - Send Feedback
  // ===============================

  /**
   * App sends feedback/events to voice interface
   */
  sendVoiceFeedback(event: string, data: any): void {
    console.log(`📤 Command Bus: App sending feedback '${event}'`, data);
    
    // Update context first
    this.updateContext(event, data);
    
    // Send to voice if handler registered
    if (this.voiceFeedback) {
      try {
        this.voiceFeedback(event, data, this.getContext());
        console.log(`✅ Command Bus: Feedback '${event}' sent to voice`);
      } catch (error) {
        console.error(`❌ Command Bus: Failed to send feedback '${event}':`, error);
      }
    } else {
      console.warn(`⚠️ Command Bus: No voice feedback handler registered for '${event}'`);
    }
  }

  // ===============================
  // CONTEXT MANAGEMENT
  // ===============================

  /**
   * Update shared context between voice and app
   */
  updateContext(key: string, value: any): void {
    console.log(`🔄 Command Bus: Context updated - ${key}:`, value);
    this.context[key] = value;
    
    // Special handling for well-known context keys
    if (key === 'currentRFQ') {
      this.context.currentRFQ = value;
    } else if (key === 'uploadedFiles') {
      this.context.uploadedFiles = value;
    } else if (key === 'analysisResults') {
      this.context.analysisResults = value;
    } else if (key === 'currentStep') {
      this.context.currentStep = value;
    } else if (key.startsWith('formField_')) {
      // Handle form field updates
      const fieldName = key.replace('formField_', '');
      this.context.formState[fieldName] = value;
    }
  }

  /**
   * Get current context (immutable copy)
   */
  getContext(): VoiceAppContext {
    return { ...this.context };
  }

  /**
   * Get specific context value
   */
  getContextValue(key: string): any {
    return this.context[key];
  }

  /**
   * Reset context (useful for cleanup/testing)
   */
  resetContext(): void {
    console.log('🔄 Command Bus: Context reset');
    this.context = {
      currentStep: 1,
      currentRFQ: null,
      uploadedFiles: [],
      analysisResults: null,
      formState: {},
      isVoiceInitiated: false
    };
  }

  // ===============================
  // DEBUGGING & UTILITIES
  // ===============================

  /**
   * Get debug information about the command bus state
   */
  getDebugInfo(): any {
    return {
      registeredCommands: this.getRegisteredCommands(),
      hasVoiceFeedback: !!this.voiceFeedback,
      context: this.getContext(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Log current state for debugging
   */
  logState(): void {
    console.group('🎙️ Voice-App Command Bus State');
    console.log('Registered Commands:', this.getRegisteredCommands());
    console.log('Voice Feedback Handler:', !!this.voiceFeedback ? 'Registered' : 'Not Registered');
    console.log('Current Context:', this.getContext());
    console.groupEnd();
  }
}

// Export singleton instance
export const voiceAppCommandBus = new VoiceAppCommandBus();
export default voiceAppCommandBus;
