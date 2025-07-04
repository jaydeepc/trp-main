import React from 'react';
import { LucideIcon } from 'lucide-react';
import Card from './Card';

interface StaticMetricCardProps {
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
  className?: string;
}

const StaticMetricCard: React.FC<StaticMetricCardProps> = ({
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
  className = '',
}) => {
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
      className={`text-center hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      {/* Icon */}
      <div className={`flex items-center justify-center w-12 h-12 ${iconBgColor} rounded-xl mx-auto mb-4`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>

      {/* Value */}
      <div className="mb-2">
        <h3 className="text-3xl font-bold text-dark-slate-gray">
          {value.toLocaleString()}{unit}
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

      {/* Static Progress Bar */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-accent-teal to-primary-blue rounded-full" />
      </div>
    </Card>
  );
};

export default StaticMetricCard;
