import React from 'react';
import VoiceInterface from '../common/VoiceInterface';

const InteractionPage: React.FC = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="text-center max-w-4xl mx-auto">
                <VoiceInterface />
            </div>
        </div>
    );
};

export default InteractionPage;
