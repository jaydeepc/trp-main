import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'large';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  size = 'default',
  hover = false,
  padding = 'md',
  onClick,
}) => {
  const baseClasses = 'bg-card-bg rounded-2xl shadow-card';
  
  const sizeClasses = {
    default: '',
    large: 'card-large',
  };
  
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-300 cursor-pointer' : '';
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${paddingClasses[padding]} ${hoverClasses} ${className}`;
  
  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
