import { configureStore } from '@reduxjs/toolkit';
import voiceReducer from './voiceSlice';

export const store = configureStore({
    reducer: {
        voice: voiceReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
