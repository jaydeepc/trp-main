import React, { useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import AudioVisualization from './AudioVisualization';
import Button from './Button';
import Toast from './Toast';
import { useVoice } from '../../hooks/useVoice';

interface VoiceInterfaceProps {
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = () => {
  const { 
    isConnected, 
    isMuted, 
    isSpeaking, 
    error, 
    lastMessage, 
    toggleMute, 
    audioState 
  } = useVoice();

  return (
    <div className="text-center">
      {/* Audio Visualization */}
      <AudioVisualization
        isListening={audioState.isListening}
        isSpeaking={audioState.isSpeaking}
        audioLevel={audioState.audioLevel}
        size={400}
        className="mb-8 transition-all duration-500"
      />

      {/* Connection Status */}
      <div className="mb-6">
        {isConnected ? (
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

      {/* Mute/Unmute Control */}
      <div className="mb-6">
        <Button
          onClick={toggleMute}
          className={`px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 ${
            isMuted
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
          icon={isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </Button>
      </div>

      {/* AI Speaking Indicator */}
      {isSpeaking && (
        <div className="mb-4">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600/20 border border-blue-500/40 rounded-lg">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-blue-200 text-sm font-medium">Robbie is speaking...</span>
          </div>
        </div>
      )}

      {/* Last Message */}
      {lastMessage && (
        <div className="mt-6 max-w-md mx-auto">
          <div className="px-4 py-3 bg-white/10 rounded-lg border border-white/20">
            <p className="text-white/80 text-sm font-medium">Last Message:</p>
            <p className="text-white text-sm mt-1">{lastMessage}</p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <Toast
          message={error}
          type="error"
          isVisible={!!error}
          onClose={() => {}}
        />
      )}
    </div>
  );
};

export default VoiceInterface;
