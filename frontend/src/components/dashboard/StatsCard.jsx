import React from 'react';

export default function StatsCard({ title, value, subtitle, icon, trend, trendValue, color = 'indigo' }) {
  // Color variants
  const colorVariants = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-100 dark:bg-indigo-800/40',
      iconText: 'text-indigo-700 dark:text-indigo-300'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-800/40',
      iconText: 'text-green-700 dark:text-green-300'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-800/40',
      iconText: 'text-blue-700 dark:text-blue-300'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-800/40',
      iconText: 'text-purple-700 dark:text-purple-300'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-800/40',
      iconText: 'text-amber-700 dark:text-amber-300'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      text: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-100 dark:bg-rose-800/40',
      iconText: 'text-rose-700 dark:text-rose-300'
    }
  };

  const selectedColor = colorVariants[color] || colorVariants.indigo;

  // Trend helpers
  const renderTrend = () => {
    if (trend === 'up') {
      return (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5L12.5303 4.46967C12.2374 4.17678 11.7626 4.17678 11.4697 4.46967L12 5ZM12 13L11.4697 13.5303C11.7626 13.8232 12.2374 13.8232 12.5303 13.5303L12 13ZM17.5303 8.53033C17.8232 8.23744 17.8232 7.76256 17.5303 7.46967C17.2374 7.17678 16.7626 7.17678 16.4697 7.46967L17.5303 8.53033ZM7.53033 7.46967C7.23744 7.17678 6.76256 7.17678 6.46967 7.46967C6.17678 7.76256 6.17678 8.23744 6.46967 8.53033L7.53033 7.46967ZM11.4697 4.46967L7.46967 8.46967L8.53033 9.53033L12.5303 5.53033L11.4697 4.46967ZM11.4697 5.53033L15.4697 9.53033L16.5303 8.46967L12.5303 4.46967L11.4697 5.53033ZM11.4697 12.4697L11.4697 5.46967L12.5303 5.46967L12.5303 12.4697L11.4697 12.4697Z" fill="currentColor"/>
          </svg>
          <span>{trendValue || "↑"}</span>
        </div>
      );
    } else if (trend === 'down') {
      return (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-medium">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19L11.4697 19.5303C11.7626 19.8232 12.2374 19.8232 12.5303 19.5303L12 19ZM12 11L12.5303 10.4697C12.2374 10.1768 11.7626 10.1768 11.4697 10.4697L12 11ZM6.46967 15.4697C6.17678 15.7626 6.17678 16.2374 6.46967 16.5303C6.76256 16.8232 7.23744 16.8232 7.53033 16.5303L6.46967 15.4697ZM16.4697 16.5303C16.7626 16.8232 17.2374 16.8232 17.5303 16.5303C17.8232 16.2374 17.8232 15.7626 17.5303 15.4697L16.4697 16.5303ZM12.5303 19.5303L16.5303 15.5303L15.4697 14.4697L11.4697 18.4697L12.5303 19.5303ZM12.5303 18.4697L8.53033 14.4697L7.46967 15.5303L11.4697 19.5303L12.5303 18.4697ZM12.5303 11.5303L12.5303 18.5303L11.4697 18.5303L11.4697 11.5303L12.5303 11.5303Z" fill="currentColor"/>
          </svg>
          <span>{trendValue || "↓"}</span>
        </div>
      );
    } else if (trend === 'neutral') {
      return (
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs font-medium">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{trendValue || "−"}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`relative p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow transition-shadow overflow-hidden`}>
      {/* Decorative colored area */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${selectedColor.text}`}></div>
      
      <div className="flex justify-between items-start">
        {/* Text content */}
        <div>
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
            {title}
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {value}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {subtitle && (
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {subtitle}
              </span>
            )}
            {renderTrend()}
          </div>
        </div>
        
        {/* Icon */}
        <div className={`rounded-lg p-2 ${selectedColor.iconBg} ${selectedColor.iconText}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}