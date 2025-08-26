/**
 * Enhanced Button component with proper styling and variants
 */
import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none';
  
  // Size variations
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Variant styles
  const variantStyles = {
    primary: `bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 
              hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98]
              focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 relative overflow-hidden
              [&.pulse-on-hover]:hover:before:opacity-100 before:absolute before:inset-0 before:bg-white before:opacity-0 before:transition-opacity before:duration-1000 before:animate-pulse`,
              
    secondary: `bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-gray-700
                shadow-sm hover:shadow-md hover:bg-indigo-50 dark:hover:bg-gray-700 transform hover:scale-[1.02] active:scale-[0.98]
                focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`,
                
    outline: `bg-transparent text-indigo-700 dark:text-indigo-300 border-2 border-indigo-500 dark:border-indigo-400
              hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transform hover:scale-[1.02] active:scale-[0.98]
              focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`,
              
    ghost: `bg-transparent text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20
            transform hover:scale-[1.02] active:scale-[0.98]`,
            
    danger: `bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700 
             transform hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-red-500 focus:ring-offset-2`,
  };
  
  // Width control
  const widthStyles = fullWidth ? 'w-full' : '';
  
  // Disabled & loading styles
  const disabledStyles = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : '';
  
  return (
    <button
      type={type}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${widthStyles}
        ${disabledStyles}
        ${className}
      `}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 11-8 8 8 8 0 01-8-8z"></path>
        </svg>
      )}
      
      {leftIcon && !isLoading && (
        <span className="mr-2">{leftIcon}</span>
      )}
      
      {children}
      
      {rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

// Button component prop types removed to fix dependency issues

export default Button;