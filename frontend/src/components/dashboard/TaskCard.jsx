import React from 'react';

export default function TaskCard({ 
  title, 
  description, 
  status = 'pending', 
  dueDate,
  priority = 'medium',
  category,
  assignee,
  onClick 
}) {
  // Status styles
  const statusStyles = {
    pending: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    inProgress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300',
    blocked: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300'
  };
  
  // Priority styles
  const priorityStyles = {
    low: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300',
    high: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300'
  };

  // Status icon mapping
  const statusIcons = {
    pending: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
    inProgress: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
      </svg>
    ),
    completed: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    blocked: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
      </svg>
    )
  };

  // Format due date
  const formatDueDate = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      onClick={onClick} 
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow transition cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
        
        {/* Status badge */}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
          {statusIcons[status]}
          <span className="ml-1">
            {status === 'inProgress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </span>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Priority indicator */}
          {priority && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityStyles[priority]}`}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
          )}
          
          {/* Category badge */}
          {category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
              {category}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Assignee */}
          {assignee && (
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                {assignee.charAt(0)}
              </div>
            </div>
          )}
          
          {/* Due date */}
          {dueDate && (
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {formatDueDate(dueDate)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}