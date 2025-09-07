import React from 'react';
import Header from '../components/common/Header';
import VoiceInterfaceSidebar from '../components/common/VoiceInterfaceSidebar';

interface LayoutProps {
    handleNavigateToDashboard: () => void;
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ handleNavigateToDashboard, children }) => {
    return (
        <div className="h-screen relative overflow-hidden">
            <div className="flex">
                {/* Main Content - 70% */}
                <main className="w-3/4 relative max-w-[calc(100%-20rem)]">
                    <Header onCreateRFQ={handleNavigateToDashboard} />
                    <div className='h-[calc(100vh-85px)] overflow-auto'>
                        {children}
                    </div>
                </main>

                {/* Voice Sidebar - 30% */}
                <aside className="fixed right-0 z-50 w-1/4 min-w-80 border-l border-surface-200/20 bg-gradient-to-b from-primary-900/95 to-accent-900/95 backdrop-blur-sm overflow-y-auto h-screen">
                    <div className="p-6 h-full">
                        <VoiceInterfaceSidebar />
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Layout;
