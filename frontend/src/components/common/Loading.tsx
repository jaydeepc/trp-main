import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  progress?: number;
}

const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
  progress,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-accent-teal`} />
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-blue">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
      
      {message && (
        <p className={`${textSizeClasses[size]} text-medium-gray font-medium`}>
          {message}
        </p>
      )}
      
      {progress !== undefined && (
        <div className="w-48 bg-gray-200 rounded-full h-2">
          <div
            className="bg-accent-teal h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-modal p-8">
          <LoadingContent />
        </div>
      </div>
    );
  }

  return <LoadingContent />;
};

export default Loading;
