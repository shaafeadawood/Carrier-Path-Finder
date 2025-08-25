/**
 * Avatar component for user profiles
 */
import React from 'react';

const Avatar = ({
  src,
  alt = 'User Avatar',
  name,
  size = 'md',
  status,
  statusPosition = 'bottom-right',
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = 'relative inline-flex rounded-full overflow-hidden';
  
  // Size variations
  const sizeStyles = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };
  
  // Status styles (online, busy, away, offline)
  const statusStyles = {
    online: 'bg-green-500',
    busy: 'bg-red-500',
    away: 'bg-amber-500',
    offline: 'bg-gray-400',
  };
  
  // Status position styles
  const statusPositionStyles = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
  };
  
  // Function to generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  return (
    <div
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 font-semibold">
          {getInitials(name)}
        </div>
      )}
      
      {status && (
        <span 
          className={`
            absolute block rounded-full ring-2 ring-white dark:ring-gray-800
            ${statusPositionStyles[statusPosition]}
            ${statusStyles[status]}
            ${size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'}
          `}
        />
      )}
    </div>
  );
};

// Avatar component prop types removed to fix dependency issues

export default Avatar;
