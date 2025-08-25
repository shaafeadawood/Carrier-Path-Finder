/**
 * Badge component for displaying status, categories, or labels
 */
import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = 'full',
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all';
  
  // Size variations
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  // Rounded variations
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };
  
  // Variant styles
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    primary: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    
    // Outlined variants
    'outline-default': 'bg-transparent text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600',
    'outline-primary': 'bg-transparent text-indigo-700 dark:text-indigo-300 border border-indigo-500 dark:border-indigo-400',
    'outline-secondary': 'bg-transparent text-purple-700 dark:text-purple-300 border border-purple-500 dark:border-purple-400',
    'outline-success': 'bg-transparent text-green-700 dark:text-green-300 border border-green-500 dark:border-green-400',
    'outline-warning': 'bg-transparent text-amber-700 dark:text-amber-300 border border-amber-500 dark:border-amber-400',
    'outline-danger': 'bg-transparent text-red-700 dark:text-red-300 border border-red-500 dark:border-red-400',
    'outline-info': 'bg-transparent text-blue-700 dark:text-blue-300 border border-blue-500 dark:border-blue-400',
  };
  
  return (
    <span
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${roundedStyles[rounded]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

// Badge component prop types removed to fix dependency issues

export default Badge;
