import { MultimodalLiveClient } from '../lib/multimodal-live-client';
import { AudioRecorder } from '../lib/AudioRecorder';
import { AudioStreamer } from '../lib/AudioStreamer';
import { voiceFunctionRegistry } from './voiceFunctionRegistry';
import { isModelTurn } from '../types/multimodal-live-types';
import { audioContext } from '../lib/utils';

interface GeminiLiveServiceCallbacks {
    onConnected?: () => void;
    onDisconnected?: (reason?: string) => void;
    onMessage?: (text: string) => void;
    onAudio?: (data: ArrayBuffer) => void;
    onError?: (error: string) => void;
    onToolCall?: (toolCall: any) => void;
    onSpeakingStart?: () => void;
    onSpeakingEnd?: () => void;
}

class GeminiLiveService {
    private client: MultimodalLiveClient | null = null;
    private isConnected: boolean = false;
    private audioRecorder: AudioRecorder | null = null;
    private audioStreamer: AudioStreamer | null = null;
    private isSpeaking: boolean = false;
    private callbacks: GeminiLiveServiceCallbacks = {};
    private apiKey: string = '';
    private isInitialized: boolean = false;

    constructor() {
        this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
        console.log('🚀 GeminiLiveService instance created');
    }

    async initialize(callbacks?: GeminiLiveServiceCallbacks): Promise<boolean> {
        if (this.isInitialized) {
            console.log(
                '🛡️ GeminiLiveService already initialized, merging callbacks...'
            );
            this.callbacks = { ...this.callbacks, ...callbacks };
            return true;
        }

        try {
            console.log('🚀 Starting Gemini Live initialization...');
            this.isInitialized = true; // Set flag immediately to prevent duplicates

            this.callbacks = callbacks || {};

            if (!this.apiKey) {
                throw new Error('Gemini API key not configured');
            }

            // Initialize audio streamer for output
            await this.initializeAudioStreamer();

            // Create the client
            this.client = new MultimodalLiveClient({
                apiKey: this.apiKey,
            });

            // Set up event listeners
            this.setupEventListeners();

            console.log('✅ Gemini Live initialization successful');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Gemini Live:', error);
            this.isInitialized = false; // Reset flag on error
            this.callbacks.onError?.(
                error instanceof Error ? error.message : 'Initialization failed'
            );
            return false;
        }
    }

    private async initializeAudioStreamer(): Promise<void> {
        try {
            const audioCtx = await audioContext({
                id: 'gemini-live-audio-out',
            });
            this.audioStreamer = new AudioStreamer(audioCtx);

            // Set up completion callback
            this.audioStreamer.onComplete = () => {
                console.log('Audio playback completed');
                this.isSpeaking = false;
                this.callbacks.onSpeakingEnd?.();
            };

            console.log('Audio streamer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize audio streamer:', error);
            throw error;
        }
    }

    private setupEventListeners() {
        if (!this.client) return;

        this.client.on('open', () => {
            console.log('Gemini Live session opened successfully');
            this.isConnected = true;
            this.callbacks.onConnected?.();
        });

        this.client.on('close', (event) => {
            console.log('Gemini Live session closed:', event.reason);
            this.isConnected = false;
            this.callbacks.onDisconnected?.(event.reason);
        });

        this.client.on('content', (content) => {
            console.log('Received content from Gemini Live:', content);
            if (isModelTurn(content)) {
                for (const part of content.modelTurn.parts) {
                    if (part.text) {
                        this.callbacks.onMessage?.(part.text);
                    }
                }
            }
        });

        this.client.on('audio', (audioData) => {
            // console.log(
            //     '🎵 GeminiLiveService received audio data:',
            //     audioData.byteLength,
            //     'bytes'
            // );
            // console.log(
            //     '🔊 AudioStreamer instance:',
            //     this.audioStreamer ? 'EXISTS' : 'NULL'
            // );

            // Play audio through streamer
            if (this.audioStreamer) {
                if (!this.isSpeaking) {
                    this.isSpeaking = true;
                    console.log('🗣️ Starting to speak...');
                    this.callbacks.onSpeakingStart?.();
                }

                // Resume audio context if suspended
                this.audioStreamer.resume();

                // Add audio data to streamer
                this.audioStreamer.addPCM16(new Uint8Array(audioData));
                // console.log('✅ Audio data added to streamer');
            }

            this.callbacks.onAudio?.(audioData);
        });

        this.client.on('toolcall', (toolCall) => {
            console.log('Received tool call:', toolCall);
            this.callbacks.onToolCall?.(toolCall);
            this.handleToolCall(toolCall);
        });

        this.client.on('log', (log) => {
            // console.log('Gemini Live log:', log);
        });
    }

    private async handleToolCall(toolCall: any) {
        if (!this.client) return;

        const functionResponses = [];
        for (const fc of toolCall.functionCalls) {
            try {
                const result = await voiceFunctionRegistry.executeFunction(
                    fc.name,
                    fc.args
                );
                functionResponses.push({
                    id: fc.id,
                    response: { result: 'ok' },
                });
                console.log('Function executed:', fc.name, result);
            } catch (error) {
                console.error('Function execution error:', error);
                functionResponses.push({
                    id: fc.id,
                    response: { result: 'error' },
                });
            }
        }

        if (functionResponses.length > 0) {
            console.log('Sending tool response...');
            this.client.sendToolResponse({ functionResponses });
        }
    }

    async connect(): Promise<void> {
        if (!this.client) {
            throw new Error('Client not initialized');
        }

        // Prevent multiple connections
        if (this.isConnected) {
            console.log('Already connected to Gemini Live');
            return;
        }

        const config = {
            model: 'models/gemini-2.5-flash-preview-native-audio-dialog',
            systemInstruction: {
                parts: [
                    {
                        text: `You are Robbie, an AI-powered procurement assistant. You help users with real-time voice interactions for procurement tasks.

Respond naturally and conversationally since users will hear your actual voice.

Keep responses natural, conversational, and helpful. You're speaking directly to users in real-time.`,
                    },
                ],
            },
            generationConfig: {
                responseModalities: 'audio' as const,
            },
        };

        await this.client.connect(config);
    }

    async startListening(): Promise<void> {
        console.log('🔊 Starting to listen for audio input...');

        if (!this.client || !this.isConnected) {
            throw new Error('Not connected to Gemini Live');
        }

        if (this.audioRecorder && this.audioRecorder.isRecording()) {
            console.log('Already listening');
            return;
        }

        try {
            console.log('Starting audio recording...');

            this.audioRecorder = new AudioRecorder(16000);

            this.audioRecorder.on('data', (base64Audio: string) => {
                // Send audio data to Gemini Live
                if (this.client) {
                    this.client.sendRealtimeInput([
                        {
                            mimeType: 'audio/pcm;rate=16000',
                            data: base64Audio,
                        },
                    ]);
                }
            });

            await this.audioRecorder.start();
            console.log('Audio recording started successfully');
        } catch (error) {
            console.error('Error starting audio recording:', error);
            this.callbacks.onError?.(
                'Failed to start audio recording: ' +
                    (error instanceof Error ? error.message : 'Unknown error')
            );
        }
    }

    stopListening(): void {
        if (this.audioRecorder) {
            console.log('Stopping audio recording...');
            this.audioRecorder.stop();
            this.audioRecorder = null;
            console.log('Audio recording stopped');
        }
    }

    async sendTextMessage(message: string): Promise<void> {
        if (!this.client || !this.isConnected) {
            throw new Error('Not connected to Gemini Live');
        }

        console.log('Sending text message to Gemini Live:', message);
        this.client.send([{ text: message }]);
    }

    getIsListening(): boolean {
        return this.audioRecorder?.isRecording() || false;
    }

    getIsSpeaking(): boolean {
        return this.isSpeaking;
    }

    stopSpeaking(): void {
        if (this.audioStreamer) {
            console.log('Stopping audio playback...');
            this.audioStreamer.stop();
            this.isSpeaking = false;
            this.callbacks.onSpeakingEnd?.();
        }
    }

    isServiceConnected(): boolean {
        return this.isConnected;
    }

    disconnect(): void {
        if (this.audioRecorder) {
            this.audioRecorder.stop();
            this.audioRecorder = null;
        }

        if (this.audioStreamer) {
            this.audioStreamer.stop();
            this.audioStreamer = null;
        }

        if (this.client) {
            this.client.disconnect();
            this.client = null;
        }

        this.isConnected = false;
        this.isSpeaking = false;
        this.isInitialized = false; // Reset initialization flag
        this.callbacks.onDisconnected?.();
    }

    // Complete reset for development/debugging
    reset(): void {
        console.log('🔄 Resetting Gemini Live service...');
        this.disconnect();
        this.callbacks = {};
    }
}

// Export singleton instance
export const geminiLiveService = new GeminiLiveService();
export default geminiLiveService;
