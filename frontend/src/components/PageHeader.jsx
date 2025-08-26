/**
 * PageHeader component for consistent page headers across the application
 */
import React from 'react';

const PageHeader = ({
  title,
  description,
  actions,
  breadcrumbs,
  className = '',
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {/* Breadcrumbs if provided */}
      {breadcrumbs && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="inline-flex items-center">
                {index > 0 && (
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                )}
                
                {crumb.href ? (
                  <a 
                    href={crumb.href}
                    className={`inline-flex items-center text-sm font-medium ${
                      index === breadcrumbs.length - 1 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {index === 0 && (
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                      </svg>
                    )}
                    {crumb.label}
                  </a>
                ) : (
                  <span className="ml-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 md:ml-2">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-base sm:text-lg text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            {actions}
          </div>
        )}
      </div>
      
      <div className="mt-6 border-b border-gray-200 dark:border-gray-700"></div>
    </div>
  );
};

// PageHeader component prop types removed to fix dependency issues

export default PageHeader;