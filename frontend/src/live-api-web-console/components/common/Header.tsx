import React from 'react';
import {
    Brain,
    Monitor
} from 'lucide-react';
import Button from './Button';

interface HeaderProps {
    onNavigateToDashboard?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    onNavigateToDashboard,
}) => {
    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Project Robbie
                            </h1>
                            <p className="text-surface-300 text-sm font-medium">
                                AI-Powered Procurement Assistant
                            </p>
                        </div>
                    </div>

                    {onNavigateToDashboard && (
                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={onNavigateToDashboard}
                                variant="outline"
                                icon={<Monitor className="w-4 h-4" />}
                                className="text-sm border-white/20 text-white hover:bg-white/10"
                            >
                                Classic Mode
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
