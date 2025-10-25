import React, { useState } from 'react';
import { Plus, Brain, Search, Bell, Settings, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
    onCreateRFQ?: () => void;
    isLoaded?: boolean;
}

const Header: React.FC<HeaderProps> = ({
    onCreateRFQ,
    isLoaded = true
}) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-surface-200/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo & Brand */}
                    <div className={`flex items-center space-x-4 transition-all duration-500 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-surface-900">Project Robbie</h1>
                            <p className="text-surface-600 text-sm font-medium">AI-Powered Procurement Intelligence</p>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className={`flex items-center space-x-4 transition-all duration-500 delay-200 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
                                <Search className="w-5 h-5 text-surface-600" />
                            </button>
                            <button className="p-2 hover:bg-surface-100 rounded-xl transition-colors relative">
                                <Bell className="w-5 h-5 text-surface-600" />
                                <div className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></div>
                            </button>
                            <button className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
                                <Settings className="w-5 h-5 text-surface-600" />
                            </button>
                        </div>

                        <Button
                            onClick={onCreateRFQ}
                            className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                            icon={<Plus className="w-4 h-4" />}
                        >
                            Create RFQ
                        </Button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 p-2 hover:bg-surface-100 rounded-xl transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-surface-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-surface-200">
                                        <p className="text-sm font-semibold text-surface-900">
                                            {currentUser?.displayName || 'User'}
                                        </p>
                                        <p className="text-xs text-surface-600 truncate">
                                            {currentUser?.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
