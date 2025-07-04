import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import Card from './Card';

interface AnimatedMetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  unit?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
  animationDelay?: number;
  className?: string;
}

const AnimatedMetricCard: React.FC<AnimatedMetricCardProps> = ({
  title,
  value,
  previousValue,
  unit = '',
  icon: Icon,
  iconColor = 'text-primary-blue',
  iconBgColor = 'bg-blue-100',
  trend = 'neutral',
  trendValue,
  description,
  animationDelay = 0,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [animationDelay]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newValue = Math.min(increment * currentStep, value);
      setDisplayValue(Math.round(newValue));

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-medium-gray';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <Card 
      className={`text-center transition-all duration-700 hover:shadow-lg hover:-translate-y-1 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {/* Icon */}
      <div className={`flex items-center justify-center w-12 h-12 ${iconBgColor} rounded-xl mx-auto mb-4 transition-transform duration-300 hover:scale-110`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>

      {/* Value */}
      <div className="mb-2">
        <h3 className="text-3xl font-bold text-dark-slate-gray">
          {displayValue.toLocaleString()}{unit}
        </h3>
        
        {/* Trend Indicator */}
        {trendValue && (
          <div className={`flex items-center justify-center space-x-1 mt-1 ${getTrendColor()}`}>
            <span className="text-sm font-medium">{getTrendIcon()}</span>
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <p className="text-medium-gray font-medium">{title}</p>

      {/* Description */}
      {description && (
        <p className="text-xs text-medium-gray mt-1 opacity-75">{description}</p>
      )}

      {/* Progress Bar for Visual Appeal */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-accent-teal to-primary-blue rounded-full transition-all duration-2000 ease-out`}
          style={{
            width: isVisible ? '100%' : '0%',
            transitionDelay: `${animationDelay}ms`,
          }}
        />
      </div>
    </Card>
  );
};

export default AnimatedMetricCard;
