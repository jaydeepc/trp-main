import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioState {
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  isInitialized: boolean;
  error: string | null;
}

export const useAudioInterface = () => {
  const [audioState, setAudioState] = useState<AudioState>({
    isListening: false,
    isSpeaking: false,
    audioLevel: 0,
    isInitialized: false,
    error: null
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context and microphone
  const initializeAudio = useCallback(async () => {
    try {
      setAudioState(prev => ({ ...prev, error: null }));

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      streamRef.current = stream;

      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Create microphone source
      const microphone = audioContext.createMediaStreamSource(stream);
      microphoneRef.current = microphone;

      // Connect microphone to analyser
      microphone.connect(analyser);

      // Create data array for frequency analysis
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      setAudioState(prev => ({ ...prev, isInitialized: true }));

      // Start monitoring audio levels
      startAudioMonitoring();

    } catch (error) {
      console.error('Error initializing audio:', error);
      setAudioState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize audio'
      }));
    }
  }, []);

  // Monitor audio levels
  const startAudioMonitoring = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const monitor = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const normalizedLevel = average / 255; // Normalize to 0-1

      // Detect if user is speaking (threshold can be adjusted)
      const isCurrentlySpeaking = normalizedLevel > 0.05;

      setAudioState(prev => ({
        ...prev,
        audioLevel: normalizedLevel,
        isListening: isCurrentlySpeaking
      }));

      // Clear existing timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      // Set timeout to stop listening after silence
      if (isCurrentlySpeaking) {
        silenceTimeoutRef.current = setTimeout(() => {
          setAudioState(prev => ({ ...prev, isListening: false }));
        }, 1000); // Stop after 1 second of silence
      }

      animationFrameRef.current = requestAnimationFrame(monitor);
    };

    monitor();
  }, []);

  // Start listening for voice input
  const startListening = useCallback(async () => {
    if (!audioState.isInitialized) {
      await initializeAudio();
    }

    setAudioState(prev => ({ ...prev, isListening: true }));
  }, [audioState.isInitialized, initializeAudio]);

  // Stop listening
  const stopListening = useCallback(() => {
    setAudioState(prev => ({ ...prev, isListening: false }));

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  // Simulate AI speaking (for testing - replace with actual TTS)
  const speak = useCallback((text: string, duration: number = 3000) => {
    setAudioState(prev => ({ ...prev, isSpeaking: true }));

    // For now, just simulate speaking for a duration
    // In real implementation, this would trigger TTS
    setTimeout(() => {
      setAudioState(prev => ({ ...prev, isSpeaking: false }));
    }, duration);

    console.log('AI Speaking:', text);
  }, []);

  // Process voice input (placeholder for voice recognition)
  const processVoiceInput = useCallback((audioData: Uint8Array) => {
    // This would integrate with speech recognition API
    // For now, return a placeholder
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve("Voice input processed");
      }, 1000);
    });
  }, []);

  // Clean up audio resources
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    microphoneRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;

    setAudioState({
      isListening: false,
      isSpeaking: false,
      audioLevel: 0,
      isInitialized: false,
      error: null
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    audioState,
    initializeAudio,
    startListening,
    stopListening,
    speak,
    processVoiceInput,
    cleanup
  };
};
