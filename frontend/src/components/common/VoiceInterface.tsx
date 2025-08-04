import React from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import AudioVisualization from './AudioVisualization';
import Button from './Button';

interface VoiceInterfaceProps {
  audioState: {
    isListening: boolean;
    isSpeaking: boolean;
    audioLevel: number;
    error: string | null;
    isInitialized?: boolean;
    isProcessing?: boolean;
  };
  onToggleListening: () => void;
  executeFunction: (name: string, params?: any) => void;
  onStopSpeaking?: () => void;
  sendMessage?: (message: string) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  audioState,
  onToggleListening,
  executeFunction,
  onStopSpeaking,
  sendMessage,
}) => {
  const handleVoiceCommand = (command: string) => {
    if (sendMessage) {
      sendMessage(command);
    } else {
      // Fallback to old function execution
      executeFunction('show_upload_form', { reason: 'Voice command simulation' });
    }
  };

  return (
    <div className="text-center">
      <AudioVisualization
        isListening={audioState.isListening}
        isSpeaking={audioState.isSpeaking}
        audioLevel={audioState.audioLevel}
        size={300}
        className="mb-6 transition-all duration-500"
      />

      {/* Voice Control */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <Button
          onClick={onToggleListening}
          variant={audioState.isListening ? "primary" : "outline"}
          className={`${audioState.isListening
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "border-white/20 text-white hover:bg-white/10"
            }`}
          icon={audioState.isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          disabled={audioState.isProcessing}
        >
          {audioState.isProcessing 
            ? 'Processing...' 
            : audioState.isListening 
              ? 'Listening...' 
              : 'Click to Talk'
          }
        </Button>

        {audioState.isSpeaking && onStopSpeaking && (
          <Button
            onClick={onStopSpeaking}
            variant="outline"
            className="border-red-400/20 text-red-400 hover:bg-red-400/10"
            icon={<VolumeX className="w-4 h-4" />}
          >
            Stop Speaking
          </Button>
        )}
      </div>

      {/* Status Messages */}
      {audioState.isProcessing && (
        <p className="text-blue-400 text-sm mb-4">Processing your request...</p>
      )}

      {audioState.error && (
        <p className="text-red-400 text-sm mb-4">{audioState.error}</p>
      )}

      {!audioState.isInitialized && (
        <p className="text-yellow-400 text-sm mb-4">
          Voice assistant is initializing...
        </p>
      )}

      {/* Voice Command Hints */}
      <div className="mt-6 mb-8">
        <p className="text-xs text-white/60 mb-3">Try saying:</p>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <span className="px-2 py-1 bg-white/10 rounded-lg text-white/70">
            "Upload file"
          </span>
          <span className="px-2 py-1 bg-white/10 rounded-lg text-white/70">
            "Analyze BOM"
          </span>
          <span className="px-2 py-1 bg-white/10 rounded-lg text-white/70">
            "Commercial terms"
          </span>
          <span className="px-2 py-1 bg-white/10 rounded-lg text-white/70">
            "Show dashboard"
          </span>
        </div>
      </div>

      {/* Debug Buttons - Now integrated with real voice commands */}
      <div className="mt-8 opacity-30 hover:opacity-70 transition-opacity duration-300">
        <p className="text-xs text-white/60 mb-3">Debug: Simulate Voice Commands</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => handleVoiceCommand('upload file')}
            className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white/70 hover:text-white transition-colors"
          >
            "Upload File"
          </button>
          <button
            onClick={() => handleVoiceCommand('analyze BOM')}
            className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white/70 hover:text-white transition-colors"
          >
            "Analyze BOM"
          </button>
          <button
            onClick={() => handleVoiceCommand('commercial terms')}
            className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white/70 hover:text-white transition-colors"
          >
            "Commercial Terms"
          </button>
          <button
            onClick={() => handleVoiceCommand('show dashboard')}
            className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white/70 hover:text-white transition-colors"
          >
            "Dashboard"
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
