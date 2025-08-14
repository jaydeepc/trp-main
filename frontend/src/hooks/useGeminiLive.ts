import { useState, useCallback, useEffect } from 'react';
import { geminiLiveService } from '../services/geminiLiveService';

interface GeminiLiveState {
  isConnected: boolean;
  error: string | null;
  lastMessage: string;
  isSpeaking: boolean;
}

interface UseGeminiLiveProps {
  onMessage?: (message: string) => void;
  onError?: (error: string) => void;
}

export const useGeminiLive = ({
  onMessage,
  onError
}: UseGeminiLiveProps = {}) => {
  const [state, setState] = useState<GeminiLiveState>({
    isConnected: false,
    error: null,
    lastMessage: '',
    isSpeaking: false
  });

  // Initialize Gemini Live
  const initialize = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const success = await geminiLiveService.initialize({
        onConnected: () => {
          setState(prev => ({ ...prev, isConnected: true }));
        },
        onDisconnected: (reason) => {
          setState(prev => ({ ...prev, isConnected: false }));
        },
        onMessage: (message) => {
          setState(prev => ({ ...prev, lastMessage: message }));
          onMessage?.(message);
        },
        onError: (error) => {
          setState(prev => ({ ...prev, error }));
          onError?.(error);
        },
        onAudio: (audioData) => {
          // Audio is handled automatically by the streamer in the service
          console.log('Received audio data:', audioData.byteLength, 'bytes');
        },
        onSpeakingStart: () => {
          setState(prev => ({ ...prev, isSpeaking: true }));
        },
        onSpeakingEnd: () => {
          setState(prev => ({ ...prev, isSpeaking: false }));
        }
      });

      if (success) {
        // Connect to the Live API
        await geminiLiveService.connect();
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize';
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
      return false;
    }
  }, [onMessage, onError]);

  // Send text message
  const sendMessage = useCallback(async (message: string) => {
    try {
      await geminiLiveService.sendTextMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      geminiLiveService.disconnect();
    };
  }, []);

  return {
    ...state,
    initialize,
    sendMessage,
    disconnect: geminiLiveService.disconnect.bind(geminiLiveService),
    isServiceConnected: geminiLiveService.isServiceConnected.bind(geminiLiveService)
  };
};

export default useGeminiLive;
