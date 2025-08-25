import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component to display a user's recent activities in a timeline format
 */
const LatestActivities = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activities</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className={`w-3 h-3 mt-1.5 rounded-full ${activity.color || 'bg-indigo-500'} flex-shrink-0`}></div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {activity.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {activity.time}
            </p>
            {activity.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {activity.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

LatestActivities.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      description: PropTypes.string,
      color: PropTypes.string,
    })
  ),
};

export default LatestActivities;
