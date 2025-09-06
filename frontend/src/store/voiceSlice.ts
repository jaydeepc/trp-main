import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VoiceState {
    isVoiceInitialized: boolean;
    sendText?: (message: string) => void;
}

const initialState: VoiceState = {
    isVoiceInitialized: false,
    sendText: undefined,
};

const voiceSlice = createSlice({
    name: 'voice',
    initialState,
    reducers: {
        initializeVoice: (
            state,
            action: PayloadAction<{
                sendText: (message: string) => void;
            }>
        ) => {
            state.isVoiceInitialized = true;
            state.sendText = action.payload.sendText;
            console.log('🎙️ Redux: Voice initialized');
        },
        disconnectVoice: (state) => {
            state.isVoiceInitialized = false;
            state.sendText = undefined;
            console.log('🎙️ Redux: Voice disconnected');
        },
    },
});

export const { initializeVoice, disconnectVoice } = voiceSlice.actions;

export default voiceSlice.reducer;
