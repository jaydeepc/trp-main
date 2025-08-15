export interface MediaPermissionResult {
    granted: boolean;
    error?: string;
}

export const checkMicrophonePermission =
    async (): Promise<MediaPermissionResult> => {
        try {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                return {
                    granted: false,
                    error: 'MediaDevices not supported in this browser',
                };
            }

            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            // If successful, stop the stream and return success
            stream.getTracks().forEach((track) => track.stop());

            return {
                granted: true,
            };
        } catch (error: any) {
            console.error('Microphone permission error:', error);

            let errorMessage = 'Failed to access microphone';

            if (error.name === 'NotAllowedError') {
                errorMessage =
                    'Microphone permission denied. Please allow microphone access to continue.';
            } else if (error.name === 'NotFoundError') {
                errorMessage =
                    'No microphone found. Please check your audio devices.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'Microphone not supported in this browser.';
            }

            return {
                granted: false,
                error: errorMessage,
            };
        }
    };
