/**
 * Audio processing worklet for recording
 */

const AudioRecordingWorklet = `
class AudioRecordingWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input.length > 0) {
      const inputChannel = input[0];
      
      // Convert Float32Array to Int16Array (PCM16)
      const int16Data = new Int16Array(inputChannel.length);
      for (let i = 0; i < inputChannel.length; i++) {
        const floatSample = inputChannel[i];
        // Convert to 16-bit PCM
        int16Data[i] = Math.max(-32768, Math.min(32767, floatSample * 32768));
      }
      
      // Send the processed audio data to the main thread
      this.port.postMessage({
        data: {
          int16arrayBuffer: int16Data.buffer
        }
      });
    }
    
    return true;
  }
}

registerProcessor('audio-recording-worklet', AudioRecordingWorklet);
`;

export default AudioRecordingWorklet;
