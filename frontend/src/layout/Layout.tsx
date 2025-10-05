import React, { useState } from 'react';
import { Sparkles, X, MessageCircle } from 'lucide-react';
import Header from '../components/common/Header';
import VoiceInterfaceSidebar from '../components/common/VoiceInterfaceSidebar';

interface LayoutProps {
    handleNavigateToDashboard: () => void;
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ handleNavigateToDashboard, children }) => {
    const [showRobbie, setShowRobbie] = useState(false);
    const [robbiePulse, setRobbiePulse] = useState(true);
    const [autoStartConversation, setAutoStartConversation] = useState(false);

    const handleRobbieClick = () => {
        setShowRobbie(true);
        setRobbiePulse(false);
        setAutoStartConversation(true);
    };

    const handleRobbieClose = () => {
        setShowRobbie(false);
    };

    return (
        <div className="h-screen relative overflow-hidden">
            <div className="flex">
                {/* Main Content - Conditional width based on Robbie visibility */}
                <main className={`relative transition-all duration-500 ${showRobbie ? 'w-3/4  max-w-[calc(100%-20rem)]' : 'w-full'}`}>
                    <Header onCreateRFQ={handleNavigateToDashboard} />
                    <div className='h-[calc(100vh-85px)] overflow-auto'>
                        {children}
                    </div>
                </main>

                {/* Voice Sidebar - 30% Conditional */}
                <aside className={`fixed right-0 z-50 w-1/4 min-w-80 border-l border-surface-200/20 bg-gradient-to-b from-primary-900/95 to-accent-900/95 backdrop-blur-sm overflow-y-auto h-screen transform transition-transform duration-500 ease-in-out ${showRobbie ? 'translate-x-0' : 'translate-x-full'
                    }`}>
                    {/* Close Button */}
                    <button
                        onClick={handleRobbieClose}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors z-10"
                        aria-label="Close Robbie"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    <div className="p-6 h-full">
                        <VoiceInterfaceSidebar
                            autoStart={autoStartConversation}
                            onAutoStartComplete={() => setAutoStartConversation(false)}
                        />
                    </div>
                </aside>
            </div>

            {/* Robbie FAB - Enhanced Premium Floating Action Button */}
            {!showRobbie && (
                <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end space-y-3">
                    {/* Enhanced Hint Bubble */}
                    <div className={`relative bg-gradient-to-r from-white to-primary-50/50 px-6 py-4 rounded-2xl rounded-br-none shadow-xl border border-primary-100/50 transition-all duration-500 opacity-100 translate-x-0 backdrop-blur-sm`}>
                        <p className="text-lg font-bold text-surface-900 whitespace-nowrap flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <span>Need help?</span>
                        </p>
                        {/* Speech bubble pointer */}
                        <div className="absolute bottom-0 right-5 w-0 h-0 border-l-[12px] border-l-transparent border-t-[12px] border-t-white translate-y-full"></div>
                    </div>

                    {/* Premium FAB Button */}
                    <button
                        onClick={handleRobbieClick}
                        data-robbie-fab
                        className={`relative w-20 h-20 bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 flex items-center justify-center group overflow-hidden`}
                        aria-label="Open Robbie Assistant"
                    >
                        {/* Animated background glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>

                        <Sparkles className="w-9 h-9 text-white group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 relative z-10" />

                        {/* Enhanced pulse indicator */}
                        {robbiePulse && (
                            <>
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-400 rounded-full animate-ping" />
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 rounded-full animate-pulse" />
                            </>
                        )}

                        {/* Subtle rotating ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-spin" style={{ animationDuration: '8s' }}></div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Layout;
