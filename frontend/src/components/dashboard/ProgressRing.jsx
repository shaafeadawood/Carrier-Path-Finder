import React from 'react';
import PropTypes from 'prop-types';

/**
 * A circular progress indicator that displays percentage completion
 */
const ProgressRing = ({ percentage = 0, size = 80, strokeWidth = 6 }) => {
  // Calculate the radius
  const radius = (size - strokeWidth) / 2;
  
  // Calculate the circumference
  const circumference = radius * 2 * Math.PI;
  
  // Calculate the dash offset based on the percentage
  const dashOffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          className="text-gray-200 dark:text-gray-700"
          fill="transparent"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          className="text-indigo-500 dark:text-indigo-400"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
      </svg>
      
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

ProgressRing.propTypes = {
  percentage: PropTypes.number,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
};

export default ProgressRing;