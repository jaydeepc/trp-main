import React from 'react';

interface FloatingOverlayProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    color: string;
    position: {
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
    };
    onAnimationEnd?: () => void;
}

const FloatingOverlay: React.FC<FloatingOverlayProps> = ({
    icon,
    title,
    subtitle,
    color,
    position,
    onAnimationEnd
}) => {
    return (
        <div
            className="absolute animate-float-in pointer-events-none"
            style={position}
            onAnimationEnd={onAnimationEnd}
        >
            <div className={`${color} backdrop-blur-sm rounded-xl p-4 border shadow-lg max-w-64 animate-gentle-float`}>
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        {icon}
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-base font-semibold text-white truncate">
                            {title}
                        </h4>
                        <p className="text-sm text-white/80 truncate">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FloatingOverlay;
