import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';
import { AudioRecorder } from '../live-api-web-console/lib/audio-recorder';
import AudioVisualization from '../live-api-web-console/components/common/AudioVisualization';
import Button from '../live-api-web-console/components/common/Button';
import Toast from '../live-api-web-console/components/common/Toast';
import useInitialEffect from '../live-api-web-console/hooks/useInitialEffect';

const InteractionPage: React.FC = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="text-center max-w-4xl mx-auto">
                <VoiceInterface />
            </div>
        </div>
    );
};

const VoiceInterface: React.FC = () => {
    const { client, connected, connect, volume, setConfig, config } = useLiveAPIContext();
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lastMessage, setLastMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [inVolume, setInVolume] = useState(0);
    const [audioRecorder] = useState(() => new AudioRecorder());

    // Set config and connect - using useInitialEffect to prevent multiple calls
    useInitialEffect(() => {
        console.log('🔧 Setting Robbie configuration...');
        setConfig({
            model: "models/gemini-2.5-flash-preview-native-audio-dialog",
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

When users first connect, briefly introduce yourself and ask how you can help with their procurement needs.`,
                    },
                ],
            },
        });
    }, []);

    useEffect(() => {
        if (config && config.systemInstruction && !connected && connect) {
            console.log('🔗 Attempting initial connection...');
            connect()
                .then(() => {
                    console.log('✅ Connection successful!');
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

        const handleAudio = () => {
            setIsSpeaking(true);
        };

        const handleTurnComplete = () => {
            setIsSpeaking(false);
        };

        client.on('content', handleContent);
        client.on('audio', handleAudio);
        client.on('turncomplete', handleTurnComplete);

        return () => {
            client.off('content', handleContent);
            client.off('audio', handleAudio);
            client.off('turncomplete', handleTurnComplete);
        };
    }, [client]);

    const toggleMute = () => {
        setIsMuted(!isMuted);
        // Note: Mute functionality would need to be implemented in LiveAPIContext
        console.log(isMuted ? 'Unmuted' : 'Muted');
    };

    return (
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

            {/* Mute/Unmute Control */}
            <div className="mb-6">
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

            {/* Error Toast */}
            {error && (
                <Toast
                    message={error}
                    type="error"
                    isVisible={!!error}
                    onClose={() => setError('')}
                />
            )}
        </div>
    );
};

export default InteractionPage;
