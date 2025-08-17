import React from 'react';
import { X } from 'lucide-react';

interface FloatingWindowProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

const FloatingWindow: React.FC<FloatingWindowProps> = ({
    title,
    onClose,
    children,
    className = ""
}) => {
    return (
        <div className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-h-[80vh] overflow-y-auto ${className}`}>
            {/* Window Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                    {title}
                </h3>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {/* Window Content */}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

export default FloatingWindow;
