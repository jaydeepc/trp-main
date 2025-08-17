import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number; // Auto-close after this many milliseconds
}

const Toast: React.FC<ToastProps> = ({
    message,
    type,
    isVisible,
    onClose,
    duration = 5000
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const getToastStyles = () => {
        switch (type) {
            case 'error':
                return 'bg-red-500 border-red-500/40 text-white';
            case 'success':
                return 'bg-green-500 border-green-500/40 text-white';
            case 'info':
                return 'bg-blue-500 border-blue-500/40 text-white';
            default:
                return 'bg-gray-500 border-gray-500/40 text-white';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'error':
                return <AlertCircle className="w-5 h-5 flex-shrink-0" />;
            case 'success':
                return <CheckCircle className="w-5 h-5 flex-shrink-0" />;
            case 'info':
                return <Info className="w-5 h-5 flex-shrink-0" />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
            <div className={`
                flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm
                transform transition-all duration-300 ease-in-out
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                ${getToastStyles()}
            `}>
                {getIcon()}
                <p className="text-sm font-medium flex-1 leading-relaxed text-white">
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Close toast"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
