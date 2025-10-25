import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { initializeVoice, disconnectVoice } from '../../store/voiceSlice';
import { Mic, MicOff, PhoneOff, Sparkles } from 'lucide-react';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';
import { AudioRecorder } from '../../lib/audio-recorder';
import AudioVisualization from './AudioVisualization';
import Button from './Button';
import Toast from './Toast';
import useInitialEffect from '../../hooks/useInitialEffect';
import voiceFunctionRegistry from '../../services/voiceFunctionRegistry';
import voiceActionService from '../../services/voiceActionService';
import FloatingOverlayManager from './FloatingOverlayManager';
import DetailWindow from '../voice/DetailWindow';

const VoiceInterfaceSidebar: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { client, connected, connect, disconnect, volume, setConfig, config, sendText } = useLiveAPIContext();

    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lastMessage, setLastMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [inVolume, setInVolume] = useState(0);
    const [audioRecorder] = useState(() => new AudioRecorder());
    const [isInitialized, setIsInitialized] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // UI State for voice functions
    const [showSystemInfo, setShowSystemInfo] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState<string | null>(null);

    // Track if any UI elements should be shown (determines if floating windows appear)
    const hasFloatingElements = showSystemInfo || showDetailModal;


    useEffect(() => {
        // When DetailWindow opens, close other windows
        if (showDetailModal) {
            setShowSystemInfo(false);
        }
    }, [showDetailModal]);

    useEffect(() => {
        // When SystemInfo opens, close other windows
        if (showSystemInfo) {
            setShowDetailModal(null);
        }
    }, [showSystemInfo]);

    // Initialize voice action service and voice function registry
    useInitialEffect(() => {
        console.log('🔧 Initializing voice action service...');
        voiceActionService.initialize();

        console.log('🔧 Initializing voice function registry...');


        voiceFunctionRegistry.initialize({
            voiceActionService,
            dispatch,
            setShowSystemInfo,
            setShowDetailModal
        });
    }, [navigate]);

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

IMPORTANT UI INTEGRATION RULE: Do NOT verbally list available options or choices when asking users for input. Users can see all available options visually in the UI forms, so simply ask what they would like to choose without listing the specific options. For example, say "What payment terms would you prefer?" instead of "The payment options are Net 30, Net 60, Milestone-based..." This keeps voice responses natural and concise.

SCENARIOS you handle apart from general conversation:
- Initial connection: Briefly introduce yourself and ask how you can help with their procurement needs
- Explain capabilities: When users ask about your purpose, capabilities, "what do you do", "tell me about yourself", or similar queries about the system, use "show_system_info"
- Showing features: When users ask about specific features or want detailed information about system capabilities, use "show_feature_details" with the appropriate feature_id
- Analysis requests: When users want to analyze documents, proactively help them get started by showing the upload form by calling "show_upload_form"
- Analysis workflow: When files are uploaded through voice, analysis starts automatically. After processing completes, you will be notifited.
- Post-Analysis Commercial Terms: After BOM analysis is complete and displayed, ask the user if they want to proceed to commercial terms (e.g. "Would you like to proceed with setting up commercial terms for your RFQ?"). Only start commercial terms workflow when user explicitly agrees (says "ok", "yes", "proceed", etc.).
- Commercial Terms Workflow: When user agrees to proceed with commercial terms, call "show_commercial_terms" first, then guide them step by step through:
  1. Lead time: Ask "What's your desired lead time?" and use "set_lead_time" with their response
  2. Payment terms: Ask about payment preferences and use "set_payment_terms" with chosen option
  3. Delivery location: Ask "Where should components be delivered?" and use "set_delivery_location"
  4. Compliance: Ask about certifications needed and use "add_compliance_requirement" for each one
  5. Additional requirements: Ask about special instructions and use "set_additional_requirements"
  Summarization post-completion of filling is not required, as the user can see all terms in the UI.
- Post-Commercial Terms RFQ Preview: After completing commercial terms configuration, ask the user if they want to proceed to review the complete RFQ summary (e.g. "Would you like to proceed to review the complete RFQ summary?"). Only show RFQ preview when user explicitly agrees to proceed (says "ok", "yes", "show summary", "proceed", etc.).
- RFQ Preview Workflow: When user agrees to proceed to RFQ preview, call "show_rfq_preview" to display the complete summary of their request for quote including all configured details.

You have access to context-aware functions that change based on the current situation. Choose functions intelligently based on user intent and workflow context.

IMPORTANT: You have access to context-aware functions that change based on the current situation. Choose functions intelligently based on user intent and workflow context:
- For file uploads, use "show_upload_form"
- For commercial terms, use "show_commercial_terms"
- For RFQ preview/summary, use "show_rfq_preview"
- For navigation, use "navigate_to" with appropriate destinations
- For explaining capbilities or purpose, use "show_system_info"
- For showing feature details, use "show_feature_details" with the appropriate feature_id
- Commercial Terms Functions Available: set_lead_time, set_payment_terms, set_delivery_location, add_compliance_requirement, remove_compliance_requirement, set_additional_requirements, get_commercial_terms_status
- RFQ Preview Functions Available: show_rfq_preview, hide_rfq_preview

Always call the appropriate function based on user requests.`,
                    },
                ],
            },
            tools: [
                { functionDeclarations },
            ],
        });
    }, []);

    // Initialize connection handler with smooth transitions
    const handleInitialize = async () => {
        if (!config || !config.systemInstruction || !connect) {
            console.error('Configuration not ready');
            return;
        }

        setIsConnecting(true);

        console.log('🔗 Attempting initial connection...');
        try {
            await connect();
            console.log('✅ Connection successful!');

            // Wait for fade out transition
            setTimeout(() => {
                setIsInitialized(true);
                setIsConnecting(false);

                dispatch(initializeVoice({ sendText }));

                // Wait for fade in transition then send greeting
                setTimeout(() => {
                    const initialGreeting = "Hello!";
                    console.log('Sending initial greeting to Robbie...');
                    sendText(initialGreeting);
                }, 300);
            }, 300);

        } catch (err: any) {
            console.error('❌ Connection failed:', err.message || err);
            setError('Failed to connect to voice service');
            setIsConnecting(false);
        }
    };

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
        console.log(isMuted ? 'Unmuted' : 'Muted');
    };

    const handleDisconnect = () => {
        disconnect();
        setIsInitialized(false);
        dispatch(disconnectVoice());
        setLastMessage('');
        console.log('Disconnected from voice service');
    };

    return (
        <>
            {/* Sidebar Interface */}
            <div className="h-full flex flex-col relative overflow-hidden">
                {/* Welcome Interface - Fades out when initializing */}
                <div className={`absolute inset-0 flex flex-col transition-all duration-500 ease-in-out ${isInitialized ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
                    }`}>
                    {/* Welcome Header */}
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-accent-400 to-primary-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Hi there! I'm Robbie</h2>
                        <p className="text-white/70 mb-8 leading-relaxed text-lg">
                            Ready to chat? I can help you with procurement tasks, analyze your documents,
                            and make your RFQ process effortless.<br />
                            <span className="text-white/90 font-medium">Just speak naturally - I'm all ears!</span>
                        </p>
                    </div>

                    {/* Talk to Robbie Button at Bottom */}
                    <div className="p-6">
                        <Button
                            onClick={handleInitialize}
                            disabled={isConnecting}
                            className="w-full bg-gradient-to-r from-accent-500 to-primary-500 hover:from-accent-600 hover:to-primary-600 text-white font-semibold py-4 disabled:opacity-50"
                            icon={isConnecting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Sparkles className="w-5 h-5" />
                            )}
                        >
                            {isConnecting ? 'Connecting...' : 'Talk to Robbie'}
                        </Button>
                    </div>
                </div>

                {/* Voice Interface - Fades in when initialized with delay */}
                <div className={`absolute inset-0 flex flex-col transition-all duration-500 ease-in-out ${isInitialized ? 'opacity-100 pointer-events-auto delay-300' : 'opacity-0 pointer-events-none'
                    }`}>
                    {/* Header */}
                    <div className="pb-4 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-primary-400 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Robbie</h3>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${connected ? 'bg-green-400' : 'bg-yellow-400'
                                        }`} />
                                    <span className="text-xs text-white/70">
                                        {connected ? 'Listening...' : 'Connecting...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Voice Visualization */}
                    <div className="flex-1 flex flex-col items-center justify-center p-6">
                        <AudioVisualization
                            isListening={connected && !isMuted}
                            isSpeaking={isSpeaking}
                            audioLevel={volume || 0}
                            size={220}
                            className="mb-6"
                        />
                    </div>

                    {/* Last Message */}
                    {lastMessage && (
                        <div className="p-4 border-t border-white/10">
                            <div className="bg-white/10 rounded-lg p-3">
                                <p className="text-white/80 text-xs font-medium mb-1">Robbie:</p>
                                <p className="text-white text-sm leading-relaxed">{lastMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Voice Controls */}
                    <div className="p-4 border-t border-white/10">
                        <div className="space-y-3 w-full">
                            {/* Primary Action: Mute/Unmute */}
                            <Button
                                onClick={toggleMute}
                                variant="primary"
                                variantClass={isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : undefined}
                                className="w-full"
                                icon={isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            >
                                {isMuted ? 'Unmute' : 'Mute'}
                            </Button>

                            {/* Secondary Action: Disconnect */}
                            <Button
                                onClick={handleDisconnect}
                                variant="secondary"
                                className="w-full"
                                icon={<PhoneOff className="w-4 h-4" />}
                            >
                                End Conversation
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Windows Overlay */}
            {hasFloatingElements && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-6">
                    {showSystemInfo && (
                        <FloatingOverlayManager onClose={() => setShowSystemInfo(false)} />
                    )}

                    {showDetailModal && (
                        <DetailWindow
                            featureId={showDetailModal}
                            onClose={() => setShowDetailModal(null)}
                        />
                    )}
                </div>
            )}

            {/* Error Toast */}
            {error && (
                <Toast
                    message={error}
                    type="error"
                    isVisible={!!error}
                    onClose={() => setError('')}
                />
            )}
        </>
    );
};

export default VoiceInterfaceSidebar;
