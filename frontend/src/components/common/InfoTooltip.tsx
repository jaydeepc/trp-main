import React, { useState } from 'react';
import { Info, HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  description: string;
  businessValue?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'info' | 'help';
  className?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  description,
  businessValue,
  position = 'top',
  size = 'md',
  variant = 'info',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-64 text-xs';
      case 'md':
        return 'w-80 text-sm';
      case 'lg':
        return 'w-96 text-sm';
      default:
        return 'w-80 text-sm';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-surface-800';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-surface-800';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-surface-800';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-surface-800';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-surface-800';
    }
  };

  const IconComponent = variant === 'help' ? HelpCircle : Info;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="p-1 text-surface-500 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 rounded"
        aria-label={`Information about ${title}`}
      >
        <IconComponent className="w-4 h-4" />
      </button>

      {isVisible && (
        <div
          className={`absolute z-50 ${getPositionClasses()} ${getSizeClasses()}`}
          role="tooltip"
        >
          <div className="bg-surface-800 text-white p-4 rounded-xl shadow-2xl border border-surface-700">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-white mb-1">{title}</h4>
                <p className="text-surface-200 leading-relaxed">{description}</p>
              </div>
              
              {businessValue && (
                <div className="pt-2 border-t border-surface-600">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-accent-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="text-accent-300 font-medium text-xs uppercase tracking-wide">Business Value</span>
                      <p className="text-surface-200 mt-1 leading-relaxed">{businessValue}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Arrow */}
          <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}></div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
