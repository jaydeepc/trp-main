import { createAudioContext, createWorkletUrl, arrayBufferToBase64 } from './audio-utils';
import AudioRecordingWorklet from './worklets/audio-processing';
import { EventEmitter } from 'events';

export class AudioRecorder extends EventEmitter {
  private stream?: MediaStream;
  private audioContext?: AudioContext;
  private source?: MediaStreamAudioSourceNode;
  private recording: boolean = false;
  private recordingWorklet?: AudioWorkletNode;
  private starting: Promise<void> | null = null;

  constructor(public sampleRate = 16000) {
    super();
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Could not request user media');
    }

    this.starting = new Promise(async (resolve, reject) => {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: this.sampleRate,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        });
        
        this.audioContext = await createAudioContext(this.sampleRate);
        this.source = this.audioContext.createMediaStreamSource(this.stream);

        const workletName = 'audio-recording-worklet';
        const src = createWorkletUrl(AudioRecordingWorklet);

        await this.audioContext.audioWorklet.addModule(src);
        this.recordingWorklet = new AudioWorkletNode(
          this.audioContext,
          workletName,
        );

        this.recordingWorklet.port.onmessage = async (ev: MessageEvent) => {
          // worklet processes recording floats and messages converted buffer
          const arrayBuffer = ev.data.data.int16arrayBuffer;

          if (arrayBuffer) {
            const arrayBufferString = arrayBufferToBase64(arrayBuffer);
            this.emit('data', arrayBufferString);
          }
        };
        
        this.source.connect(this.recordingWorklet);
        this.recording = true;
        resolve();
        this.starting = null;
      } catch (error) {
        reject(error);
      }
    });
  }

  stop() {
    // its plausible that stop would be called before start completes
    // such as if the websocket immediately hangs up
    const handleStop = () => {
      this.source?.disconnect();
      this.stream?.getTracks().forEach((track) => track.stop());
      this.stream = undefined;
      this.recordingWorklet = undefined;
      this.recording = false;
    };
    
    if (this.starting) {
      this.starting.then(handleStop);
      return;
    }
    handleStop();
  }

  isRecording(): boolean {
    return this.recording;
  }
}
