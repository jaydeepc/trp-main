import { Content, GenerativeContentBlob, Part } from '@google/generative-ai';
import { EventEmitter } from 'eventemitter3';
import { difference } from 'lodash';
import {
    ClientContentMessage,
    isInterrupted,
    isModelTurn,
    isServerContentMessage,
    isSetupCompleteMessage,
    isToolCallCancellationMessage,
    isToolCallMessage,
    isTurnComplete,
    LiveIncomingMessage,
    ModelTurn,
    RealtimeInputMessage,
    ServerContent,
    SetupMessage,
    StreamingLog,
    ToolCall,
    ToolCallCancellation,
    ToolResponseMessage,
    type LiveConfig,
} from '../types/multimodal-live-types';
import { blobToJSON, base64ToArrayBuffer } from './utils';

/**
 * the events that this client will emit
 */
interface MultimodalLiveClientEventTypes {
    open: () => void;
    log: (log: StreamingLog) => void;
    close: (event: CloseEvent) => void;
    audio: (data: ArrayBuffer) => void;
    content: (data: ServerContent) => void;
    interrupted: () => void;
    setupcomplete: () => void;
    turncomplete: () => void;
    toolcall: (toolCall: ToolCall) => void;
    toolcallcancellation: (toolcallCancellation: ToolCallCancellation) => void;
}

export type MultimodalLiveAPIClientConnection = {
    url?: string;
    apiKey: string;
};

/**
 * A event-emitting class that manages the connection to the websocket and emits
 * events to the rest of the application.
 * If you dont want to use react you can still use this.
 */
export class MultimodalLiveClient extends EventEmitter<MultimodalLiveClientEventTypes> {
    public ws: WebSocket | null = null;
    protected config: LiveConfig | null = null;
    public url: string = '';
    public getConfig() {
        return { ...this.config };
    }

    constructor({ url, apiKey }: MultimodalLiveAPIClientConnection) {
        super();
        url =
            url ||
            `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;
        url += `?key=${apiKey}`;
        this.url = url;
        this.send = this.send.bind(this);
    }

    log(type: string, message: StreamingLog['message']) {
        const log: StreamingLog = {
            date: new Date(),
            type,
            message,
        };
        this.emit('log', log);
    }

    connect(config: LiveConfig): Promise<boolean> {
        console.log('🌐 [MultimodalLiveClient] Starting connection process...');
        console.log('📋 [MultimodalLiveClient] Config:', config);
        console.log('🔗 [MultimodalLiveClient] URL:', this.url);

        this.config = config;

        console.log('🚀 [MultimodalLiveClient] Creating WebSocket...');
        const ws = new WebSocket(this.url);

        console.log(
            '📡 [MultimodalLiveClient] WebSocket created, readyState:',
            ws.readyState
        );

        ws.addEventListener('message', async (evt: MessageEvent) => {
            if (evt.data instanceof Blob) {
                this.receive(evt.data);
            } else {
                console.log('📨 [MultimodalLiveClient] Non-blob message:', evt);
            }
        });

        return new Promise((resolve, reject) => {
            console.log(
                '⏳ [MultimodalLiveClient] Setting up promise handlers...'
            );

            const onError = (ev: Event) => {
                console.error(
                    '❌ [MultimodalLiveClient] WebSocket error event:',
                    ev
                );
                console.error(
                    '🔍 [MultimodalLiveClient] WebSocket readyState on error:',
                    ws.readyState
                );
                this.disconnect(ws);
                const message = `Could not connect to "${this.url}"`;
                this.log(`server.${ev.type}`, message);
                reject(new Error(message));
            };

            ws.addEventListener('error', onError);

            ws.addEventListener('open', (ev: Event) => {
                console.log(
                    '✅ [MultimodalLiveClient] WebSocket opened successfully!'
                );
                console.log(
                    '🔍 [MultimodalLiveClient] WebSocket readyState on open:',
                    ws.readyState
                );

                if (!this.config) {
                    console.error(
                        '❌ [MultimodalLiveClient] No config available in open handler!'
                    );
                    reject('Invalid config sent to `connect(config)`');
                    return;
                }

                this.log(`client.${ev.type}`, `connected to socket`);
                this.emit('open');

                this.ws = ws;

                console.log(
                    '📤 [MultimodalLiveClient] Sending setup message...'
                );
                const setupMessage: SetupMessage = {
                    setup: this.config,
                };
                this._sendDirect(setupMessage);
                this.log('client.send', 'setup');
                console.log(
                    '✅ [MultimodalLiveClient] Setup message sent successfully!'
                );

                ws.removeEventListener('error', onError);
                ws.addEventListener('close', (ev: CloseEvent) => {
                    console.log(
                        '🔌 [MultimodalLiveClient] WebSocket close event, code:',
                        ev.code,
                        'reason:',
                        ev.reason
                    );
                    this.disconnect(ws);
                    let reason = ev.reason || '';
                    if (reason.toLowerCase().includes('error')) {
                        const prelude = 'ERROR]';
                        const preludeIndex = reason.indexOf(prelude);
                        if (preludeIndex > 0) {
                            reason = reason.slice(
                                preludeIndex + prelude.length + 1,
                                Infinity
                            );
                        }
                    }
                    this.log(
                        `server.${ev.type}`,
                        `disconnected ${reason ? `with reason: ${reason}` : ``}`
                    );
                    this.emit('close', ev);
                });

                console.log(
                    '🎉 [MultimodalLiveClient] Connection process complete, resolving...'
                );
                resolve(true);
            });
        });
    }

    disconnect(ws?: WebSocket) {
        // could be that this is an old websocket and theres already a new instance
        // only close it if its still the correct reference
        if ((!ws || this.ws === ws) && this.ws) {
            this.ws.close();
            this.ws = null;
            this.log('client.close', `Disconnected`);
            return true;
        }
        return false;
    }

    protected async receive(blob: Blob) {
        const response: LiveIncomingMessage = (await blobToJSON(
            blob
        )) as LiveIncomingMessage;
        if (isToolCallMessage(response)) {
            console.log('🔧 TOOL CALL RECEIVED by MultimodalLiveClient');
            console.log('📞 Tool call response:', response);
            console.log('📋 Function calls count:', response.toolCall?.functionCalls?.length || 0);
            
            // Log each function call details
            if (response.toolCall?.functionCalls) {
                response.toolCall.functionCalls.forEach((fc, index) => {
                    console.log(`🎯 Function Call ${index + 1}:`);
                    console.log(`  📝 Name: ${fc.name}`);
                    console.log(`  🆔 ID: ${fc.id}`);
                    console.log(`  📋 Args:`, fc.args);
                });
            }
            
            this.log('server.toolCall', response);
            console.log('📡 Emitting toolcall event to listeners...');
            this.emit('toolcall', response.toolCall);
            console.log('✅ Tool call event emitted successfully');
            return;
        }
        if (isToolCallCancellationMessage(response)) {
            this.log('receive.toolCallCancellation', response);
            this.emit('toolcallcancellation', response.toolCallCancellation);
            return;
        }

        if (isSetupCompleteMessage(response)) {
            this.log('server.send', 'setupComplete');
            this.emit('setupcomplete');
            return;
        }

        // this json also might be `contentUpdate { interrupted: true }`
        // or contentUpdate { end_of_turn: true }
        if (isServerContentMessage(response)) {
            const { serverContent } = response;
            if (isInterrupted(serverContent)) {
                this.log('receive.serverContent', 'interrupted');
                this.emit('interrupted');
                return;
            }
            if (isTurnComplete(serverContent)) {
                this.log('server.send', 'turnComplete');
                this.emit('turncomplete');
                //plausible theres more to the message, continue
            }

            if (isModelTurn(serverContent)) {
                let parts: Part[] = serverContent.modelTurn.parts;

                // when its audio that is returned for modelTurn
                const audioParts = parts.filter(
                    (p) =>
                        p.inlineData &&
                        p.inlineData.mimeType.startsWith('audio/pcm')
                );
                const base64s = audioParts.map((p) => p.inlineData?.data);

                // strip the audio parts out of the modelTurn
                const otherParts = difference(parts, audioParts);
                // console.log("otherParts", otherParts);

                base64s.forEach((b64) => {
                    if (b64) {
                        const data = base64ToArrayBuffer(b64);
                        this.emit('audio', data);
                        // Removed excessive audio logging
                    }
                });
                if (!otherParts.length) {
                    return;
                }

                parts = otherParts;

                const content: ModelTurn = { modelTurn: { parts } };
                this.emit('content', content);
                this.log(`server.content`, response);
            }
        } else {
            console.log('received unmatched message', response);
        }
    }

    /**
     * send realtimeInput, this is base64 chunks of "audio/pcm" and/or "image/jpg"
     */
    sendRealtimeInput(chunks: GenerativeContentBlob[]) {
        let hasAudio = false;
        let hasVideo = false;
        for (let i = 0; i < chunks.length; i++) {
            const ch = chunks[i];
            if (ch.mimeType.includes('audio')) {
                hasAudio = true;
            }
            if (ch.mimeType.includes('image')) {
                hasVideo = true;
            }
            if (hasAudio && hasVideo) {
                break;
            }
        }
        const message =
            hasAudio && hasVideo
                ? 'audio + video'
                : hasAudio
                ? 'audio'
                : hasVideo
                ? 'video'
                : 'unknown';

        const data: RealtimeInputMessage = {
            realtimeInput: {
                mediaChunks: chunks,
            },
        };
        this._sendDirect(data);
        this.log(`client.realtimeInput`, message);
    }

    /**
     *  send a response to a function call and provide the id of the functions you are responding to
     */
    sendToolResponse(toolResponse: ToolResponseMessage['toolResponse']) {
        const message: ToolResponseMessage = {
            toolResponse,
        };

        this._sendDirect(message);
        this.log(`client.toolResponse`, message);
    }

    /**
     * send normal content parts such as { text }
     */
    send(parts: Part | Part[], turnComplete: boolean = true) {
        parts = Array.isArray(parts) ? parts : [parts];
        const content: Content = {
            role: 'user',
            parts,
        };

        const clientContentRequest: ClientContentMessage = {
            clientContent: {
                turns: [content],
                turnComplete,
            },
        };

        this._sendDirect(clientContentRequest);
        this.log(`client.send`, clientContentRequest);
    }

    /**
     *  used internally to send all messages
     *  don't use directly unless trying to send an unsupported message type
     */
    _sendDirect(request: object) {
        if (!this.ws) {
            throw new Error('WebSocket is not connected');
        }
        const str = JSON.stringify(request);
        this.ws.send(str);
    }
}
