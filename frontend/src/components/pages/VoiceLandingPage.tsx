import React, { useState, useEffect } from 'react';
import {
  Brain,
  Mic,
  MicOff,
  Monitor,
  Sparkles,
  ArrowRight,
  Settings,
  FileText,
  Users,
  TrendingUp,
  X
} from 'lucide-react';
import { useAudioInterface } from '../../hooks/useAudioInterface';
import { useVoiceFunctions } from '../../hooks/useVoiceFunctions';
import AudioVisualization from '../common/AudioVisualization';
import Button from '../common/Button';
import Card from '../common/Card';
import FileUpload from '../floating-windows/FileUpload';
import BOMAnalysis from '../floating-windows/BOMAnalysis';
import CommercialTerms from '../floating-windows/CommercialTerms';
import RFQPreview from '../floating-windows/RFQPreview';
import VoiceInterface from '../common/VoiceInterface';

interface VoiceLandingPageProps {
  onNavigateToDashboard: () => void;
  onNavigateToRFQ: () => void;
}

const VoiceLandingPage: React.FC<VoiceLandingPageProps> = ({
  onNavigateToDashboard,
  onNavigateToRFQ
}) => {
  const {
    audioState,
    initializeAudio,
    startListening,
    stopListening,
    speak,
    cleanup
  } = useAudioInterface();

  const [showClassicMode, setShowClassicMode] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Initialize voice functions
  const {
    executeFunction,
    updateStateFromUI,
    handleFileUpload,
    mockGeminiLiveCall,
    notifications,
    hasUploadedFiles,
    conversationState
  } = useVoiceFunctions({
    setShowUploadForm,
    setCurrentStep,
    onNavigateToDashboard,
    onNavigateToRFQ
  });

  // Track if any UI elements should be shown (determines layout)
  const hasFloatingElements = showUploadForm || hasUploadedFiles || currentStep === 2 || currentStep === 3 || currentStep === 4;

  // Initialize audio on first interaction
  const handleStartConversation = async () => {
    try {
      await initializeAudio();
      setConversationStarted(true);

      // AI greeting
      speak("Hello! I'm Robbie, your AI procurement assistant. I can help you create smart RFQs, analyze your BOMs, find suppliers, and optimize your procurement process. What would you like to work on today?", 5000);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleToggleListening = async () => {
    if (audioState.isListening) {
      stopListening();
    } else {
      startListening();

      // For testing - simulate voice input processing
      setTimeout(async () => {
        if (audioState.isListening) {
          stopListening();
          // Mock voice processing
          const mockInput = "show upload form";
          const result = await mockGeminiLiveCall(mockInput);
          speak(result.response, 3000);
        }
      }, 3000);
    }
  };

  const handleQuickAction = async (action: string) => {
    const actionMessages = {
      'create-rfq': "Perfect! Let's create a new smart RFQ. I'll guide you through the process.",
      'analyze-bom': "I'd be happy to analyze your Bill of Materials! Please upload your BOM file.",
      'find-suppliers': "I can help you find the best suppliers from our database of 200+ verified partners.",
      'view-dashboard': "Let me show you your procurement dashboard with real-time analytics and insights."
    };

    const message = actionMessages[action as keyof typeof actionMessages];
    if (message) {
      speak(message, 3000);

      // Execute corresponding actions
      switch (action) {
        case 'create-rfq':
          setTimeout(() => onNavigateToRFQ(), 2000);
          break;
        case 'analyze-bom':
          // Show upload form via voice function
          await executeFunction('show_upload_form', { reason: 'User requested BOM analysis' });
          break;
        case 'find-suppliers':
          // Could trigger supplier search UI
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
      speak(`File ${uploadedFile.name} uploaded successfully. I'll analyze it now.`, 3000);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
                <h1 className="text-2xl font-bold text-white">Project Robbie</h1>
                <p className="text-surface-300 text-sm font-medium">AI-Powered Procurement Assistant</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowClassicMode(!showClassicMode)}
                variant="outline"
                icon={<Monitor className="w-4 h-4" />}
                className="text-sm border-white/20 text-white hover:bg-white/10"
              >
                {showClassicMode ? 'Voice Mode' : 'Classic Mode'}
              </Button>

              {showClassicMode && (
                <Button
                  onClick={onNavigateToDashboard}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  Go to Dashboard
                </Button>
              )}
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

      {showClassicMode ? (
        /* Classic Mode Interface */
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Welcome to Project Robbie
              </h2>
              <p className="text-lg text-surface-300 max-w-2xl mx-auto">
                Your AI-powered procurement intelligence platform. Choose how you'd like to proceed:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 border-white/20" onClick={onNavigateToDashboard}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                    <Monitor className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Dashboard</h3>
                  <p className="text-surface-300 mb-4">
                    Access your procurement analytics, supplier insights, and manage existing RFQs
                  </p>
                  <ArrowRight className="w-5 h-5 text-primary-400 mx-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white/10 border-white/20" onClick={onNavigateToRFQ}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-200 transition-colors">
                    <Sparkles className="w-8 h-8 text-accent-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Create RFQ</h3>
                  <p className="text-surface-300 mb-4">
                    Start a new smart RFQ with AI-powered supplier matching and optimization
                  </p>
                  <ArrowRight className="w-5 h-5 text-accent-400 mx-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </div>
          </div>
        </main>
      ) : (
        /* Voice Mode Interface - Pure Voice First */
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
                  Your AI-powered procurement assistant is ready to revolutionize your sourcing process with intelligent automation and insights.
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
              <div className={`h-full flex items-center justify-center p-6 transition-all duration-700 ease-in-out ${hasFloatingElements
                ? 'w-1/2'
                : 'w-full'
                }`}>
                <div className={`transition-all duration-700 ease-in-out ${hasFloatingElements ? 'transform-none' : 'transform-none'
                  }`}>
                  <VoiceInterface
                    audioState={audioState}
                    onToggleListening={handleToggleListening}
                    executeFunction={executeFunction}
                  />
                </div>
              </div>

              {/* Floating Windows Container - Slides in from right */}
              <div className={`h-full flex items-center justify-center p-6 transition-all duration-700 ease-in-out ${hasFloatingElements
                ? 'w-1/2 opacity-100 translate-x-0'
                : 'w-0 opacity-0 translate-x-full overflow-hidden'
                }`}>
                {showUploadForm && (
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-h-[80vh] overflow-y-auto">
                    {/* Window Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">File Upload</h3>
                      <button
                        onClick={() => executeFunction('hide_upload_form')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    {/* FileUpload Component */}
                    <div className="p-6">
                      <FileUpload
                        onNext={() => {
                          // Just hide upload form, don't auto-show BOM analysis
                          executeFunction('hide_upload_form');
                          speak("Files uploaded successfully! Say 'analyze BOM' when you're ready to review them.", 3000);
                        }}
                        onCancel={() => executeFunction('hide_upload_form')}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-h-[80vh] overflow-y-auto">
                    {/* Window Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">BOM Analysis</h3>
                      <button
                        onClick={() => executeFunction('hide_bom_analysis')}
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
                          executeFunction('hide_bom_analysis');
                          speak("BOM analysis complete! Say 'commercial terms' when you're ready to proceed to the next step.", 3000);
                        }}
                        onCancel={() => executeFunction('hide_bom_analysis')}
                        uploadedFiles={conversationState.uploadedFiles}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-h-[80vh] overflow-y-auto">
                    {/* Window Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Commercial Terms</h3>
                      <button
                        onClick={() => executeFunction('hide_commercial_terms')}
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
                          speak("Commercial terms saved! Now showing RFQ preview.", 3000);
                        }}
                        onCancel={() => executeFunction('hide_commercial_terms')}
                        bomData={conversationState.uploadedFiles}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-h-[80vh] overflow-y-auto">
                    {/* Window Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">RFQ Preview</h3>
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
                          speak("RFQ sent successfully! Redirecting to dashboard.", 3000);
                          setTimeout(() => onNavigateToDashboard(), 2000);
                        }}
                        onCancel={() => setCurrentStep(1)}
                        bomData={conversationState.uploadedFiles}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceLandingPage;
