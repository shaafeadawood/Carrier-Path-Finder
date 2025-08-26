import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

/**
 * Button component for getting job recommendations
 */
const JobRecommendationButton = ({ email }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  
  const getJobRecommendations = async () => {
    if (!email) {
      console.error('No email provided for job recommendations');
      return;
    }
    
    setLoading(true);
    try {
      // API call to backend to get job recommendations
      const response = await fetch(`http://127.0.0.1:8000/api/jobs/recommendations?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Navigate to the job recommendations page with the data
      navigate('/job-recommendations', { state: { recommendationData: data } });
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      alert('Failed to get job recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      onClick={getJobRecommendations}
      disabled={loading}
      className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Searching...</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
          <span>Find Job Matches</span>
        </>
      )}
    </button>
  );
};

JobRecommendationButton.propTypes = {
  email: PropTypes.string,
};

export default JobRecommendationButton;