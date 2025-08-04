import { voiceFunctionRegistry } from './voiceFunctionRegistry';

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface GeminiLiveConfig {
  apiKey: string;
  model: string;
  systemInstruction: string;
}

interface VoiceMessage {
  role: 'user' | 'model';
  parts: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }>;
}

interface GeminiLiveResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        functionCall?: {
          name: string;
          args: Record<string, any>;
        };
      }>;
    };
    finishReason: string;
  }>;
}

class GeminiLiveService {
  private config: GeminiLiveConfig;
  private conversationHistory: VoiceMessage[] = [];
  private isConnected: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recognition: any = null;
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.config = {
      apiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
      model: 'gemini-1.5-flash',
      systemInstruction: this.getSystemInstruction()
    };

    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  private getSystemInstruction(): string {
    return `You are Robbie, an AI-powered procurement assistant. You help users with these CURRENTLY AVAILABLE features:

1. File upload and processing (BOMs, CAD files, specifications)
2. BOM analysis with cost optimization recommendations
3. Commercial terms definition
4. RFQ preview and creation
5. Navigation to dashboard and other sections

IMPORTANT FUNCTION CALLING RULES:
- When users mention "upload", "file", "document", call show_upload_form
- When users mention "analyze", "analysis", "review", "BOM", "bill of materials", call show_bom_analysis
- When users mention "commercial terms", "payment", "terms", call show_commercial_terms
- When users want to navigate to dashboard or RFQ wizard, use navigate_to function
- Always call the appropriate function AND provide helpful context about what you're doing
- If user says "analyze BOM" or similar, ALWAYS call show_bom_analysis function

ONLY mention features that are currently implemented and working. Do not promise or discuss features that are not yet available.

Available functions:
${JSON.stringify(voiceFunctionRegistry.getFunctionDefinitions().map(f => ({
  name: f.name,
  description: f.description,
  parameters: f.parameters
})), null, 2)}

Keep responses conversational, helpful, and focused on currently available procurement tasks. Always explain what actions you're taking.`;
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.processVoiceInput(transcript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }

  async initialize(): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        throw new Error('Gemini API key not configured');
      }

      // Test API connection
      await this.testConnection();
      this.isConnected = true;
      
      // Initialize conversation with system instruction
      this.conversationHistory = [{
        role: 'user',
        parts: [{ text: 'Hello, I need help with procurement tasks.' }]
      }];

      return true;
    } catch (error) {
      console.error('Failed to initialize Gemini Live:', error);
      this.isConnected = false;
      return false;
    }
  }

  private async testConnection(): Promise<void> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Hello' }]
        }],
        systemInstruction: {
          parts: [{ text: 'You are a test assistant. Respond with "Connection successful".' }]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API test failed: ${response.statusText}`);
    }
  }

  async startListening(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Gemini Live not initialized');
    }

    if (this.recognition) {
      this.recognition.start();
    } else {
      throw new Error('Speech recognition not supported');
    }
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  private async processVoiceInput(transcript: string): Promise<void> {
    try {
      console.log('Processing voice input:', transcript);
      
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: transcript }]
      });

      // Get current conversation state for context
      const conversationState = voiceFunctionRegistry.getConversationState();
      
      // Prepare the request with function definitions
      const requestBody = {
        contents: this.conversationHistory,
        systemInstruction: {
          parts: [{ text: this.config.systemInstruction }]
        },
        tools: [{
          functionDeclarations: voiceFunctionRegistry.getFunctionDefinitions().map(func => ({
            name: func.name,
            description: func.description,
            parameters: func.parameters
          }))
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };

      // Call Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const result: GeminiLiveResponse = await response.json();
      await this.handleGeminiResponse(result);

    } catch (error) {
      console.error('Error processing voice input:', error);
      this.speak('Sorry, I encountered an error processing your request. Please try again.');
    }
  }

  private async handleGeminiResponse(response: GeminiLiveResponse): Promise<void> {
    const candidate = response.candidates[0];
    if (!candidate) {
      throw new Error('No response from Gemini');
    }

    const parts = candidate.content.parts;
    let responseText = '';
    
    for (const part of parts) {
      if (part.functionCall) {
        // Execute the function call
        try {
          const result = await voiceFunctionRegistry.executeFunction(
            part.functionCall.name,
            part.functionCall.args
          );
          
          // Handle special cases based on function result
          if (result.requiresFiles && part.functionCall.name === 'show_bom_analysis') {
            // BOM analysis was requested but no files are uploaded
            responseText += result.message + ' Say "yes" to upload files, or tell me what else you would like to do.';
            
            // Add function result to conversation
            this.conversationHistory.push({
              role: 'model',
              parts: [{ 
                text: responseText
              }]
            });
          } else {
            // Normal function execution
            const actionDescription = part.functionCall.name.replace(/_/g, ' ');
            responseText += `I've ${actionDescription}. ${result.message || 'Action completed successfully.'} `;
            
            // Add function result to conversation
            this.conversationHistory.push({
              role: 'model',
              parts: [{ 
                text: `I've executed ${part.functionCall.name}. ${result.message || 'Action completed successfully.'}`
              }]
            });
          }
          
        } catch (error) {
          console.error('Function execution error:', error);
          responseText += `I encountered an error executing that action. ${error instanceof Error ? error.message : 'Please try again.'} `;
        }
      } else if (part.text) {
        responseText += part.text;
      }
    }

    if (responseText) {
      // Add model response to conversation history if not already added
      if (!parts.some(p => p.functionCall && responseText.includes('Say "yes" to upload files'))) {
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: responseText }]
        });
      }

      // Speak the response
      this.speak(responseText);
    }
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop any current speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to use a male voice (like the one used during testing)
      const voices = this.synthesis.getVoices();
      console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
      
      // Prefer male voices in English
      const preferredVoice = voices.find(voice => 
        (voice.name.includes('David') || 
         voice.name.includes('Alex') ||
         voice.name.includes('Daniel') ||
         voice.name.includes('Male') ||
         voice.name.includes('Man')) &&
        voice.lang.includes('en')
      ) || voices.find(voice => 
        voice.lang.includes('en-US') || voice.lang.includes('en')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('Selected voice:', preferredVoice.name);
      } else {
        console.log('Using default voice');
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        // Don't reject for interrupted errors, just resolve
        if (event.error === 'interrupted') {
          console.log('Speech was interrupted, continuing...');
          resolve();
        } else {
          console.error(`Speech synthesis error: ${event.error}`);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        }
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking(): void {
    this.synthesis.cancel();
    this.currentUtterance = null;
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  async sendTextMessage(message: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Gemini Live not initialized');
    }

    await this.processVoiceInput(message);
    return 'Message processed';
  }

  getConversationHistory(): VoiceMessage[] {
    return [...this.conversationHistory];
  }

  clearConversation(): void {
    this.conversationHistory = [];
  }

  isInitialized(): boolean {
    return this.isConnected;
  }

  // Utility method for testing voice commands
  async simulateVoiceCommand(command: string): Promise<void> {
    await this.processVoiceInput(command);
  }
}

// Export singleton instance
export const geminiLiveService = new GeminiLiveService();
export default geminiLiveService;
