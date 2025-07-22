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
    initAvatar,
    startAvatar,
    stopAvatar,
    sendMessage,
    startVoiceChat,
    stopVoiceChat,
    clearError
  } = useStreamingAvatar();

  const [textInput, setTextInput] = useState('');
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showClassicMode, setShowClassicMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current!.play();
      };
    }
  }, [stream, videoRef]);

  const handleStartSession = async (withVoice: boolean = false) => {
    try {
      clearError();
      const token = await avatarService.fetchAccessToken();
      await initAvatar(token);
      await startAvatar();
      
      if (withVoice) {
        await startVoiceChat();
        setIsVoiceChatActive(true);
      }
    } catch (err) {
      console.error('Failed to start avatar session:', err);
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
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-primary-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-surface-200/50 shadow-sm">
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {showClassicMode ? (
          // Classic Mode - Quick Navigation
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
        ) : (
          // Avatar Mode - Main Experience
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Avatar Video Section */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="relative aspect-video bg-gradient-to-br from-surface-900 to-surface-800 rounded-xl overflow-hidden mb-4">
                  {sessionState === AvatarSessionState.CONNECTED && stream ? (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted={isMuted}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {sessionState === AvatarSessionState.CONNECTING ? (
                        <div className="text-center text-white">
                          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                          <p className="text-lg">Connecting to Robbie...</p>
                        </div>
                      ) : (
                        <div className="text-center text-white">
                          <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Brain className="w-12 h-12" />
                          </div>
                          <h3 className="text-2xl font-bold mb-2">Meet Robbie</h3>
                          <p className="text-surface-300 mb-6 max-w-md">
                            Your AI procurement assistant is ready to help you create smart RFQs and optimize your procurement process.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Audio Controls */}
                  {sessionState === AvatarSessionState.CONNECTED && (
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  {/* Listening Indicator */}
                  {isListening && (
                    <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-accent-500 text-white px-3 py-2 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Listening...</span>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-col space-y-4">
                  {sessionState === AvatarSessionState.INACTIVE ? (
                    <div className="flex space-x-4">
                      <Button
                        onClick={() => handleStartSession(true)}
                        className="flex-1 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white"
                        icon={<Mic className="w-4 h-4" />}
                      >
                        Start Voice Chat
                      </Button>
                      <Button
                        onClick={() => handleStartSession(false)}
                        variant="outline"
                        className="flex-1"
                        icon={<MessageSquare className="w-4 h-4" />}
                      >
                        Start Text Chat
                      </Button>
                    </div>
                  ) : sessionState === AvatarSessionState.CONNECTED ? (
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleToggleVoiceChat}
                          variant={isVoiceChatActive ? "primary" : "outline"}
                          icon={isVoiceChatActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                          className={isVoiceChatActive ? "bg-accent-600 hover:bg-accent-700 text-white" : ""}
                        >
                          {isVoiceChatActive ? 'Voice On' : 'Voice Off'}
                        </Button>
                        <Button
                          onClick={handleStopSession}
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          End Session
                        </Button>
                      </div>

                      {/* Text Input */}
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendTextMessage()}
                          placeholder="Type your message to Robbie..."
                          className="flex-1 px-4 py-2 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <Button
                          onClick={handleSendTextMessage}
                          disabled={!textInput.trim()}
                          icon={<ArrowRight className="w-4 h-4" />}
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
                      <p className="text-surface-600">
                        {sessionState === AvatarSessionState.CONNECTING ? 'Connecting...' : 'Processing...'}
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Quick Actions & Chat History */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-surface-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    { id: 'create-rfq', label: 'Create New RFQ', icon: Sparkles },
                    { id: 'analyze-bom', label: 'Analyze BOM', icon: Settings },
                    { id: 'find-suppliers', label: 'Find Suppliers', icon: Brain },
                    { id: 'view-dashboard', label: 'View Dashboard', icon: Monitor }
                  ].map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.id)}
                      className="w-full flex items-center space-x-3 p-3 bg-surface-50 hover:bg-surface-100 rounded-xl transition-colors text-left"
                    >
                      <action.icon className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-surface-900">{action.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Chat History */}
              {messages.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-surface-900 mb-4">Conversation</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-primary-50 text-primary-900 ml-4'
                            : 'bg-surface-50 text-surface-900 mr-4'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            message.type === 'user' ? 'bg-primary-600 text-white' : 'bg-accent-600 text-white'
                          }`}>
                            {message.type === 'user' ? 'U' : 'R'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs text-surface-500 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Help */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-surface-900 mb-4">How Robbie Can Help</h3>
                <div className="space-y-2 text-sm text-surface-600">
                  {ROBBIE_PERSONALITY.helpPrompts.map((prompt, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{prompt}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AvatarLandingPage;
