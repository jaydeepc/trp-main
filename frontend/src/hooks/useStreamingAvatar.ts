import { useState, useRef, useCallback } from 'react';
import StreamingAvatar, {
    StreamingEvents,
    StartAvatarRequest,
    TaskType,
    TaskMode,
} from '@heygen/streaming-avatar';
import { useMemoizedFn } from 'ahooks';
import { avatarService } from '../services/avatarService';
import { DEFAULT_AVATAR_CONFIG } from '../lib/avatarConstants';
import { setupChromaKey } from '../lib/chromaKey';
 
export enum AvatarSessionState {
    INACTIVE = 'inactive',
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    DISCONNECTING = 'disconnecting',
    ERROR = 'error',
}
 
export interface Message {
    id: string;
    type: 'user' | 'avatar';
    content: string;
    timestamp: Date;
}
 
export const useStreamingAvatar = () => {
    const [sessionState, setSessionState] = useState<AvatarSessionState>(
        AvatarSessionState.INACTIVE
    );
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isChromaKeyEnabled, setIsChromaKeyEnabled] = useState(true); // Enable by default
 
    const avatarRef = useRef<StreamingAvatar | null>(null);
    const messageIdCounter = useRef(0);
    const stopChromaKeyProcessing = useRef<(() => void) | null>(null);
    const sessionData = useRef<{ session_id: string } | null>(null);
 
    const addMessage = useCallback(
        (type: 'user' | 'avatar', content: string) => {
            const message: Message = {
                id: `msg-${++messageIdCounter.current}`,
                type,
                content,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, message]);
            return message;
        },
        []
    );
 
    const initAvatar = useMemoizedFn(async (token: string) => {
        try {
            const avatar = new StreamingAvatar({ token });
            avatarRef.current = avatar;
 
            // Set up event listeners
            avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
                console.log('Avatar started talking');
            });
 
            avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
                console.log('Avatar stopped talking');
            });
 
            avatar.on(StreamingEvents.STREAM_READY, (event: any) => {
                console.log('Stream ready:', event.detail);
                setStream(event.detail);
                setSessionState(AvatarSessionState.CONNECTED);
            });
 
            avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
                console.log('Stream disconnected');
                setSessionState(AvatarSessionState.INACTIVE);
                setStream(null);
                // Clean up chroma key processing
                if (stopChromaKeyProcessing.current) {
                    stopChromaKeyProcessing.current();
                    stopChromaKeyProcessing.current = null;
                }
            });
 
            avatar.on(StreamingEvents.USER_START, () => {
                setIsListening(true);
            });
 
            avatar.on(StreamingEvents.USER_STOP, () => {
                setIsListening(false);
            });
 
            avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event: any) => {
                // Don't add avatar messages from HeyGen's default responses
                // We'll handle responses through our custom service
                console.log(
                    'Avatar talking message (ignored):',
                    event.detail?.message
                );
            });
 
            avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event: any) => {
                if (event.detail?.message) {
                    addMessage('user', event.detail.message);
                }
            });
 
            // Handle user end message for voice chat
            avatar.on(StreamingEvents.USER_END_MESSAGE, async (event: any) => {
                if (event.detail?.message) {
                    const userMessage = event.detail.message;
                    console.log('User end message:', userMessage);
 
                    // Process the voice input with our custom service
                    try {
                        const response = await avatarService.processUserInput(
                            userMessage
                        );
                        addMessage('avatar', response);
 
                        // Send our custom response back to avatar
                        await avatar.speak({
                            text: response,
                            taskType: TaskType.REPEAT,
                        });
                    } catch (err) {
                        console.error('Error processing voice input:', err);
                    }
                }
            });
 
            return avatar;
        } catch (err) {
            console.error('Error initializing avatar:', err);
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to initialize avatar'
            );
            setSessionState(AvatarSessionState.ERROR);
            throw err;
        }
    });
 
    const startAvatar = useMemoizedFn(
        async (config: StartAvatarRequest = DEFAULT_AVATAR_CONFIG) => {
            if (!avatarRef.current) {
                throw new Error('Avatar not initialized');
            }
 
            try {
                setSessionState(AvatarSessionState.CONNECTING);
                setError(null);
 
                const startSessionData =
                    await avatarRef.current.createStartAvatar(config);
                sessionData.current = startSessionData;
                console.log(
                    'Session started:',
                    sessionData.current?.session_id
                );
 
                // Send initial greeting with file upload mention
                setTimeout(() => {
                    console.log('Starting avatar with greeting...');
 
                    if (avatarRef.current) {
                        avatarRef.current.speak({
                            text: "Hi! I'm Robbie, your AI procurement assistant. Do you have any designs or BOM files? Upload them right here and I'll help you get started with smart procurement!",
                            taskType: TaskType.REPEAT,
                        });
                    }
                }, 500);
            } catch (err) {
                console.error('Error starting avatar:', err);
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to start avatar'
                );
                setSessionState(AvatarSessionState.ERROR);
                throw err;
            }
        }
    );
 
    const stopAvatar = useMemoizedFn(async () => {
        if (!avatarRef.current) return;
 
        try {
            setSessionState(AvatarSessionState.DISCONNECTING);
 
            // Clean up chroma key processing
            if (stopChromaKeyProcessing.current) {
                stopChromaKeyProcessing.current();
                stopChromaKeyProcessing.current = null;
            }
 
            await avatarRef.current.stopAvatar();
            setSessionState(AvatarSessionState.INACTIVE);
            setStream(null);
            avatarRef.current = null;
        } catch (err) {
            console.error('Error stopping avatar:', err);
            setError(
                err instanceof Error ? err.message : 'Failed to stop avatar'
            );
        }
    });
 
    const sendMessage = useMemoizedFn(async (text: string) => {
        if (
            !avatarRef.current ||
            sessionState !== AvatarSessionState.CONNECTED
        ) {
            throw new Error('Avatar not connected');
        }
 
        try {
            // Add user message to history
            addMessage('user', text);
 
            // Process the input and get response using our custom service
            const response = await avatarService.processUserInput(text);
 
            // Add our response to message history immediately
            addMessage('avatar', response);
 
            // Send to avatar for speech synthesis only
            await avatarRef.current.speak({
                text: response,
                taskType: TaskType.REPEAT,
            });
        } catch (err) {
            console.error('Error sending message:', err);
            setError(
                err instanceof Error ? err.message : 'Failed to send message'
            );
            throw err;
        }
    });
 
    const startVoiceChat = useMemoizedFn(async () => {
        if (
            !avatarRef.current ||
            sessionState !== AvatarSessionState.CONNECTED
        ) {
            throw new Error('Avatar not connected');
        }
 
        try {
            await avatarRef.current.startVoiceChat();
        } catch (err) {
            console.error('Error starting voice chat:', err);
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to start voice chat'
            );
            throw err;
        }
    });
 
    const stopVoiceChat = useMemoizedFn(async () => {
        if (!avatarRef.current) return;
 
        try {
            await avatarRef.current.closeVoiceChat();
        } catch (err) {
            console.error('Error stopping voice chat:', err);
        }
    });
 
    const setupChromaKeyForVideo = useCallback(
        (videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) => {
            if (!isChromaKeyEnabled) return;
 
            // Clean up existing processing
            if (stopChromaKeyProcessing.current) {
                stopChromaKeyProcessing.current();
            }
 
            // Start chroma key processing
            stopChromaKeyProcessing.current = setupChromaKey(
                videoElement,
                canvasElement,
                {
                    minHue: 60,
                    maxHue: 180,
                    minSaturation: 0.1,
                    threshold: 1.0,
                }
            );
        },
        [isChromaKeyEnabled]
    );
 
    const toggleChromaKey = useCallback(() => {
        setIsChromaKeyEnabled((prev) => !prev);
 
        // If disabling, clean up processing
        if (isChromaKeyEnabled && stopChromaKeyProcessing.current) {
            stopChromaKeyProcessing.current();
            stopChromaKeyProcessing.current = null;
        }
    }, [isChromaKeyEnabled]);
 
    return {
        sessionState,
        stream,
        messages,
        isListening,
        error,
        isChromaKeyEnabled,
        initAvatar,
        startAvatar,
        stopAvatar,
        sendMessage,
        startVoiceChat,
        stopVoiceChat,
        setupChromaKeyForVideo,
        toggleChromaKey,
        clearMessages: () => setMessages([]),
        clearError: () => setError(null),
    };
};