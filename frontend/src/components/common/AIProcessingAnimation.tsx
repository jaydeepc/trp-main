import React, { useState, useEffect } from 'react';
import { Brain, Zap, Search, CheckCircle, Layers, Target, Gauge } from 'lucide-react';

interface AIProcessingAnimationProps {
  isVisible: boolean;
  fileName?: string;
  onComplete?: () => void;
  duration?: number; // in milliseconds
  processingInfo?: {
    useRealData?: boolean;
    geminiConfidence?: number;
    processingMode?: string;
    fileCategory?: string;
  };
}

const AIProcessingAnimation: React.FC<AIProcessingAnimationProps> = ({
  isVisible,
  fileName = 'design.png',
  onComplete,
  duration = 8000,
  processingInfo,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const processingSteps = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Analyzing Design Structure",
      description: "Scanning geometric patterns and dimensions...",
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: "Identifying Materials",
      description: "Detecting material properties and specifications...",
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Extracting Tolerances",
      description: "Processing precision requirements and constraints...",
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      icon: <Gauge className="w-6 h-6" />,
      title: "Calculating ZBC Insights",
      description: "Generating zero-based cost analysis...",
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Enhancement Complete",
      description: "Smart BoM ready for review",
      color: "text-accent-teal",
      bgColor: "bg-teal-100",
    },
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setProgress(0);
      setIsComplete(false);
      return;
    }

    const stepDuration = duration / processingSteps.length;
    const progressInterval = 50; // Update progress every 50ms

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / progressInterval));
        return Math.min(newProgress, 100);
      });
    }, progressInterval);

    const stepTimer = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (nextStep >= processingSteps.length) {
          setIsComplete(true);
          setTimeout(() => {
            onComplete?.();
          }, 1000);
          return prev;
        }
        return nextStep;
      });
    }, stepDuration);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [isVisible, duration, onComplete, processingSteps.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-blue to-accent-teal p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Brain className="w-8 h-8" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-orange rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold">Project Robbie AI Processing</h3>
                <p className="text-blue-100 text-sm">Analyzing {fileName}</p>
              </div>
            </div>
            
            {/* Data Source Indicator */}
            {processingInfo && (
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${
                    processingInfo.useRealData ? 'bg-green-400' : 'bg-yellow-400'
                  } animate-pulse`}></div>
                  <span className="text-xs font-medium">
                    {processingInfo.useRealData ? 'Real Gemini Analysis' : 'Enhanced Mock Data'}
                  </span>
                </div>
                {processingInfo.geminiConfidence !== undefined && (
                  <div className="text-xs text-blue-100">
                    Confidence: {processingInfo.geminiConfidence}%
                  </div>
                )}
                {processingInfo.fileCategory && (
                  <div className="text-xs text-blue-200 capitalize">
                    {processingInfo.fileCategory.replace('-', ' ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Animation Area */}
        <div className="p-8">
          {/* Design Visualization */}
          <div className="relative mb-8 h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00BCD4" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Animated Design Elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Central Design Icon */}
                <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-accent-teal">
                  <Layers className="w-12 h-12 text-accent-teal" />
                </div>

                {/* Scanning Lines */}
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-accent-teal to-transparent animate-pulse"></div>
                  <div 
                    className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-secondary-orange to-transparent transition-all duration-1000 ease-in-out"
                    style={{ 
                      transform: `translateY(${(progress / 100) * 96}px)`,
                      opacity: progress > 0 ? 1 : 0 
                    }}
                  ></div>
                </div>

                {/* Data Points */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 bg-accent-teal rounded-full transition-all duration-500 ${
                      currentStep > i / 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    }`}
                    style={{
                      top: `${20 + (i % 4) * 20}%`,
                      left: `${20 + Math.floor(i / 4) * 60}%`,
                      animationDelay: `${i * 200}ms`,
                    }}
                  >
                    <div className="absolute inset-0 bg-accent-teal rounded-full animate-ping"></div>
                  </div>
                ))}

                {/* Flowing Data Streams */}
                {currentStep > 0 && (
                  <div className="absolute inset-0">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-px h-8 bg-gradient-to-b from-accent-teal to-transparent animate-pulse"
                        style={{
                          top: `${30 + i * 15}%`,
                          left: `${40 + i * 10}%`,
                          animationDelay: `${i * 300}ms`,
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Core Visualization */}
            <div className="absolute bottom-4 right-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-blue to-accent-teal rounded-full flex items-center justify-center shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-accent-teal animate-ping"></div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-dark-slate-gray">Processing Progress</span>
              <span className="text-sm text-medium-gray">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-teal to-primary-blue rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Current Step Display */}
          <div className="space-y-4">
            {processingSteps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-500 ${
                  index === currentStep
                    ? `${step.bgColor} border-2 border-current ${step.color} scale-105`
                    : index < currentStep
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : 'bg-gray-50 text-gray-400 border border-gray-200'
                }`}
              >
                <div className={`flex-shrink-0 ${
                  index < currentStep ? 'text-green-600' : step.color
                }`}>
                  {index < currentStep ? <CheckCircle className="w-6 h-6" /> : step.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{step.title}</h4>
                  <p className="text-sm opacity-80">{step.description}</p>
                </div>
                {index === currentStep && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {index < currentStep && (
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Completion Message */}
          {isComplete && (
            <div className={`mt-6 p-4 rounded-xl border transition-all duration-500 ease-in-out ${
              processingInfo?.useRealData 
                ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
                : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
            }`}>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-800">Analysis Complete!</h4>
                  <p className="text-sm text-green-700">
                    {processingInfo?.useRealData 
                      ? `Real Gemini analysis completed with ${processingInfo.geminiConfidence}% confidence. Your Smart BoM contains actual extracted data.`
                      : 'Enhanced with smart mock data. Your Smart BoM is ready for review with AI-enhanced insights.'
                    }
                  </p>
                  {processingInfo?.processingMode && (
                    <p className="text-xs text-green-600 mt-1 capitalize">
                      Mode: {processingInfo.processingMode.replace('-', ' ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIProcessingAnimation;
