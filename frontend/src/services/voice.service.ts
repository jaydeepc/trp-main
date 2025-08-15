import { MultimodalLiveClient } from '../lib/multimodal-live-client';
import { AudioRecorder } from '../lib/AudioRecorder';
import { AudioStreamer } from '../lib/AudioStreamer';
import { audioContext } from '../lib/utils';

interface AutoVoiceCallbacks {
    onConnected?: () => void;
    onDisconnected?: (reason?: string) => void;
    onMessage?: (text: string) => void;
    onError?: (error: string) => void;
    onSpeakingStart?: () => void;
    onSpeakingEnd?: () => void;
}

class VoiceService {
    private client: MultimodalLiveClient | null = null;
    private audioRecorder: AudioRecorder | null = null;
    private audioStreamer: AudioStreamer | null = null;
    private isConnected: boolean = false;
    private isSpeaking: boolean = false;
    private isMuted: boolean = false;
    private isInitialized: boolean = false;
    private isInitializing: boolean = false; // Prevent concurrent initialization
    private callbacks: AutoVoiceCallbacks = {};
    private apiKey: string = '';

    constructor() {
        this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
        console.log('🎙️ VoiceService created');
    }

    async initialize(callbacks: AutoVoiceCallbacks = {}): Promise<boolean> {
        if (this.isInitialized) {
            console.log('🔄 VoiceService already initialized, skipping...');
            return true;
        }

        // Prevent concurrent initialization attempts
        if (this.isInitializing) {
            console.log(
                '🔄 VoiceService initialization in progress, waiting...'
            );
            // Wait for current initialization to complete
            while (this.isInitializing) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            return this.isInitialized;
        }

        // Prevent double initialization
        if (this.client) {
            console.log(
                '🔄 VoiceService client already exists, skipping initialization...'
            );
            return true;
        }

        try {
            this.isInitializing = true;
            console.log('🚀 Initializing VoiceService...');
            this.callbacks = callbacks;

            if (!this.apiKey) {
                throw new Error('Gemini API key not configured');
            }

            // Initialize audio components
            await this.initializeAudio();

            // Create Gemini client
            this.client = new MultimodalLiveClient({
                apiKey: this.apiKey,
            });

            // Setup event listeners
            this.setupEventListeners();

            // Auto-connect and start listening
            await this.connect();
            await this.startListening();

            this.isInitialized = true;
            console.log('✅ VoiceService initialized and ready');
            return true;
        } catch (error) {
            console.error('❌ VoiceService initialization failed:', error);
            this.callbacks.onError?.(
                error instanceof Error ? error.message : 'Initialization failed'
            );
            return false;
        } finally {
            this.isInitializing = false;
        }
    }

    private async initializeAudio(): Promise<void> {
        try {
            // Initialize audio streamer for output
            const audioCtx = await audioContext({
                id: 'auto-voice-audio-out',
            });
            this.audioStreamer = new AudioStreamer(audioCtx);

            // Set up completion callback
            this.audioStreamer.onComplete = () => {
                console.log('🔇 Audio playback completed');
                this.isSpeaking = false;
                this.callbacks.onSpeakingEnd?.();
            };

            console.log('🎵 Audio components initialized');
        } catch (error) {
            console.error('❌ Failed to initialize audio:', error);
            throw error;
        }
    }

    private setupEventListeners(): void {
        if (!this.client) return;

        this.client.on('open', () => {
            console.log('🌐 Voice connection established');
            this.isConnected = true;
            this.callbacks.onConnected?.();
        });

        this.client.on('close', (event) => {
            console.log('🔌 Voice connection closed:', event.reason);
            this.isConnected = false;

            // Stop audio recorder when connection is lost
            if (this.audioRecorder) {
                console.log(
                    '🛑 Stopping audio recorder due to connection loss'
                );
                this.audioRecorder.stop();
                this.audioRecorder = null;
            }

            // Check for quota exceeded error
            if (event.reason && event.reason.toLowerCase().includes('quota')) {
                this.callbacks.onError?.(
                    'API quota exceeded. Please check your Gemini API usage limits.'
                );
            } else {
                this.callbacks.onError?.(
                    `Connection lost: ${event.reason || 'Unknown reason'}`
                );
            }
        });

        this.client.on('content', (content: any) => {
            console.log('💬 Received message from AI');
            // Extract text from response
            if (content.modelTurn?.parts) {
                for (const part of content.modelTurn.parts) {
                    if (part.text) {
                        this.callbacks.onMessage?.(part.text);
                    }
                }
            }
        });

        this.client.on('audio', (audioData: ArrayBuffer) => {
            // Play AI response audio
            if (this.audioStreamer && audioData.byteLength > 0) {
                if (!this.isSpeaking) {
                    this.isSpeaking = true;
                    console.log('🗣️ AI started speaking');
                    this.callbacks.onSpeakingStart?.();
                }

                // Resume audio context if needed
                this.audioStreamer.resume();

                // Add audio data to streamer
                this.audioStreamer.addPCM16(new Uint8Array(audioData));
            }
        });

        this.client.on('log', (log: any) => {
            // Uncomment for debugging
            // console.log('📝 Gemini log:', log);
        });
    }

    private async connect(): Promise<void> {
        if (!this.client) {
            throw new Error('Client not initialized');
        }

        const config = {
            model: 'models/gemini-2.5-flash-preview-native-audio-dialog',
            systemInstruction: {
                parts: [
                    {
                        text: `You are Robbie, an AI-powered procurement assistant. You help users with real-time voice interactions for procurement tasks.

You are ALWAYS listening and ready to help. Users don't need to click buttons or say wake words - just speak naturally.

Keep responses conversational, helpful, and concise since users hear your actual voice. 

When users first connect, briefly introduce yourself and ask how you can help with their procurement needs.`,
                    },
                ],
            },
            generationConfig: {
                responseModalities: 'audio' as const,
            },
        };

        await this.client.connect(config);
    }

    private async startListening(): Promise<void> {
        if (!this.client || !this.isConnected) {
            throw new Error('Not connected');
        }

        try {
            console.log('👂 Starting to listen...');
            this.audioRecorder = new AudioRecorder(16000);

            this.audioRecorder.on('data', (base64Audio: string) => {
                // Only send audio if not muted and properly connected
                if (!this.isMuted && this.client && this.isConnected) {
                    try {
                        this.client.sendRealtimeInput([
                            {
                                mimeType: 'audio/pcm;rate=16000',
                                data: base64Audio,
                            },
                        ]);
                    } catch (error) {
                        console.error('❌ Failed to send audio data:', error);
                        // Don't spam errors, just log once
                    }
                }
            });

            await this.audioRecorder.start();
            console.log('✅ Always listening - ready for conversation');
        } catch (error) {
            console.error('❌ Failed to start listening:', error);
            this.callbacks.onError?.('Failed to start listening');
        }
    }

    // Main control: mute/unmute audio input
    toggleMute(): void {
        this.isMuted = !this.isMuted;
        console.log(
            this.isMuted ? '🔇 Audio input muted' : '🔊 Audio input active'
        );
    }

    // Getters for component state
    get connected(): boolean {
        return this.isConnected;
    }
    get muted(): boolean {
        return this.isMuted;
    }
    get speaking(): boolean {
        return this.isSpeaking;
    }

    // Clean shutdown
    disconnect(): void {
        console.log('🔌 Disconnecting VoiceService...');

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
        this.isMuted = false;
        this.isInitialized = false;
        this.isInitializing = false;
        this.callbacks = {};
    }
}

// Export singleton instance
export const voiceService = new VoiceService();
export default voiceService;
