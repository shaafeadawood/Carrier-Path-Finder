/**
 * Enhanced Card component with proper styling and variants
 */
import React from 'react';

const Card = ({
  children,
  variant = 'default',
  interactive = false,
  elevation = 'md',
  padding = 'md',
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = 'rounded-2xl transition-all duration-300 overflow-hidden';
  
  // Variant styles
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
    outlined: 'bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-gray-700',
    filled: 'bg-indigo-50 dark:bg-gray-900 border border-indigo-100 dark:border-gray-800',
  };
  
  // Elevation/shadow styles
  const elevationStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  
  // Padding styles
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };
  
  // Interactive styles
  const interactiveStyles = interactive 
    ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' 
    : '';
  
  return (
    <div
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${elevationStyles[elevation]}
        ${paddingStyles[padding]}
        ${interactiveStyles}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Card component prop types removed to fix dependency issues

export default Card;