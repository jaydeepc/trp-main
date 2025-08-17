import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    MultimodalLiveAPIClientConnection,
    MultimodalLiveClient,
} from '../../lib/multimodal-live-client';
import { LiveConfig } from '../../types/multimodal-live-types';
import { AudioStreamer } from '../../lib/audio-streamer';
import { audioContext } from '../../lib/utils';
import VolMeterWorket from '../../lib/worklets/vol-meter';

export type UseLiveAPIResults = {
    client: MultimodalLiveClient;
    setConfig: (config: LiveConfig) => void;
    config: LiveConfig;
    connected: boolean;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    volume: number;
};

export function useLiveAPI({
    url,
    apiKey,
}: MultimodalLiveAPIClientConnection): UseLiveAPIResults {
    const client = useMemo(
        () => new MultimodalLiveClient({ url, apiKey }),
        [url, apiKey]
    );
    const audioStreamerRef = useRef<AudioStreamer | null>(null);

    const [connected, setConnected] = useState(false);
    const [config, setConfig] = useState<LiveConfig>({
        model: 'models/gemini-2.5-flash-preview-native-audio-dialog',
    });
    const [volume, setVolume] = useState(0);

    // register audio for streaming server -> speakers
    useEffect(() => {
        if (!audioStreamerRef.current) {
            audioContext({ id: 'audio-out' }).then((audioCtx: AudioContext) => {
                audioStreamerRef.current = new AudioStreamer(audioCtx);
                audioStreamerRef.current
                    .addWorklet<any>(
                        'vumeter-out',
                        VolMeterWorket,
                        (ev: any) => {
                            setVolume(ev.data.volume);
                        }
                    )
                    .then(() => {
                        // Successfully added worklet
                    });
            });
        }
    }, [audioStreamerRef]);

    useEffect(() => {
        console.log('🎧 [useLiveAPI] Setting up client event handlers...');

        const onClose = () => {
            console.log('🔌 [useLiveAPI] Client connection closed');
            setConnected(false);
        };

        const stopAudioStreamer = () => {
            console.log('🔇 [useLiveAPI] Stopping audio streamer on interrupt');
            audioStreamerRef.current?.stop();
        };

        const onAudio = (data: ArrayBuffer) => {
            console.log(
                '🎵 [useLiveAPI] Received audio data, size:',
                data.byteLength
            );
            audioStreamerRef.current?.addPCM16(new Uint8Array(data));
        };

        console.log('📡 [useLiveAPI] Registering client event listeners...');
        client
            .on('close', onClose)
            .on('interrupted', stopAudioStreamer)
            .on('audio', onAudio);

        return () => {
            console.log(
                '🧹 [useLiveAPI] Cleaning up client event listeners...'
            );
            client
                .off('close', onClose)
                .off('interrupted', stopAudioStreamer)
                .off('audio', onAudio);
        };
    }, [client]);

    const connect = useCallback(async () => {
        console.log('� [useLiveAPI] Connect function called');
        console.log('📋 [useLiveAPI] Config:', config);
        console.log('🔌 [useLiveAPI] Current connected state:', connected);

        if (!config) {
            console.error('❌ [useLiveAPI] No config available!');
            throw new Error('config has not been set');
        }

        console.log('🔌 [useLiveAPI] Disconnecting existing connection...');
        client.disconnect();

        try {
            console.log('🚀 [useLiveAPI] Starting new connection...');
            await client.connect(config);
            console.log(
                '✅ [useLiveAPI] Connection established, setting connected=true'
            );
            setConnected(true);
        } catch (error) {
            console.error('❌ [useLiveAPI] Client connection failed:', error);
            console.error('🔍 [useLiveAPI] Error type:', typeof error);
            console.error(
                '🔍 [useLiveAPI] Error message:',
                error instanceof Error ? error.message : 'Unknown error'
            );
            setConnected(false);
            throw error; // Re-throw to let calling code handle it
        }
    }, [client, setConnected, config, connected]);

    const disconnect = useCallback(async () => {
        console.log('🔌 [useLiveAPI] Disconnect function called');
        console.log('🔌 [useLiveAPI] Current connected state:', connected);
        client.disconnect();
        console.log('✅ [useLiveAPI] Disconnected, setting connected=false');
        setConnected(false);
    }, [setConnected, client, connected]);

    return {
        client,
        config,
        setConfig,
        connected,
        connect,
        disconnect,
        volume,
    };
}
