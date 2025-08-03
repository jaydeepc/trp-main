import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import AudioVisualization from './AudioVisualization';
import Button from './Button';

interface VoiceInterfaceProps {
  audioState: {
    isListening: boolean;
    isSpeaking: boolean;
    audioLevel: number;
    error: string | null;
  };
  onToggleListening: () => void;
  executeFunction: (name: string, params?: any) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  audioState,
  onToggleListening,
  executeFunction,
}) => {
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
      {/* <div className="flex items-center justify-center space-x-4">
        <Button
          onClick={onToggleListening}
          variant={audioState.isListening ? "primary" : "outline"}
          className={`${audioState.isListening
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "border-white/20 text-white hover:bg-white/10"
            }`}
          icon={audioState.isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        >
          {audioState.isListening ? 'Listening...' : 'Click to Talk'}
        </Button>
      </div> */}

      {audioState.error && (
        <p className="text-red-400 text-sm mt-4">{audioState.error}</p>
      )}

      {/* Debug Buttons - Faded for testing workflow */}
      <div className="mt-8 opacity-30 hover:opacity-70 transition-opacity duration-300">
        <p className="text-xs text-white/60 mb-3">Debug: Simulate Voice Commands</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => executeFunction('show_upload_form', { reason: 'Debug: User spoke about uploading' })}
            className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white/70 hover:text-white transition-colors"
          >
            "I need to upload..."
          </button>
          <button
            onClick={() => executeFunction('navigate_to', { destination: 'bom-review' })}
            className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white/70 hover:text-white transition-colors"
          >
            "Analyze BOM"
          </button>
          <button
            onClick={() => executeFunction('navigate_to', { destination: 'dashboard' })}
            className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white/70 hover:text-white transition-colors"
          >
            "Show Dashboard"
          </button>
          <button
            onClick={() => executeFunction('get_conversation_context')}
            className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white/70 hover:text-white transition-colors"
          >
            Get Context
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
