import { configureStore } from '@reduxjs/toolkit';
import voiceReducer from './voiceSlice';
import rfqReducer from './rfqSlice';

export const store = configureStore({
    reducer: {
        voice: voiceReducer,
        rfq: rfqReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore the voice.sendText function in serialization checks
                ignoredPaths: ['voice.sendText'],
                ignoredActions: ['voice/initializeVoice'],
                ignoredActionsPaths: ['payload.sendText'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
