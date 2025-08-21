import React, { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';
import { useCommercialTermsContext, CommercialTermsData } from '../contexts/CommercialTermsContext';
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
import FloatingOverlayManager from '../components/common/FloatingOverlayManager';
import DetailWindow from '../components/voice/DetailWindow';

const InteractionPage: React.FC = () => {
    return (
        <div className="absolute inset-0">
            <VoiceInterface />
        </div>
    );
};

const VoiceInterface: React.FC = () => {
    const { client, connected, connect, disconnect, volume, setConfig, config, sendText } = useLiveAPIContext();
    const { updateField: updateCommercialTermsField } = useCommercialTermsContext();
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lastMessage, setLastMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [inVolume, setInVolume] = useState(0);
    const [audioRecorder] = useState(() => new AudioRecorder());

    // UI State for voice functions
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [showSystemInfo, setShowSystemInfo] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [notifications, setNotifications] = useState<Array<{
        id: string;
        message: string;
        type: 'info' | 'success' | 'error';
        timestamp: Date;
    }>>([]);

    // Track if any UI elements should be shown (determines layout)
    const hasFloatingElements = showUploadForm || showSystemInfo || showDetailModal || currentStep === 2 || currentStep === 3 || currentStep === 4;

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

    // Mutual exclusion logic for floating windows
    useEffect(() => {
        // When BOM analysis opens (currentStep === 2), close other windows
        if (currentStep === 2) {
            setShowDetailModal(null);
            setShowSystemInfo(false);
            setShowUploadForm(false);
        }
    }, [currentStep]);

    useEffect(() => {
        // When DetailWindow opens, close other windows
        if (showDetailModal) {
            setShowSystemInfo(false);
            setShowUploadForm(false);
            if (currentStep !== 1) {
                setCurrentStep(1);
            }
        }
    }, [showDetailModal]);

    useEffect(() => {
        // When SystemInfo opens, close other windows
        if (showSystemInfo) {
            setShowDetailModal(null);
            setShowUploadForm(false);
            if (currentStep !== 1) {
                setCurrentStep(1);
            }
        }
    }, [showSystemInfo]);

    useEffect(() => {
        // When UploadForm opens, close other windows
        if (showUploadForm) {
            setShowDetailModal(null);
            setShowSystemInfo(false);
            if (currentStep !== 1) {
                setCurrentStep(1);
            }
        }
    }, [showUploadForm]);

    // Initialize voice function registry
    useInitialEffect(() => {
        console.log('🔧 Initializing voice function registry...');
        
        // Wrapper function to handle type conversion
        const handleCommercialTermsFieldUpdate = (field: string, value: any) => {
            // Ensure field is a valid key of CommercialTermsData
            if (field === 'desiredLeadTime' || field === 'paymentTerms' || field === 'deliveryLocation' || 
                field === 'complianceRequirements' || field === 'additionalRequirements') {
                updateCommercialTermsField(field as keyof CommercialTermsData, value);
            } else {
                console.warn(`Invalid commercial terms field: ${field}`);
            }
        };

        voiceFunctionRegistry.initialize({
            setShowUploadForm,
            setCurrentStep,
            navigateTo,
            updateFiles,
            showNotification,
            setShowSystemInfo,
            setShowDetailModal,
            updateCommercialTermsField: handleCommercialTermsFieldUpdate
        });
    }, [updateCommercialTermsField]);

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
- Analysis processing: When you're about to call "analyse_bom", first inform the user that BOM analysis will take about 10 seconds to process and ask them to please wait. This sets proper expectations for the processing time.
- Analysis workflow: After calling "analyse_bom" and receiving results, ALWAYS call "show_bom_analysis" function first to display the analysis interface, then provide verbal explanation of the results. This creates better user experience by showing visual data before talking.
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
- For BOM analysis, use "analyse_bom",
- For showing BOM analysis, use "show_bom_analysis"
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

    useEffect(() => {
        if (config && config.systemInstruction && !connected && connect) {
            console.log('🔗 Attempting initial connection...');
            connect()
                .then(() => {
                    console.log('✅ Connection successful!');
                    
                    // Send initial greeting message to make Robbie start talking proactively
                    setTimeout(() => {
                        const initialGreeting = "Hello!";
                        console.log('Sending initial greeting to Robbie...');
                        sendText(initialGreeting);
                    }, 500);
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
