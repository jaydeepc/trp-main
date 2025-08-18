import React, { useState, useEffect } from 'react';
import { Bot, Mic, BarChart3, Users, CheckCircle, DollarSign, Network, X } from 'lucide-react';

interface SystemInfoProps {
    onClose: () => void;
}

const SystemInfo: React.FC<SystemInfoProps> = ({ onClose }) => {
    const [activeFloaters, setActiveFloaters] = useState<number[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Define floating overlays that sync with voice
    const floaters = [
        {
            id: 'intro',
            icon: <Bot className="w-6 h-6 text-blue-500" />,
            title: "Hi! I'm Robbie",
            subtitle: "AI Procurement Assistant",
            color: "bg-blue-500/20 border-blue-500/40",
            duration: 4000
        },
        {
            id: 'voice',
            icon: <Mic className="w-5 h-5 text-cyan-500" />,
            title: "Voice-First Interface",
            subtitle: "Natural Language",
            color: "bg-cyan-500/20 border-cyan-500/40",
            duration: 4000
        },
        {
            id: 'bom',
            icon: <BarChart3 className="w-5 h-5 text-green-500" />,
            title: "Smart BOM Analysis",
            subtitle: "2.3s • 94.2% accuracy",
            color: "bg-green-500/20 border-green-500/40",
            duration: 4000
        },
        {
            id: 'suppliers',
            icon: <Users className="w-5 h-5 text-purple-500" />,
            title: "Supplier Intelligence",
            subtitle: "200+ Pre-Qualified",
            color: "bg-purple-500/20 border-purple-500/40",
            duration: 4000
        },
        {
            id: 'compliance',
            icon: <CheckCircle className="w-5 h-5 text-red-500" />,
            title: "Compliance Automation",
            subtitle: "99.1% Success Rate",
            color: "bg-red-500/20 border-red-500/40",
            duration: 4000
        },
        {
            id: 'cost',
            icon: <DollarSign className="w-5 h-5 text-yellow-500" />,
            title: "Cost Optimization",
            subtitle: "12.8% Reduction",
            color: "bg-yellow-500/20 border-yellow-500/40",
            duration: 4000
        },
        {
            id: 'integration',
            icon: <Network className="w-5 h-5 text-indigo-500" />,
            title: "Global Integration",
            subtitle: "99.9% Uptime",
            color: "bg-indigo-500/20 border-indigo-500/40",
            duration: 4000
        },
        {
            id: 'matrix',
            icon: <BarChart3 className="w-5 h-5 text-pink-500" />,
            title: "Supplier Matrix",
            subtitle: "8 suppliers visualization",
            color: "bg-pink-500/20 border-pink-500/40",
            duration: 6000
        },
        {
            id: 'metrics',
            icon: <BarChart3 className="w-5 h-5 text-orange-500" />,
            title: "Performance Metrics",
            subtitle: "4.8/5 rating",
            color: "bg-orange-500/20 border-orange-500/40",
            duration: 4000
        }
    ];

    // Generate random positions for floating effect
    const getRandomPosition = (index: number) => {
        const positions = [
            { top: '15%', left: '10%' },
            { top: '20%', right: '15%' },
            { top: '40%', left: '5%' },
            { top: '35%', right: '10%' },
            { bottom: '30%', left: '12%' },
            { bottom: '25%', right: '18%' },
            { top: '60%', left: '20%' },
            { top: '50%', right: '25%' },
            { bottom: '15%', left: '30%' }
        ];
        return positions[index % positions.length];
    };

    // Auto-advance through floaters
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const showNextFloater = () => {
            if (currentIndex < floaters.length) {
                // Add current floater to active list
                setActiveFloaters(prev => [...prev, currentIndex]);
                
                // Remove floater after its duration
                timeoutId = setTimeout(() => {
                    setActiveFloaters(prev => prev.filter(id => id !== currentIndex));
                    
                    // Move to next floater
                    setTimeout(() => {
                        setCurrentIndex(prev => prev + 1);
                    }, 300); // Small delay between floaters
                }, floaters[currentIndex]?.duration || 4000);
            } else {
                // All floaters shown, close after a delay
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
        };

        showNextFloater();

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [currentIndex, onClose]);

    return (
        <div className="fixed inset-0 pointer-events-none z-40">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors duration-200 pointer-events-auto"
            >
                <X className="w-4 h-4 text-white" />
            </button>

            {/* Floating overlays */}
            {activeFloaters.map((floaterIndex) => {
                const floater = floaters[floaterIndex];
                const position = getRandomPosition(floaterIndex);
                
                return (
                    <div
                        key={floater.id}
                        className="absolute animate-float-in pointer-events-none"
                        style={position}
                    >
                        <div className={`${floater.color} backdrop-blur-sm rounded-lg p-3 border shadow-lg max-w-48 animate-gentle-float`}>
                            {/* Icon and content */}
                            <div className="flex items-center space-x-2">
                                <div className="flex-shrink-0">
                                    {floater.icon}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                        {floater.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 truncate">
                                        {floater.subtitle}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Custom CSS for floating animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float-in {
                    0% {
                        opacity: 0;
                        transform: translateY(20px) scale(0.8);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes gentle-float {
                    0%, 100% { 
                        transform: translateY(0px) translateX(0px) rotate(0deg); 
                    }
                    25% { 
                        transform: translateY(-8px) translateX(4px) rotate(1deg); 
                    }
                    50% { 
                        transform: translateY(-4px) translateX(-2px) rotate(-0.5deg); 
                    }
                    75% { 
                        transform: translateY(-12px) translateX(6px) rotate(0.5deg); 
                    }
                }

                @keyframes fade-out {
                    0% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0.8) translateY(-10px);
                    }
                }

                .animate-float-in {
                    animation: float-in 0.6s ease-out forwards;
                }

                .animate-gentle-float {
                    animation: gentle-float 4s ease-in-out infinite;
                }

                .animate-fade-out {
                    animation: fade-out 0.5s ease-in forwards;
                }
                `
            }} />
        </div>
    );
};

export default SystemInfo;
