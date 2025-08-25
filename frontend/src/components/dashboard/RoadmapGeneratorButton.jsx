import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

/**
 * Button component for triggering AI-generated roadmaps
 */
const RoadmapGeneratorButton = ({ email }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  
  const generateRoadmap = async () => {
    if (!email) {
      console.error('No email provided for roadmap generation');
      return;
    }
    
    setLoading(true);
    try {
      // API call to backend to generate roadmap
      const response = await fetch('http://127.0.0.1:8000/api/roadmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Navigate to the learning plan page to view the generated roadmap
      navigate('/learning-plan', { state: { roadmapData: data } });
    } catch (error) {
      console.error('Error generating roadmap:', error);
      alert('Failed to generate roadmap. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      onClick={generateRoadmap}
      disabled={loading}
      className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Generating...</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <span>Generate AI Roadmap</span>
        </>
      )}
    </button>
  );
};

RoadmapGeneratorButton.propTypes = {
  email: PropTypes.string,
};

export default RoadmapGeneratorButton;
