import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ProfileCompletion component displays a progress bar and checklist to encourage users
 * to complete their profile information.
 * 
 * @param {Object} userProfile - The user profile object containing user information
 */
export default function ProfileCompletion({ userProfile }) {
  // List of key profile fields to check for completion
  const profileChecks = [
    { key: 'name', label: 'Full Name', },
    { key: 'currentRole', label: 'Current Position' },
    { key: 'skills', label: 'Skills', isArray: true },
    { key: 'education', label: 'Education' },
    { key: 'yearsOfExperience', label: 'Experience' },
    { key: 'careerGoal', label: 'Career Goal' },
    { key: 'bio', label: 'Bio/About' },
    { key: 'profilePicture', label: 'Profile Picture' },
  ];

  // Calculate completion rate
  const calculateCompletion = () => {
    if (!userProfile) return 0;
    
    let completed = 0;
    const total = profileChecks.length;
    
    profileChecks.forEach(check => {
      const value = userProfile[check.key];
      if (
        (check.isArray && Array.isArray(value) && value.length > 0) ||
        (!check.isArray && value && String(value).trim() !== '')
      ) {
        completed += 1;
      }
    });
    
    return Math.round((completed / total) * 100);
  };

  const completionRate = calculateCompletion();
  const completionLevel = completionRate < 30 ? 'low' : completionRate < 70 ? 'medium' : 'high';
  
  // Get color based on completion level
  const getProgressColor = () => {
    if (completionRate < 30) return 'bg-red-500';
    if (completionRate < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get message based on completion level
  const getMessage = () => {
    if (completionRate < 30) return 'Your profile needs more information';
    if (completionRate < 70) return 'Your profile is coming along nicely';
    if (completionRate < 100) return 'Your profile is almost complete!';
    return 'Perfect! Your profile is complete';
  };
  
  // Check if a specific field is complete
  const isFieldComplete = (field) => {
    if (!userProfile) return false;
    
    const value = userProfile[field.key];
    if (field.isArray) return Array.isArray(value) && value.length > 0;
    return value && String(value).trim() !== '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Profile Completion</h3>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{completionRate}% complete</span>
          
          {completionRate < 100 && (
            <Link 
              to="/onboarding" 
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Complete Now
            </Link>
          )}
        </div>
        
        <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getProgressColor()} transition-all duration-500 ease-out`} 
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
        
        <p className={`mt-2 text-sm ${
          completionLevel === 'low' ? 'text-red-600 dark:text-red-400' : 
          completionLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 
          'text-green-600 dark:text-green-400'
        }`}>
          {getMessage()}
        </p>
      </div>
      
      <div className="space-y-2 mt-4">
        {profileChecks.map((field, index) => (
          <div key={index} className="flex items-center">
            <div className={`flex-shrink-0 h-4 w-4 rounded-full border ${
              isFieldComplete(field) 
                ? 'bg-green-500 border-green-500' 
                : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            } mr-2`}>
              {isFieldComplete(field) && (
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`text-sm ${
              isFieldComplete(field) 
                ? 'text-gray-700 dark:text-gray-300' 
                : 'text-gray-500 dark:text-gray-500'
            }`}>
              {field.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}