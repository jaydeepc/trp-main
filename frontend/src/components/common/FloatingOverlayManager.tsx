import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, Mic, BarChart3, Users, CheckCircle, DollarSign, Network, X } from 'lucide-react';
import FloatingOverlay from './FloatingOverlay';

interface FloatingOverlayManagerProps {
    onClose: () => void;
}

interface FloaterData {
    id: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    color: string;
    duration: number;
}

const FloatingOverlayManager: React.FC<FloatingOverlayManagerProps> = ({ onClose }) => {
    const [activeFloaters, setActiveFloaters] = useState<number[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const onCloseRef = useRef(onClose);

    // Update ref when onClose changes
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // Stable close function that doesn't cause re-renders
    const handleClose = useCallback(() => {
        onCloseRef.current();
    }, []);

    // Define floating overlays that sync with voice
    const floaters: FloaterData[] = [
        {
            id: 'intro',
            icon: <Bot className="w-6 h-6 text-blue-500" />,
            title: "Hi! I'm Robbie",
            subtitle: "AI Procurement Assistant",
            color: "bg-blue-500/20 border-blue-500/40",
            duration: 2500
        },
        {
            id: 'voice',
            icon: <Mic className="w-5 h-5 text-cyan-500" />,
            title: "Voice-First Interface",
            subtitle: "Natural Language",
            color: "bg-cyan-500/20 border-cyan-500/40",
            duration: 2500
        },
        {
            id: 'bom',
            icon: <BarChart3 className="w-5 h-5 text-green-500" />,
            title: "Smart BOM Analysis",
            subtitle: "2.3s • 94.2% accuracy",
            color: "bg-green-500/20 border-green-500/40",
            duration: 2500
        },
        {
            id: 'suppliers',
            icon: <Users className="w-5 h-5 text-purple-500" />,
            title: "Supplier Intelligence",
            subtitle: "200+ Pre-Qualified",
            color: "bg-purple-500/20 border-purple-500/40",
            duration: 2500
        },
        {
            id: 'compliance',
            icon: <CheckCircle className="w-5 h-5 text-red-500" />,
            title: "Compliance Automation",
            subtitle: "99.1% Success Rate",
            color: "bg-red-500/20 border-red-500/40",
            duration: 2500
        },
        {
            id: 'cost',
            icon: <DollarSign className="w-5 h-5 text-yellow-500" />,
            title: "Cost Optimization",
            subtitle: "12.8% Reduction",
            color: "bg-yellow-500/20 border-yellow-500/40",
            duration: 2500
        },
        {
            id: 'integration',
            icon: <Network className="w-5 h-5 text-indigo-500" />,
            title: "Global Integration",
            subtitle: "99.9% Uptime",
            color: "bg-indigo-500/20 border-indigo-500/40",
            duration: 2500
        },
        {
            id: 'matrix',
            icon: <BarChart3 className="w-5 h-5 text-pink-500" />,
            title: "Supplier Matrix",
            subtitle: "8 suppliers visualization",
            color: "bg-pink-500/20 border-pink-500/40",
            duration: 3000
        },
        {
            id: 'metrics',
            icon: <BarChart3 className="w-5 h-5 text-orange-500" />,
            title: "Performance Metrics",
            subtitle: "4.8/5 rating",
            color: "bg-orange-500/20 border-orange-500/40",
            duration: 2500
        }
    ];

    // Generate random positions for floating effect
    const getRandomPosition = useCallback((index: number) => {
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
    }, []);

    // Auto-advance through floaters
    useEffect(() => {
        if (currentIndex >= floaters.length) {
            // All floaters shown, close after a delay
            const closeTimer = setTimeout(() => {
                handleClose();
            }, 1500);
            return () => clearTimeout(closeTimer);
        }

        // Add current floater to active list
        setActiveFloaters(prev => [...prev, currentIndex]);
        
        // Remove floater after its duration
        const removeTimer = setTimeout(() => {
            setActiveFloaters(prev => prev.filter(id => id !== currentIndex));
            
            // Move to next floater after small delay
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 200);
        }, floaters[currentIndex].duration);

        return () => clearTimeout(removeTimer);
    }, [currentIndex, floaters.length, handleClose]);

    return (
        <div className="fixed inset-0 pointer-events-none z-40">
            {/* Floating overlays */}
            {activeFloaters.map((floaterIndex) => {
                const floater = floaters[floaterIndex];
                const position = getRandomPosition(floaterIndex);
                
                return (
                    <FloatingOverlay
                        key={`${floater.id}-${floaterIndex}`}
                        icon={floater.icon}
                        title={floater.title}
                        subtitle={floater.subtitle}
                        color={floater.color}
                        position={position}
                    />
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

                .animate-float-in {
                    animation: float-in 0.6s ease-out forwards;
                }

                .animate-gentle-float {
                    animation: gentle-float 4s ease-in-out infinite;
                }
                `
            }} />
        </div>
    );
};

export default FloatingOverlayManager;
