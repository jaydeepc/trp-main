import { useState, useEffect, useCallback, useRef } from 'react';
import { voiceService } from '../services/voice.service';

interface UseVoiceState {
    isConnected: boolean;
    isMuted: boolean;
    isSpeaking: boolean;
    error: string | null;
    lastMessage: string;
}

export const useVoice = () => {
    const [state, setState] = useState<UseVoiceState>({
        isConnected: false,
        isMuted: false,
        isSpeaking: false,
        error: null,
        lastMessage: '',
    });

    // Initialize service on mount
    useEffect(() => {
        const initializeService = async () => {
            try {
                console.log('🎙️ Initializing voice service...');

                const success = await voiceService.initialize({
                    onConnected: () => {
                        console.log('✅ Voice connected');
                        setState(prev => ({
                            ...prev,
                            isConnected: true,
                            error: null
                        }));
                    },
                    onDisconnected: (reason?: string) => {
                        console.log('🔌 Voice disconnected:', reason);
                        setState(prev => ({
                            ...prev,
                            isConnected: false
                        }));
                    },
                    onMessage: (message: string) => {
                        console.log('💬 AI message:', message);
                        setState(prev => ({
                            ...prev,
                            lastMessage: message
                        }));
                    },
                    onError: (error: string) => {
                        console.error('❌ Voice error:', error);
                        setState(prev => ({
                            ...prev,
                            error
                        }));
                    },
                    onSpeakingStart: () => {
                        console.log('🗣️ AI started speaking');
                        setState(prev => ({
                            ...prev,
                            isSpeaking: true
                        }));
                    },
                    onSpeakingEnd: () => {
                        console.log('🔇 AI finished speaking');
                        setState(prev => ({
                            ...prev,
                            isSpeaking: false
                        }));
                    },
                });

                if (!success) {
                    setState(prev => ({
                        ...prev,
                        error: 'Failed to initialize voice service'
                    }));
                }
            } catch (error) {
                console.error('❌ useVoice initialization error:', error);
                setState(prev => ({
                    ...prev,
                    error: error instanceof Error ? error.message : 'Initialization failed'
                }));
            }
        };

        initializeService();

        // Cleanup on unmount
        return () => {
            console.log('🧹 Cleaning up voice service');
            voiceService.disconnect();
        };
    }, []); // Empty dependency array - initialize once

    // Update muted state from service
    useEffect(() => {
        const updateMutedState = () => {
            setState(prev => ({
                ...prev,
                isMuted: voiceService.muted
            }));
        };

        // Check muted state periodically (simple approach)
        const interval = setInterval(updateMutedState, 100);

        return () => clearInterval(interval);
    }, []);

    // Toggle mute function
    const toggleMute = useCallback(() => {
        voiceService.toggleMute();
        setState(prev => ({
            ...prev,
            isMuted: voiceService.muted
        }));
    }, []);

    return {
        // State
        isConnected: state.isConnected,
        isMuted: state.isMuted,
        isSpeaking: state.isSpeaking,
        error: state.error,
        lastMessage: state.lastMessage,

        // Actions
        toggleMute,

        // Derived state for audio visualization
        audioState: {
            isListening: state.isConnected && !state.isMuted,
            isSpeaking: state.isSpeaking,
            audioLevel: 0, // TODO: Could be enhanced later
            isConnected: state.isConnected,
            error: state.error,
        }
    };
};

export default useVoice;
