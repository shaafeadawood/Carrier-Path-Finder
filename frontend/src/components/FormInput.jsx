import React from 'react';

/**
 * Enhanced reusable input component for forms with modern styling
 * 
 * @param {string} label - Optional input label
 * @param {string} type - Input type (text, email, password, etc)
 * @param {string} value - Input value
 * @param {function} onChange - onChange handler function
 * @param {string} className - Additional CSS classes
 * @param {string} error - Error message to display
 * @param {string} helpText - Optional help text displayed below the input
 * @param {React.ReactNode} leftIcon - Icon component to display at the left side of the input
 * @param {React.ReactNode} rightIcon - Icon component to display at the right side of the input
 * @param {string} id - Input element id attribute
 */
export default function FormInput({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  className = "", 
  error,
  helpText,
  leftIcon,
  rightIcon,
  id,
  ...props 
}) {
  // Generate a unique ID if one isn't provided
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={inputId}
          className="block mb-1.5 font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      
      <div className={`relative form-focus-ring rounded-xl ${error ? 'ring-red-300 dark:ring-red-800' : ''}`}>
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 dark:text-gray-400 transition-colors">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          className={`
            border rounded-xl px-5 py-4 w-full 
            transition-all duration-200 
            focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500
            dark:bg-gray-800 dark:border-gray-700 dark:text-white
            shadow-md hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600
            ${leftIcon ? 'pl-12' : ''}
            ${rightIcon ? 'pr-12' : ''}
            ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-700'}
            ${className}
          `}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500 dark:text-gray-400 transition-colors">
            {rightIcon}
          </div>
        )}
        
        {error && rightIcon === undefined && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {error && (
        <p 
          id={`${inputId}-error`} 
          className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p 
          id={`${inputId}-help`} 
          className="mt-2 text-sm text-gray-500 dark:text-gray-400"
        >
          {helpText}
        </p>
      )}
    </div>
  );
}
