import React, { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';
import { AudioRecorder } from '../lib/audio-recorder';
import AudioVisualization from '../components/common/AudioVisualization';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import useInitialEffect from '../hooks/useInitialEffect';
import voiceFunctionRegistry from '../services/voiceFunctionRegistry';
import UploadFormWindow from '../components/voice/UploadFormWindow';
import BOMAnalysisWindow from '../components/voice/BOMAnalysisWindow';
import CommercialTermsWindow from '../components/voice/CommercialTermsWindow';
import RFQPreviewWindow from '../components/voice/RFQPreviewWindow';

const InteractionPage: React.FC = () => {
    return (
        <div className="absolute inset-0">
            <VoiceInterface />
        </div>
    );
};

const VoiceInterface: React.FC = () => {
    const { client, connected, connect, disconnect, volume, setConfig, config, sendText } = useLiveAPIContext();
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lastMessage, setLastMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [inVolume, setInVolume] = useState(0);
    const [audioRecorder] = useState(() => new AudioRecorder());

    // UI State for voice functions
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [notifications, setNotifications] = useState<Array<{
        id: string;
        message: string;
        type: 'info' | 'success' | 'error';
        timestamp: Date;
    }>>([]);

    // Track if any UI elements should be shown (determines layout)
    const hasFloatingElements = showUploadForm || currentStep === 2 || currentStep === 3 || currentStep === 4;

    // Get conversation state for uploaded files
    const conversationState = voiceFunctionRegistry.getConversationState();

    // Navigation helper
    const navigateTo = (destination: string) => {
        console.log(`Navigate to ${destination} requested`);
        // Add actual navigation logic here if needed
    };

    // Notification helper
    const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        const notification = {
            id: `notification-${Date.now()}`,
            message,
            type,
            timestamp: new Date()
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
    };

    // Files update helper
    const updateFiles = (files: any[]) => {
        console.log('Files updated:', files);
        voiceFunctionRegistry.updateState('FILES_UPDATED', files);
    };

    // Initialize voice function registry
    useInitialEffect(() => {
        console.log('🔧 Initializing voice function registry...');
        voiceFunctionRegistry.initialize({
            setShowUploadForm,
            setCurrentStep,
            navigateTo,
            updateFiles,
            showNotification
        });
    }, []);

    // Set config and connect - using useInitialEffect to prevent multiple calls
    useInitialEffect(() => {
        console.log('🔧 Setting Robbie configuration...');
        const functionDeclarations = voiceFunctionRegistry.getGeminiFunctionDeclarations();

        setConfig({
            model: "models/gemini-live-2.5-flash-preview",
            generationConfig: {
                responseModalities: "audio",
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
                },
            },
            systemInstruction: {
                parts: [
                    {
                        text: `You are Robbie, an AI-powered procurement assistant. You help users with real-time voice interactions for procurement tasks.

You are ALWAYS listening and ready to help. Users don't need to click buttons or say wake words - just speak naturally.

Keep responses conversational, helpful, and concise since users hear your actual voice. 

When users first connect, briefly introduce yourself and ask how you can help with their procurement needs.

IMPORTANT: You have access to several functions to help with procurement tasks:
- For file uploads, use "show_upload_form"
- For BOM analysis, use "analyse_bom",
- For showing BOM analysis, use "show_bom_analysis"
- For commercial terms, use "show_commercial_terms" or "hide_commercial_terms"
- For navigation, use "navigate_to" with appropriate destinations
- For file management, use "get_uploaded_files" or "clear_uploaded_files"

Always call the appropriate function based on user requests.`,
                    },
                ],
            },
            tools: [
                { functionDeclarations },
            ],
        });
    }, []);

    useEffect(() => {
        if (config && config.systemInstruction && !connected && connect) {
            console.log('🔗 Attempting initial connection...');
            connect()
                .then(() => {
                    console.log('✅ Connection successful!');
                })
                .catch((err: Error) => {
                    console.error('❌ Connection failed:', err.message || err);
                    setError('Failed to connect to voice service');
                });
        }
    }, [config]);

    // Handle microphone audio streaming (like ControlTray)
    useEffect(() => {
        const onData = (base64: string) => {
            client.sendRealtimeInput([
                {
                    mimeType: "audio/pcm;rate=16000",
                    data: base64,
                },
            ]);
        };

        if (connected && !isMuted && audioRecorder) {
            audioRecorder.on("data", onData).on("volume", setInVolume).start();
        } else {
            audioRecorder.stop();
        }

        return () => {
            audioRecorder.off("data", onData).off("volume", setInVolume);
        };
    }, [connected, client, isMuted, audioRecorder]);

    useEffect(() => {
        if (!client) return;

        // Listen for AI responses
        const handleContent = (content: any) => {
            console.log('💬 Received content from AI:', content);
            if (content.modelTurn?.parts) {
                for (const part of content.modelTurn.parts) {
                    if (part.text) {
                        setLastMessage(part.text);
                    }
                }
            }
        };

        // Handle function calls through the registry
        const handleToolCall = async (toolCall: any) => {
            console.log('🔧 Received tool call:', toolCall);

            if (toolCall.functionCalls) {
                for (const functionCall of toolCall.functionCalls) {
                    try {
                        console.log(`Executing function: ${functionCall.name} with args:`, functionCall.args);

                        // Execute function through the registry
                        const result = await voiceFunctionRegistry.executeFunction(
                            functionCall.name,
                            functionCall.args || {}
                        );

                        // Send function response back to AI
                        client.sendToolResponse({
                            functionResponses: [{
                                response: result,
                                id: functionCall.id
                            }]
                        });

                        console.log(`Function ${functionCall.name} executed successfully:`, result);

                    } catch (error) {
                        console.error(`Error executing function ${functionCall.name}:`, error);

                        // Send error response back to AI
                        client.sendToolResponse({
                            functionResponses: [{
                                response: {
                                    success: false,
                                    error: error instanceof Error ? error.message : 'Unknown error',
                                    message: `Failed to execute ${functionCall.name}`
                                },
                                id: functionCall.id
                            }]
                        });
                    }
                }
            }
        };

        const handleAudio = () => {
            setIsSpeaking(true);
        };

        const handleTurnComplete = () => {
            setIsSpeaking(false);
        };

        client.on('content', handleContent);
        client.on('toolcall', handleToolCall);
        client.on('audio', handleAudio);
        client.on('turncomplete', handleTurnComplete);

        return () => {
            client.off('content', handleContent);
            client.off('toolcall', handleToolCall);
            client.off('audio', handleAudio);
            client.off('turncomplete', handleTurnComplete);
        };
    }, [client]);

    const toggleMute = () => {
        setIsMuted(!isMuted);
        // Note: Mute functionality would need to be implemented in LiveAPIContext
        console.log(isMuted ? 'Unmuted' : 'Muted');
    };

    const handleDisconnect = () => {
        disconnect();
        console.log('Disconnected from voice service');
    };

    return (
        <div className="flex h-full max-w-7xl mx-auto transition-all duration-700 ease-in-out">
            {/* Voice Interface Container - Smoothly transitions from center to left */}
            <div
                className={`h-full flex items-center justify-center p-6 transition-all duration-700 ease-in-out ${hasFloatingElements ? 'w-1/2' : 'w-full'
                    }`}
            >
                <div className="text-center">
                    {/* Audio Visualization */}
                    <AudioVisualization
                        isListening={connected && !isMuted}
                        isSpeaking={isSpeaking}
                        audioLevel={volume || 0}
                        size={400}
                        className="mb-8 transition-all duration-500"
                    />

                    {/* Connection Status */}
                    <div className="mb-6">
                        {connected ? (
                            <div className="flex items-center justify-center space-x-2 text-green-400">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-sm font-medium">Connected & Ready</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2 text-yellow-400">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                <span className="text-sm font-medium">Connecting...</span>
                            </div>
                        )}
                    </div>

                    {/* Mute/Unmute and Disconnect Controls */}
                    <div className="mb-6 flex items-center justify-center space-x-4">
                        <Button
                            onClick={toggleMute}
                            className={`px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 ${isMuted
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                            icon={isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        >
                            {isMuted ? 'Unmute' : 'Mute'}
                        </Button>
                        
                        <Button
                            onClick={handleDisconnect}
                            className="px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 bg-red-600 hover:bg-red-700 text-white"
                            icon={<PhoneOff className="w-6 h-6" />}
                        >
                            Disconnect
                        </Button>
                    </div>

                    {/* Last Message */}
                    {lastMessage && (
                        <div className="mt-6 max-w-md mx-auto">
                            <div className="px-4 py-3 bg-white/10 rounded-lg border border-white/20">
                                <p className="text-white/80 text-sm font-medium">Last Message:</p>
                                <p className="text-white text-sm mt-1">{lastMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Function Status Indicator */}
                    <div className="mt-8">
                        <div className="flex items-center justify-center space-x-2 text-sm text-white/60">
                            <span>Voice Functions:</span>
                            <span className="px-2 py-1 bg-green-500/20 rounded-md text-green-300">
                                {voiceFunctionRegistry.getFunctionDefinitions().length} Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Windows Container - Slides in from right */}
            <div
                className={`h-full flex items-center justify-center p-6 transition-all duration-700 ease-in-out ${hasFloatingElements
                    ? 'w-1/2 opacity-100 translate-x-0'
                    : 'w-0 opacity-0 translate-x-full overflow-hidden'
                    }`}
            >
                {showUploadForm && (
                    <UploadFormWindow
                        onClose={() => voiceFunctionRegistry.executeFunction('hide_upload_form')}
                        onFilesChange={updateFiles}
                        sendText={sendText}
                    />
                )}

                {currentStep === 2 && (
                    <BOMAnalysisWindow
                        onClose={() => voiceFunctionRegistry.executeFunction('hide_bom_analysis')}
                        uploadedFiles={conversationState.uploadedFiles}
                    />
                )}

                {currentStep === 3 && (
                    <CommercialTermsWindow
                        onClose={() => voiceFunctionRegistry.executeFunction('hide_commercial_terms')}
                        onNext={() => setCurrentStep(4)}
                        uploadedFiles={conversationState.uploadedFiles}
                    />
                )}

                {currentStep === 4 && (
                    <RFQPreviewWindow
                        onClose={() => setCurrentStep(1)}
                        onNext={() => setCurrentStep(1)}
                        uploadedFiles={conversationState.uploadedFiles}
                    />
                )}
            </div>

            {/* Error Toast */}
            {error && (
                <Toast
                    message={error}
                    type="error"
                    isVisible={!!error}
                    onClose={() => setError('')}
                />
            )}

            {/* Notifications */}
            {notifications.length > 0 && (
                <div className="fixed top-20 right-6 z-50 space-y-2">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`px-4 py-3 rounded-xl backdrop-blur-sm border ${notification.type === 'error'
                                ? 'bg-red-500/20 border-red-500/40 text-red-100'
                                : notification.type === 'success'
                                    ? 'bg-green-500/20 border-green-500/40 text-green-100'
                                    : 'bg-blue-500/20 border-blue-500/40 text-blue-100'
                                }`}
                        >
                            {notification.message}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InteractionPage;
