import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, Mic, BarChart3, Users, CheckCircle, DollarSign, Network } from 'lucide-react';
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
    description?: string;
    metrics?: {
        label: string;
        value: string;
    }[];
}

// Define floating overlays that sync with voice - moved outside component to avoid unnecessary re-renders
const floaters: FloaterData[] = [
    {
        id: 'intro',
        icon: <Bot className="w-6 h-6 text-blue-500" />,
        title: "Hi! I'm Robbie",
        subtitle: "AI Procurement Assistant",
        color: "bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border-blue-500/40",
        duration: 3000,
        description: "Your intelligent procurement companion, powered by Google Gemini Live API for natural conversations and smart automation.",
        metrics: [
            { label: "Active Users", value: "2,847" },
            { label: "Satisfaction", value: "4.8/5" }
        ]
    },
    {
        id: 'voice',
        icon: <Mic className="w-5 h-5 text-cyan-500" />,
        title: "Voice-First Interface",
        subtitle: "Natural Language Processing",
        color: "bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border-cyan-500/40",
        duration: 3000,
        description: "Advanced speech recognition with 98.5% accuracy. Speak naturally and let me handle complex procurement workflows.",
        metrics: [
            { label: "Accuracy", value: "98.5%" },
            { label: "Response", value: "<200ms" }
        ]
    },
    {
        id: 'bom',
        icon: <BarChart3 className="w-5 h-5 text-green-500" />,
        title: "Smart BOM Analysis",
        subtitle: "AI-Powered Cost Optimization",
        color: "bg-gradient-to-br from-green-500/30 to-emerald-500/20 border-green-500/40",
        duration: 3000,
        description: "Analyze complex BOMs with AI to identify 12.8% average cost savings and optimize component selection.",
        metrics: [
            { label: "Processing", value: "2.3s" },
            { label: "Accuracy", value: "94.2%" },
            { label: "Savings", value: "12.8%" }
        ]
    },
    {
        id: 'suppliers',
        icon: <Users className="w-5 h-5 text-purple-500" />,
        title: "Supplier Intelligence",
        subtitle: "Global Network Analytics",
        color: "bg-gradient-to-br from-purple-500/30 to-violet-500/20 border-purple-500/40",
        duration: 3000,
        description: "Access 200+ pre-qualified suppliers with real-time trust scores, performance metrics, and risk assessments.",
        metrics: [
            { label: "Network", value: "247" },
            { label: "Trust Score", value: "96.7%" },
            { label: "Regions", value: "45+" }
        ]
    },
    {
        id: 'compliance',
        icon: <CheckCircle className="w-5 h-5 text-red-500" />,
        title: "Compliance Automation",
        subtitle: "Regulatory Standards Engine",
        color: "bg-gradient-to-br from-red-500/30 to-pink-500/20 border-red-500/40",
        duration: 3000,
        description: "Automated verification against 50+ industry standards with 99.1% success rate for seamless compliance.",
        metrics: [
            { label: "Success Rate", value: "99.1%" },
            { label: "Standards", value: "52" },
            { label: "Time Saved", value: "85%" }
        ]
    },
    {
        id: 'cost',
        icon: <DollarSign className="w-5 h-5 text-yellow-500" />,
        title: "Cost Optimization",
        subtitle: "Should-Cost Intelligence",
        color: "bg-gradient-to-br from-yellow-500/30 to-orange-500/20 border-yellow-500/40",
        duration: 3000,
        description: "AI-driven should-cost modeling with real-time market benchmarking to maximize procurement value.",
        metrics: [
            { label: "Reduction", value: "12.8%" },
            { label: "Total Savings", value: "€2.4M" },
            { label: "Success Rate", value: "78%" }
        ]
    },
    {
        id: 'integration',
        icon: <Network className="w-5 h-5 text-indigo-500" />,
        title: "Global Integration",
        subtitle: "Enterprise Connectivity",
        color: "bg-gradient-to-br from-indigo-500/30 to-blue-500/20 border-indigo-500/40",
        duration: 3000,
        description: "Enterprise-grade integration with 50+ systems including SAP, Oracle, and major PLM platforms.",
        metrics: [
            { label: "Uptime", value: "99.9%" },
            { label: "Integrations", value: "127" },
            { label: "Response", value: "<100ms" }
        ]
    }
];

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
    }, [currentIndex, handleClose]);

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
                        description={floater.description}
                        metrics={floater.metrics}
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
