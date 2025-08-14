/**
 * Audio utilities for Gemini Live integration
 */

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  const binary = String.fromCharCode.apply(null, Array.from(uint8Array));
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function createAudioContext(sampleRate: number = 16000): Promise<AudioContext> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate
  });
  
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  
  return audioContext;
}

export function createWorkletUrl(workletSource: string): string {
  const blob = new Blob([workletSource], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}
