import React from 'react';

export default function DashboardCard({ 
  title, 
  subtitle, 
  children, 
  actions, 
  headerIcon,
  variant = 'default',
  isLoading = false,
  className = ''
}) {
  // Card variants
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
    gradient: 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800/30',
    transparent: 'bg-transparent border border-gray-200 dark:border-gray-700',
    accent: 'bg-white dark:bg-gray-800 border-l-4 border border-indigo-500 dark:border-indigo-500'
  };

  return (
    <div className={`rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${variantClasses[variant]} ${className}`}>
      {/* Card Header */}
      {(title || subtitle || actions) && (
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {headerIcon && (
              <span className="text-indigo-600 dark:text-indigo-400">
                {headerIcon}
              </span>
            )}
            <div>
              {title && <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Card Content */}
      <div className={`p-5 ${isLoading ? 'opacity-50' : ''}`}>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}