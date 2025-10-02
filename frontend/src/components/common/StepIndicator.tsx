import React from 'react';
import { Check } from 'lucide-react';
import { StepConfig } from '../../types';

interface StepIndicatorProps {
  steps: StepConfig[];
  onStepClick?: (step: number) => void;
  className?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => onStepClick && step.isAccessible && onStepClick(step.number)}
              disabled={!step.isAccessible}
              className={`
                step-indicator
                ${step.isCompleted ? 'step-completed' : ''}
                ${step.isActive ? 'step-active' : ''}
                ${!step.isCompleted && !step.isActive ? 'step-inactive' : ''}
                ${step.isAccessible && onStepClick ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                transition-all duration-200
              `}
            >
              {step.isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                step.number
              )}
            </button>
            
            {/* Step Label */}
            <div className="mt-2 text-center">
              <p className={`
                text-sm font-medium mx-auto
                ${step.isActive ? 'text-primary-blue' : ''}
                ${step.isCompleted ? 'text-green-600' : ''}
                ${!step.isCompleted && !step.isActive ? 'text-medium-gray' : ''}
              `}>
                {step.title}
              </p>
              <p className="text-xs text-medium-gray mt-1 max-w-24 leading-tight mx-auto">
                {step.description}
              </p>
            </div>
          </div>
          
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className="flex-1 mx-4">
              <div className={`
                h-0.5 w-full transition-colors duration-300
                ${steps[index + 1].isCompleted || steps[index + 1].isActive 
                  ? 'bg-accent-teal' 
                  : 'bg-gray-300'
                }
              `} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
