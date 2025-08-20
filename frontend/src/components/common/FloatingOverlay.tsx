import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

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
    description?: string;
    metrics?: {
        label: string;
        value: string;
    }[];
    onAnimationEnd?: () => void;
}

const FloatingOverlay: React.FC<FloatingOverlayProps> = ({
    icon,
    title,
    subtitle,
    color,
    position,
    description,
    metrics,
    onAnimationEnd
}) => {
    return (
        <div
            className="absolute animate-float-in pointer-events-none"
            style={position}
            onAnimationEnd={onAnimationEnd}
        >
            <div className={`${color} backdrop-blur-md rounded-2xl p-6 border shadow-2xl max-w-80 animate-gentle-float`}>
                {/* Header */}
                <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                            {icon}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-lg font-bold text-white">
                                {title}
                            </h4>
                            <Sparkles className="w-4 h-4 text-white/60 animate-pulse" />
                        </div>
                        <p className="text-sm text-white/80 font-medium">
                            {subtitle}
                        </p>
                    </div>
                </div>

                {/* Description */}
                {description && (
                    <div className="mb-4">
                        <p className="text-sm text-white/90 leading-relaxed">
                            {description}
                        </p>
                    </div>
                )}

                {/* Metrics */}
                {metrics && metrics.length > 0 && (
                    <div className="space-y-2">
                        {metrics.map((metric, index) => (
                            <div key={index} className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                                <span className="text-sm text-white/80 font-medium">
                                    {metric.label}
                                </span>
                                <div className="flex items-center space-x-1">
                                    <span className="text-sm font-bold text-white">
                                        {metric.value}
                                    </span>
                                    <TrendingUp className="w-3 h-3 text-white/60" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Animated accent */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
            </div>
        </div>
    );
};

export default FloatingOverlay;
