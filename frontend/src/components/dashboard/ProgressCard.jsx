import React from 'react';

export default function ProgressCard({ 
  title, 
  progress = 0, 
  progressText, 
  variant = 'indigo',
  icon,
  subtitle
}) {
  // Color variants
  const colorVariants = {
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-800/30',
      fill: 'bg-indigo-600 dark:bg-indigo-500',
      text: 'text-indigo-600 dark:text-indigo-400',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-800/30',
      fill: 'bg-green-600 dark:bg-green-500',
      text: 'text-green-600 dark:text-green-400',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-800/30',
      fill: 'bg-blue-600 dark:bg-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-800/30',
      fill: 'bg-purple-600 dark:bg-purple-500',
      text: 'text-purple-600 dark:text-purple-400',
    },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-800/30',
      fill: 'bg-amber-600 dark:bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
    },
    rose: {
      bg: 'bg-rose-100 dark:bg-rose-800/30',
      fill: 'bg-rose-600 dark:bg-rose-500',
      text: 'text-rose-600 dark:text-rose-400',
    }
  };

  // Get selected color variant
  const colorClasses = colorVariants[variant] || colorVariants.indigo;
  
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`p-2 rounded-lg ${colorClasses.bg} ${colorClasses.text}`}>
              {icon}
            </div>
          )}
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        
        <div className={`text-lg font-bold ${colorClasses.text}`}>
          {progressText || `${normalizedProgress}%`}
        </div>
      </div>
      
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{subtitle}</p>
      )}
      
      {/* Progress bar */}
      <div className={`w-full h-2 rounded-full ${colorClasses.bg} mt-2`}>
        <div 
          className={`h-2 rounded-full ${colorClasses.fill}`} 
          style={{ width: `${normalizedProgress}%`, transition: 'width 0.5s ease-in-out' }}
        ></div>
      </div>
    </div>
  );
}