import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Users,
  TrendingUp
} from 'lucide-react';
import AudioVisualization from '../live-api-web-console/components/common/AudioVisualization';
import Button from '../live-api-web-console/components/common/Button';
import Toast from '../live-api-web-console/components/common/Toast';
import { checkMicrophonePermission } from '../utils/mediaPermissions';

interface LandingPageProps { }

const LandingPage: React.FC<LandingPageProps> = () => {
  const navigate = useNavigate();

  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleToastClose = () => {
    setShowToast(false);
    setToastMessage('');
  };

  const handleStartVoiceExperience = async () => {
    console.log('Start Voice Experience clicked');

    try {
      const result = await checkMicrophonePermission();

      if (result.granted) {
        console.log('Microphone permission granted, navigating to interaction page');
        navigate('/interaction');
      } else {
        console.error('Microphone permission denied:', result.error);
        showErrorToast(result.error || 'Failed to access microphone');
      }
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      showErrorToast('An unexpected error occurred while checking microphone permission');
    }
  };

  const handleQuickAction = (actionId: string) => {
    console.log('Quick action clicked:', actionId);
  };

  return (
    <>
      <Toast
        message={toastMessage}
        type="error"
        isVisible={showToast}
        onClose={handleToastClose}
        duration={7000}
      />

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
            onClick={handleStartVoiceExperience}
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
    </>
  );
};

export default LandingPage;
