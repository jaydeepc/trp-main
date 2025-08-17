import React from 'react';
import Header from '../common/Header';

interface LayoutProps {
    handleNavigateToDashboard: () => void;
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ handleNavigateToDashboard, children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-900 via-surface-800 to-primary-900 relative overflow-hidden">
            <Header onNavigateToDashboard={handleNavigateToDashboard} />
            <main className="relative" style={{ height: 'calc(100vh - 85px)' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
