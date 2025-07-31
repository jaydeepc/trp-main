import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Mic,
  MicOff,
  MessageSquare,
  Settings,
  Monitor,
  Sparkles,
  ArrowRight,
  Volume2,
  VolumeX,
  Loader2
} from 'lucide-react';
import { useStreamingAvatar, AvatarSessionState } from '../../hooks/useStreamingAvatar';
import { avatarService } from '../../services/avatarService';
import { ROBBIE_PERSONALITY } from '../../lib/avatarConstants';
import Button from '../common/Button';
import Card from '../common/Card';
import Step1DefineRequirement from '../forms/Step1DefineRequirement';
 
interface AvatarLandingPageProps {
  onNavigateToDashboard: () => void;
  onNavigateToRFQ: () => void;
}
 
const AvatarLandingPage: React.FC<AvatarLandingPageProps> = ({
  onNavigateToDashboard,
  onNavigateToRFQ
}) => {
  const {
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
    clearError
  } = useStreamingAvatar();
 
  const [textInput, setTextInput] = useState('');
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showClassicMode, setShowClassicMode] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
 
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current!.play();
 
        // Setup chroma key when video is ready
        if (canvasRef.current && isChromaKeyEnabled) {
          setupChromaKeyForVideo(videoRef.current!, canvasRef.current);
        }
      };
    }
  }, [stream, setupChromaKeyForVideo, isChromaKeyEnabled]);
 
  // Auto-show upload form after avatar greeting
  useEffect(() => {
    if (sessionState === AvatarSessionState.CONNECTED) {
      // Wait for greeting to complete (about 8 seconds)
      const timer = setTimeout(() => {
        setShowUploadForm(true);
      }, 8000);
 
      return () => clearTimeout(timer);
    }
  }, [sessionState]);
 
  const handleStartSession = async (withVoice: boolean = false) => {
    try {
      setIsStarting(true);
      clearError();
 
      // Wait for fade animation to complete (1000ms)
      await new Promise(resolve => setTimeout(resolve, 1000));
 
      const token = await avatarService.fetchAccessToken();
      await initAvatar(token);
      await startAvatar();
 
      if (withVoice) {
        await startVoiceChat();
        setIsVoiceChatActive(true);
      }
    } catch (err) {
      console.error('Failed to start avatar session:', err);
    } finally {
      setIsStarting(false);
    }
  };
 
  const handleStopSession = async () => {
    try {
      if (isVoiceChatActive) {
        await stopVoiceChat();
        setIsVoiceChatActive(false);
      }
      await stopAvatar();
    } catch (err) {
      console.error('Failed to stop avatar session:', err);
    }
  };
 
  const handleSendTextMessage = async () => {
    if (!textInput.trim()) return;
 
    try {
      await sendMessage(textInput);
      setTextInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };
 
  const handleToggleVoiceChat = async () => {
    try {
      if (isVoiceChatActive) {
        await stopVoiceChat();
        setIsVoiceChatActive(false);
      } else {
        await startVoiceChat();
        setIsVoiceChatActive(true);
      }
    } catch (err) {
      console.error('Failed to toggle voice chat:', err);
    }
  };
 
  const handleQuickAction = async (action: string) => {
    const actionMessages = {
      'create-rfq': "I'd like to create a new RFQ",
      'analyze-bom': "Can you help me analyze my BOM?",
      'find-suppliers': "I need help finding suppliers",
      'view-dashboard': "Show me my procurement dashboard"
    };
 
    const message = actionMessages[action as keyof typeof actionMessages];
    if (message) {
      if (sessionState === AvatarSessionState.CONNECTED) {
        await sendMessage(message);
      } else {
        // If avatar not connected, handle navigation directly
        if (action === 'view-dashboard') {
          onNavigateToDashboard();
        } else if (action === 'create-rfq') {
          onNavigateToRFQ();
        }
      }
    }
  };
 
  return (
    <div className="min-h-screen bg-surface-900 relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-surface-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-surface-900">Project Robbie</h1>
                <p className="text-surface-600 text-sm font-medium">AI-Powered Procurement Assistant</p>
              </div>
            </div>
 
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowClassicMode(!showClassicMode)}
                variant="outline"
                icon={<Monitor className="w-4 h-4" />}
                className="text-sm"
              >
                {showClassicMode ? 'Avatar Mode' : 'Classic Mode'}
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
 
      {showClassicMode ? (
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Classic Mode - Quick Navigation */}
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-surface-900 mb-4">
                Welcome to Project Robbie
              </h2>
              <p className="text-lg text-surface-600 max-w-2xl mx-auto">
                Your AI-powered procurement intelligence platform. Choose how you'd like to proceed:
              </p>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={onNavigateToDashboard}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                    <Monitor className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-surface-900 mb-2">Dashboard</h3>
                  <p className="text-surface-600 mb-4">
                    Access your procurement analytics, supplier insights, and manage existing RFQs
                  </p>
                  <ArrowRight className="w-5 h-5 text-primary-600 mx-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
 
              <Card className="p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={onNavigateToRFQ}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-200 transition-colors">
                    <Sparkles className="w-8 h-8 text-accent-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-surface-900 mb-2">Create RFQ</h3>
                  <p className="text-surface-600 mb-4">
                    Start a new smart RFQ with AI-powered supplier matching and optimization
                  </p>
                  <ArrowRight className="w-5 h-5 text-accent-600 mx-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </div>
          </div>
        </main>
      ) : (
        // Avatar Mode - Immersive Full-Screen Experience
        <div className="relative" style={{ height: 'calc(100vh - 85.75px)' }}>
          {/* Full-Screen Avatar Video Background */}
          <div className="absolute inset-0 z-0">
            {sessionState === AvatarSessionState.CONNECTED && stream ? (
              <div className="w-full h-full flex">
                {/* Avatar Container - transitions from full width to half width */}
                <div className={`h-full pt-16 flex items-end mt-auto justify-center transition-all duration-1000 ease-in-out ${showUploadForm ? 'w-1/2' : 'w-full'
                  }`}>
                  <video
                    ref={videoRef}
                    className={`h-full w-auto object-contain ${isChromaKeyEnabled ? 'hidden' : 'block'}`}
                    autoPlay
                    playsInline
                    muted={isMuted}
                  />
                  <canvas
                    ref={canvasRef}
                    className={`h-full w-auto object-contain ${isChromaKeyEnabled ? 'block' : 'hidden'}`}
                  />
                </div>
 
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-surface-900 via-surface-800 to-primary-900 flex items-center justify-center">
                {sessionState === AvatarSessionState.CONNECTING ? (
                  <div className="text-center text-white transition-opacity duration-700 ease-in-out opacity-100">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-primary-400" />
                    <h3 className="text-3xl font-bold mb-4 text-surface-300">Connecting to Robbie...</h3>
                    <p className="text-xl text-surface-300">Preparing your AI assistant</p>
                  </div>
                ) : (
                  <div className={`text-center text-white max-w-2xl mx-auto px-6 transition-opacity duration-1000 ease-in-out ${sessionState === AvatarSessionState.INACTIVE && !isStarting
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none'
                    }`}>
                    <div className="relative mb-8">
                      <div className="w-32 h-32 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <Brain className="w-16 h-16" />
                      </div>
                    </div>
                    <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-surface-200 bg-clip-text text-transparent">
                      Meet Robbie
                    </h2>
                    <p className="text-xl text-surface-300 mb-12 leading-relaxed">
                      Your AI-powered procurement assistant is ready to revolutionize your sourcing process with intelligent automation and insights.
                    </p>
 
                    {/* Start Button */}
                    <Button
                      onClick={() => handleStartSession(true)}
                      className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white shadow-2xl transform hover:scale-105 transition-all duration-200"
                      icon={<Sparkles className="w-6 h-6" />}
                    >
                      Start Experience
                    </Button>
 
 
                    {/* Bottom Horizontal Panels Container */}
                    <div className="mt-10">
                      <div className="flex flex-row gap-6 justify-center items-start max-w-6xl">
                        {/* Quick Actions */}
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 flex-1 min-w-80 max-w-80">
                          <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center space-x-2">
                            <Sparkles className="w-5 h-5 text-primary-600" />
                            <span>Quick Actions</span>
                          </h3>
                          <div className="space-y-3">
                            {[
                              { id: 'create-rfq', label: 'Create New RFQ', icon: Sparkles, color: 'text-primary-600' },
                              { id: 'analyze-bom', label: 'Analyze BOM', icon: Settings, color: 'text-accent-600' },
                              { id: 'find-suppliers', label: 'Find Suppliers', icon: Brain, color: 'text-primary-600' },
                              { id: 'view-dashboard', label: 'View Dashboard', icon: Monitor, color: 'text-accent-600' }
                            ].map((action) => (
                              <button
                                key={action.id}
                                onClick={() => handleQuickAction(action.id)}
                                className="w-full flex items-center space-x-3 p-4 bg-surface-50 hover:bg-surface-100 rounded-xl transition-all duration-200 text-left hover:shadow-md group"
                              >
                                <action.icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} />
                                <span className="font-medium text-surface-900">{action.label}</span>
                                <ArrowRight className="w-4 h-4 text-surface-400 ml-auto group-hover:translate-x-1 transition-transform" />
                              </button>
                            ))}
                          </div>
                        </div>
 
                        {/* Help Section */}
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 flex-1 min-w-80 max-w-80">
                          <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center space-x-2">
                            <Brain className="w-5 h-5 text-accent-600" />
                            <span>How Robbie Can Help</span>
                          </h3>
                          <div className="space-y-3 text-sm text-surface-600 text-left">
                            {ROBBIE_PERSONALITY.helpPrompts.slice(0, 4).map((prompt, index) => (
                              <div key={index} className="flex items-start space-x-3 p-2 hover:bg-surface-50 rounded-lg transition-colors">
                                <div className="w-2 h-2 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="leading-relaxed">{prompt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
 
 
            {/* Error Display */}
            {error && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 p-4 bg-red-500/90 text-white rounded-xl backdrop-blur-sm shadow-lg z-10 max-w-md">
                {error}
              </div>
            )}
          </div>
 
          {/* Audio Controls */}
          {sessionState === AvatarSessionState.CONNECTED && (
            <div className="absolute top-6 right-6 flex space-x-2 z-50">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 bg-black/70 hover:bg-black/80 rounded-xl text-white transition-colors backdrop-blur-sm shadow-xl border border-white/20"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleChromaKey}
                className={`p-3 rounded-xl transition-colors backdrop-blur-sm shadow-xl border border-white/20 ${isChromaKeyEnabled
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-black/70 hover:bg-black/80 text-white'
                  }`}
                title={isChromaKeyEnabled ? 'Disable Transparent Background' : 'Enable Transparent Background'}
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          )}
 
          {/* Listening Indicator */}
          {isListening && (
            <div className="absolute top-6 left-6 flex items-center space-x-3 bg-gray-800/80 text-white px-6 py-3 rounded-full backdrop-blur-sm shadow-lg z-50 border border-gray-600/30">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-medium">Listening...</span>
            </div>
          )}
 
          {/* Session Controls for Connected State */}
          {sessionState === AvatarSessionState.CONNECTED && (
            <div className="absolute bottom-12 left-8 z-40">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleToggleVoiceChat}
                    variant={isVoiceChatActive ? "primary" : "outline"}
                    className={isVoiceChatActive ? "bg-accent-600 hover:bg-accent-700 text-white" : ""}
                    icon={isVoiceChatActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  >
                    {isVoiceChatActive ? 'Voice On' : 'Voice Off'}
                  </Button>
                  <Button
                    onClick={handleStopSession}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    End Session
                  </Button>
                </div>
              </div>
            </div>
          )}
 
          {/* Floating Upload Form on Right Side */}
          {showUploadForm && (
            <div className="absolute top-0 right-0 w-1/2 h-full flex items-center justify-center p-8 z-40">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-h-[90vh] overflow-y-auto transition-all duration-1000 delay-500 animate-in slide-in-from-right fade-in">
                <div className="p-8">
                  <Step1DefineRequirement
                    rfq={{} as any}
                    onNext={() => {
                      console.log('Upload form next step');
                    }}
                    onCancel={() => {
                      setShowUploadForm(false);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
 
export default AvatarLandingPage;