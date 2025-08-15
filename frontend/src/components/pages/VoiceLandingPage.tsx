import React, { useState } from 'react';
import {
    Brain,
    Monitor,
    Sparkles,
    FileText,
    Users,
    TrendingUp,
    X
} from 'lucide-react';
import { useGeminiLive } from '../../hooks/useGeminiLive';
import { useVoiceFunctions } from '../../hooks/useVoiceFunctions';
import AudioVisualization from '../common/AudioVisualization';
import Button from '../common/Button';
import FileUpload from '../floating-windows/FileUpload';
import BOMAnalysis from '../floating-windows/BOMAnalysis';
import CommercialTerms from '../floating-windows/CommercialTerms';
import RFQPreview from '../floating-windows/RFQPreview';
import VoiceInterface from '../common/VoiceInterface.backup';
import { geminiLiveService } from '../../services/geminiLiveService';

interface VoiceLandingPageProps {
    onNavigateToDashboard: () => void;
    onNavigateToRFQ: () => void;
}

const VoiceLandingPage: React.FC<VoiceLandingPageProps> = ({
    onNavigateToDashboard,
    onNavigateToRFQ,
}) => {
    const {
        isConnected,
        error,
        lastMessage,
        isSpeaking,
        initialize,
        sendMessage,
    } = useGeminiLive({
        onError: (error: string) => console.error('Gemini Live Error:', error),
        onMessage: (message: string) => console.log('AI Response:', message),
    });

    const [conversationStarted, setConversationStarted] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const {
        executeFunction,
        updateStateFromUI,
        handleFileUpload,
        notifications,
        conversationState,
    } = useVoiceFunctions({
        setShowUploadForm,
        setCurrentStep,
        onNavigateToDashboard,
        onNavigateToRFQ,
    });

    // Voice state and handlers (handled by Gemini Live automatically)
    const voiceState = {
        isListening: isConnected ? geminiLiveService.getIsListening() : false,
        isSpeaking: isSpeaking,
        audioLevel: 0,
        error: error,
        isInitialized: isConnected,
        isProcessing: false,
        isConnected: isConnected,
        lastMessage: lastMessage,
    };

    const toggleListening = async () => {
        try {
            if (isConnected) {
                if (geminiLiveService.getIsListening()) {
                    geminiLiveService.stopListening();
                } else {
                    await geminiLiveService.startListening();
                }
            }
        } catch (error) {
            console.error('Error toggling listening:', error);
        }
    };

    const stopSpeaking = () => {
        console.log('Stopping AI audio playback...');
        geminiLiveService.stopSpeaking();
    };

    // Track if any UI elements should be shown (determines layout)
    // Only show split layout when forms are actually open, not just when files exist
    const hasFloatingElements =
        showUploadForm ||
        currentStep === 2 ||
        currentStep === 3 ||
        currentStep === 4;

    // Debug logging
    console.log(
        'VoiceLandingPage render - currentStep:',
        currentStep,
        'showUploadForm:',
        showUploadForm,
        'hasFloatingElements:',
        hasFloatingElements
    );

    // Initialize Gemini Voice on first interaction
    const handleStartConversation = async () => {
        try {
            await initialize();
            setConversationStarted(true);

            // Start listening immediately after connection
            setTimeout(async () => {
                if (isConnected) {
                    await geminiLiveService.startListening();
                    console.log(
                        '🎤 Auto-started listening after voice experience initialization'
                    );
                }
            }, 1000); // Small delay to ensure connection is fully established

            // AI greeting via Gemini Live
            // await sendMessage("Hello! I'm ready to help with procurement tasks. Please introduce yourself and explain what you can help with.");
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

    const handleQuickAction = async (action: string) => {
        const actionCommands = {
            'create-rfq': 'I want to create a new RFQ',
            'analyze-bom': 'I need to upload and analyze a BOM file',
            'find-suppliers': 'Help me find suppliers',
            'view-dashboard': 'Show me the dashboard',
        };

        const command = actionCommands[action as keyof typeof actionCommands];
        if (command) {
            // await sendMessage(command);

            // Execute corresponding actions for immediate feedback
            switch (action) {
                case 'create-rfq':
                    setTimeout(() => onNavigateToRFQ(), 2000);
                    break;
                case 'analyze-bom':
                    await executeFunction('show_upload_form', {
                        reason: 'User requested BOM analysis',
                    });
                    break;
                case 'view-dashboard':
                    setTimeout(() => onNavigateToDashboard(), 2000);
                    break;
            }
        }
    };

    // Handle file upload
    const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            const uploadedFile = handleFileUpload(files[0]);
            if (sendMessage) {
                sendMessage(
                    `I've uploaded a file named ${uploadedFile.name}. Please analyze it.`
                );
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-900 via-surface-800 to-primary-900 relative overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Brain className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Project Robbie
                                </h1>
                                <p className="text-surface-300 text-sm font-medium">
                                    AI-Powered Procurement Assistant
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* TODO: User details instead of button */}
                            <Button
                                onClick={onNavigateToDashboard}
                                variant="outline"
                                icon={<Monitor className="w-4 h-4" />}
                                className="text-sm border-white/20 text-white hover:bg-white/10"
                            >
                                Classic Mode
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

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

            <div className="relative" style={{ height: 'calc(100vh - 85px)' }}>
                {!conversationStarted ? (
                    /* Welcome Screen - Full Center */
                    <div className="absolute inset-0 flex items-center justify-center px-6">
                        <div className="text-center max-w-2xl mx-auto">
                            <div className="mb-8">
                                <AudioVisualization
                                    isListening={false}
                                    isSpeaking={false}
                                    audioLevel={0}
                                    size={250}
                                    className="mb-6"
                                />
                            </div>

                            <h2 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white to-surface-200 bg-clip-text text-transparent">
                                Meet Robbie
                            </h2>
                            <p className="text-xl text-surface-300 mb-8 leading-relaxed">
                                Your AI-powered procurement assistant is ready
                                to revolutionize your sourcing process with
                                intelligent automation and insights.
                            </p>

                            <Button
                                onClick={handleStartConversation}
                                className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white shadow-2xl transform hover:scale-105 transition-all duration-200"
                                icon={<Sparkles className="w-6 h-6" />}
                            >
                                Start Voice Experience
                            </Button>

                            {/* Quick Actions - Bottom */}
                            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { id: 'create-rfq', label: 'Create RFQ', icon: Sparkles },
                                    { id: 'analyze-bom', label: 'Analyze BOM', icon: FileText },
                                    { id: 'find-suppliers', label: 'Find Suppliers', icon: Users },
                                    { id: 'view-dashboard', label: 'Dashboard', icon: TrendingUp }
                                ].map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={() => handleQuickAction(action.id)}
                                        className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 text-white border border-white/20 hover:border-white/40"
                                    >
                                        <action.icon className="w-6 h-6 mx-auto mb-2" />
                                        <span className="text-sm font-medium">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Active Voice Interface - Smooth Transitioning Layout */
                    <div className="flex h-full max-w-7xl mx-auto transition-all duration-700 ease-in-out">
                        {/* Voice Interface Container - Smoothly transitions from center to left */}
                        <div
                            className={`h-full flex items-center justify-center p-6 transition-all duration-700 ease-in-out ${hasFloatingElements ? 'w-1/2' : 'w-full'
                                }`}
                        >
                            <div
                                className={`transition-all duration-700 ease-in-out ${hasFloatingElements
                                    ? 'transform-none'
                                    : 'transform-none'
                                    }`}
                            >
                                <VoiceInterface
                                    audioState={voiceState}
                                    onToggleListening={toggleListening}
                                    executeFunction={executeFunction}
                                    onStopSpeaking={stopSpeaking}
                                    sendMessage={sendMessage}
                                />
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
                                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-h-[80vh] overflow-y-auto">
                                    {/* Window Header */}
                                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            File Upload
                                        </h3>
                                        <button
                                            onClick={() =>
                                                executeFunction(
                                                    'hide_upload_form'
                                                )
                                            }
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>

                                    {/* FileUpload Component */}
                                    <div className="p-6">
                                        <FileUpload
                                            onNext={() => {
                                                // Hide upload form and provide clear next steps
                                                executeFunction(
                                                    'hide_upload_form'
                                                );
                                                if (sendMessage) {
                                                    sendMessage(
                                                        "Great! Your files have been uploaded and processed. You can now say 'analyze BOM' to review them, or tell me what else you'd like to do."
                                                    );
                                                }
                                            }}
                                            onCancel={() =>
                                                executeFunction(
                                                    'hide_upload_form'
                                                )
                                            }
                                            onFilesChange={(files) => {
                                                // Convert FileUpload files to voice function registry format and update state
                                                const voiceFiles = files.map(
                                                    (file) => ({
                                                        id: file.id,
                                                        name: file.name,
                                                        type: file.file.type,
                                                        size: file.size,
                                                        uploadedAt: new Date(),
                                                        status:
                                                            file.status ===
                                                                'complete'
                                                                ? ('uploaded' as const)
                                                                : ('uploading' as const),
                                                    })
                                                );

                                                // Update the voice function registry with the entire files array
                                                updateStateFromUI(
                                                    'FILES_UPDATED',
                                                    voiceFiles
                                                );
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-h-[80vh] overflow-y-auto">
                                    {/* Window Header */}
                                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            BOM Analysis
                                        </h3>
                                        <button
                                            onClick={() => {
                                                executeFunction(
                                                    'hide_bom_analysis'
                                                );
                                                if (sendMessage) {
                                                    sendMessage(
                                                        "I've closed the BOM analysis. What would you like to do next? You can say 'commercial terms' to proceed, 'dashboard' to view analytics, or tell me something else you'd like to do."
                                                    );
                                                }
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>

                                    {/* BOM Analysis Component */}
                                    <div className="p-6">
                                        <BOMAnalysis
                                            onNext={() => {
                                                // Just hide BOM analysis, don't auto-proceed to commercial terms
                                                executeFunction(
                                                    'hide_bom_analysis'
                                                );
                                                if (sendMessage) {
                                                    sendMessage(
                                                        "Excellent! I've completed the BOM analysis and identified cost optimization opportunities. What would you like to do next? You can say 'commercial terms' to proceed with defining payment and compliance requirements, 'dashboard' to view analytics, or ask me about any specific component details."
                                                    );
                                                }
                                            }}
                                            onCancel={() => {
                                                executeFunction(
                                                    'hide_bom_analysis'
                                                );
                                                if (sendMessage) {
                                                    sendMessage(
                                                        "I've closed the BOM analysis. What would you like to do next? You can say 'commercial terms' to proceed, 'dashboard' to view analytics, or tell me something else you'd like to do."
                                                    );
                                                }
                                            }}
                                            uploadedFiles={
                                                conversationState.uploadedFiles
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-h-[80vh] overflow-y-auto">
                                    {/* Window Header */}
                                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Commercial Terms
                                        </h3>
                                        <button
                                            onClick={() =>
                                                executeFunction(
                                                    'hide_commercial_terms'
                                                )
                                            }
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>

                                    {/* Commercial Terms Component */}
                                    <div className="p-6">
                                        <CommercialTerms
                                            onNext={() => {
                                                // Move to step 4 (Preview) instead of just hiding
                                                setCurrentStep(4);
                                                if (sendMessage) {
                                                    sendMessage(
                                                        'Commercial terms saved! Now showing RFQ preview.'
                                                    );
                                                }
                                            }}
                                            onCancel={() =>
                                                executeFunction(
                                                    'hide_commercial_terms'
                                                )
                                            }
                                            bomData={
                                                conversationState.uploadedFiles
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-h-[80vh] overflow-y-auto">
                                    {/* Window Header */}
                                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            RFQ Preview
                                        </h3>
                                        <button
                                            onClick={() => setCurrentStep(1)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>

                                    {/* RFQ Preview Component */}
                                    <div className="p-6">
                                        <RFQPreview
                                            onNext={() => {
                                                // Navigate to dashboard after successful RFQ send
                                                setCurrentStep(1);
                                                if (sendMessage) {
                                                    sendMessage(
                                                        'RFQ sent successfully! Redirecting to dashboard.'
                                                    );
                                                }
                                                setTimeout(
                                                    () =>
                                                        onNavigateToDashboard(),
                                                    2000
                                                );
                                            }}
                                            onCancel={() => setCurrentStep(1)}
                                            bomData={
                                                conversationState.uploadedFiles
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceLandingPage;
