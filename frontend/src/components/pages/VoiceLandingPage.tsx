import React, { useState, useEffect } from 'react';
import {
  Brain,
  Mic,
  MicOff,
  MessageSquare,
  Monitor,
  Sparkles,
  ArrowRight,
  Volume2,
  VolumeX,
  Settings,
  FileText,
  Users,
  TrendingUp
} from 'lucide-react';
import { useAudioInterface } from '../../hooks/useAudioInterface';
import AudioVisualization from '../common/AudioVisualization';
import Button from '../common/Button';
import Card from '../common/Card';

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
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai'; text: string; timestamp: Date }>>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  // Initialize audio on first interaction
  const handleStartConversation = async () => {
    try {
      await initializeAudio();
      setConversationStarted(true);
      
      // AI greeting
      speak("Hello! I'm Robbie, your AI procurement assistant. I can help you create smart RFQs, analyze your BOMs, find suppliers, and optimize your procurement process. What would you like to work on today?", 5000);
      
      // Add greeting to messages
      setMessages([{
        type: 'ai',
        text: "Hello! I'm Robbie, your AI procurement assistant. I can help you create smart RFQs, analyze your BOMs, find suppliers, and optimize your procurement process. What would you like to work on today?",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleToggleListening = () => {
    if (audioState.isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleQuickAction = async (action: string) => {
    const actionMessages = {
      'create-rfq': "I'd like to create a new smart RFQ",
      'analyze-bom': "Can you help me analyze my Bill of Materials?",
      'find-suppliers': "I need help finding qualified suppliers",
      'view-dashboard': "Show me my procurement dashboard and analytics"
    };

    const message = actionMessages[action as keyof typeof actionMessages];
    if (message) {
      // Add user message
      setMessages(prev => [...prev, {
        type: 'user',
        text: message,
        timestamp: new Date()
      }]);

      // Simulate AI response based on action
      let aiResponse = '';
      switch (action) {
        case 'create-rfq':
          aiResponse = "Perfect! Let's create a new smart RFQ. I'll guide you through the process. First, do you have any design files, BOMs, or specifications you'd like to upload?";
          setTimeout(() => onNavigateToRFQ(), 2000);
          break;
        case 'analyze-bom':
          aiResponse = "I'd be happy to analyze your Bill of Materials! Please upload your BOM file and I'll provide insights on component optimization, supplier recommendations, and cost analysis.";
          break;
        case 'find-suppliers':
          aiResponse = "I can help you find the best suppliers from our database of 200+ verified partners. What type of components or materials are you looking to source?";
          break;
        case 'view-dashboard':
          aiResponse = "Let me show you your procurement dashboard with real-time analytics and insights.";
          setTimeout(() => onNavigateToDashboard(), 2000);
          break;
      }

      // Add AI response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'ai',
          text: aiResponse,
          timestamp: new Date()
        }]);
        speak(aiResponse, 4000);
      }, 1000);
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      text: currentMessage,
      timestamp: new Date()
    }]);

    // Simulate AI response
    setTimeout(() => {
      const response = "I understand your request. Let me help you with that. I'm processing your input and will provide you with the best solution.";
      setMessages(prev => [...prev, {
        type: 'ai',
        text: response,
        timestamp: new Date()
      }]);
      speak(response, 3000);
    }, 1000);

    setCurrentMessage('');
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
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-400 rounded-full animate-pulse"></div>
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
        /* Voice Mode Interface */
        <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 85px)' }}>
          {!conversationStarted ? (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="text-center max-w-2xl mx-auto">
                <div className="mb-8">
                  <AudioVisualization
                    isListening={false}
                    isSpeaking={false}
                    audioLevel={0}
                    size={200}
                    className="mb-6"
                  />
                </div>

                <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-white to-surface-200 bg-clip-text text-transparent">
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

                {/* Quick Actions */}
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
            /* Conversation Interface */
            <div className="flex-1 flex">
              {/* Left Side - Audio Visualization */}
              <div className="w-1/2 flex items-center justify-center p-8">
                <div className="text-center">
                  <AudioVisualization
                    isListening={audioState.isListening}
                    isSpeaking={audioState.isSpeaking}
                    audioLevel={audioState.audioLevel}
                    size={300}
                    className="mb-6"
                  />
                  
                  {/* Audio Controls */}
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      onClick={handleToggleListening}
                      variant={audioState.isListening ? "primary" : "outline"}
                      className={`${audioState.isListening 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "border-white/20 text-white hover:bg-white/10"
                      }`}
                      icon={audioState.isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    >
                      {audioState.isListening ? 'Listening...' : 'Click to Talk'}
                    </Button>
                  </div>

                  {audioState.error && (
                    <p className="text-red-400 text-sm mt-4">{audioState.error}</p>
                  )}
                </div>
              </div>

              {/* Right Side - Conversation & Quick Actions */}
              <div className="w-1/2 p-8 bg-black/20 backdrop-blur-sm">
                <div className="h-full flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto mb-6 space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-xl ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/10 text-white border border-white/20'
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Text Input */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-surface-400 focus:outline-none focus:border-white/40"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-primary-600 hover:bg-primary-700 text-white"
                      icon={<MessageSquare className="w-4 h-4" />}
                    >
                      Send
                    </Button>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {[
                      { id: 'create-rfq', label: 'Create RFQ', icon: Sparkles },
                      { id: 'analyze-bom', label: 'Analyze BOM', icon: FileText },
                      { id: 'find-suppliers', label: 'Find Suppliers', icon: Users },
                      { id: 'view-dashboard', label: 'Dashboard', icon: TrendingUp }
                    ].map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.id)}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 text-white border border-white/20 hover:border-white/40 text-sm"
                      >
                        <action.icon className="w-4 h-4 mx-auto mb-1" />
                        <span className="font-medium">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceLandingPage;
