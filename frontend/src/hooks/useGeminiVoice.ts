import { useState, useCallback, useEffect, useRef } from 'react';
import { geminiLiveService } from '../services/geminiLiveService';

export interface GeminiVoiceState {
  isInitialized: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  error: string | null;
  lastTranscript: string;
  lastResponse: string;
  audioLevel: number;
}

interface UseGeminiVoiceProps {
  onFunctionExecuted?: (functionName: string, result: any) => void;
  onError?: (error: string) => void;
  onTranscript?: (transcript: string) => void;
  onResponse?: (response: string) => void;
}

export const useGeminiVoice = ({
  onFunctionExecuted,
  onError,
  onTranscript,
  onResponse
}: UseGeminiVoiceProps = {}) => {
  const [voiceState, setVoiceState] = useState<GeminiVoiceState>({
    isInitialized: false,
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    error: null,
    lastTranscript: '',
    lastResponse: '',
    audioLevel: 0
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Initialize Gemini Live service
  const initialize = useCallback(async () => {
    try {
      setVoiceState(prev => ({ ...prev, error: null, isProcessing: true }));
      
      const success = await geminiLiveService.initialize();
      
      if (success) {
        await initializeAudioMonitoring();
        setVoiceState(prev => ({ 
          ...prev, 
          isInitialized: true, 
          isProcessing: false,
          error: null 
        }));
      } else {
        throw new Error('Failed to initialize Gemini Live service');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
      setVoiceState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isProcessing: false,
        isInitialized: false 
      }));
      onError?.(errorMessage);
    }
  }, [onError]);

  // Initialize audio monitoring for visual feedback
  const initializeAudioMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphoneRef.current = microphone;
      microphone.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      startAudioLevelMonitoring();
    } catch (error) {
      console.error('Error initializing audio monitoring:', error);
    }
  }, []);

  // Monitor audio levels for visual feedback
  const startAudioLevelMonitoring = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const monitor = () => {
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const normalizedLevel = average / 255;

      setVoiceState(prev => ({
        ...prev,
        audioLevel: normalizedLevel
      }));

      animationFrameRef.current = requestAnimationFrame(monitor);
    };

    monitor();
  }, []);

  // Start listening for voice input
  const startListening = useCallback(async () => {
    if (!voiceState.isInitialized) {
      await initialize();
    }

    try {
      setVoiceState(prev => ({ 
        ...prev, 
        isListening: true, 
        error: null,
        lastTranscript: '',
        lastResponse: ''
      }));

      await geminiLiveService.startListening();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start listening';
      setVoiceState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isListening: false 
      }));
      onError?.(errorMessage);
    }
  }, [voiceState.isInitialized, initialize, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    geminiLiveService.stopListening();
    setVoiceState(prev => ({ ...prev, isListening: false }));
  }, []);

  // Toggle listening state
  const toggleListening = useCallback(async () => {
    if (voiceState.isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [voiceState.isListening, startListening, stopListening]);

  // Send text message (for testing or manual input)
  const sendMessage = useCallback(async (message: string) => {
    if (!voiceState.isInitialized) {
      await initialize();
    }

    try {
      setVoiceState(prev => ({ 
        ...prev, 
        isProcessing: true, 
        error: null,
        lastTranscript: message
      }));

      onTranscript?.(message);
      await geminiLiveService.sendTextMessage(message);
      
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setVoiceState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isProcessing: false 
      }));
      onError?.(errorMessage);
    }
  }, [voiceState.isInitialized, initialize, onTranscript, onError]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    geminiLiveService.stopSpeaking();
    setVoiceState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  // Get conversation history
  const getConversationHistory = useCallback(() => {
    return geminiLiveService.getConversationHistory();
  }, []);

  // Clear conversation
  const clearConversation = useCallback(() => {
    geminiLiveService.clearConversation();
  }, []);

  // Monitor speech synthesis state
  useEffect(() => {
    const checkSpeakingState = () => {
      const isSpeaking = geminiLiveService.isSpeaking();
      setVoiceState(prev => {
        if (prev.isSpeaking !== isSpeaking) {
          return { ...prev, isSpeaking };
        }
        return prev;
      });
    };

    const interval = setInterval(checkSpeakingState, 100);
    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      geminiLiveService.stopListening();
      geminiLiveService.stopSpeaking();
    };
  }, []);

  return {
    voiceState,
    initialize,
    startListening,
    stopListening,
    toggleListening,
    sendMessage,
    stopSpeaking,
    getConversationHistory,
    clearConversation,
    
    // Convenience getters
    isInitialized: voiceState.isInitialized,
    isListening: voiceState.isListening,
    isSpeaking: voiceState.isSpeaking,
    isProcessing: voiceState.isProcessing,
    error: voiceState.error,
    audioLevel: voiceState.audioLevel,
    lastTranscript: voiceState.lastTranscript,
    lastResponse: voiceState.lastResponse
  };
};

export default useGeminiVoice;
