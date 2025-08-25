import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../contexts/useUserProfile';
import SkillChips from '../components/SkillChips';

export default function JobRecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const { session } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First check if we have recommendations in localStorage
        const savedRecommendations = localStorage.getItem('jobRecommendations');
        if (savedRecommendations) {
          setRecommendations(JSON.parse(savedRecommendations));
          setLoading(false);
          return;
        }
        
        // If not, fetch from the API
        if (!session?.user?.email) {
          throw new Error("User not authenticated");
        }
        
        const email = session.user.email;
        const response = await fetch(`http://127.0.0.1:8000/api/recommendations/jobs?email=${encodeURIComponent(email)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch job recommendations: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.recommendations) {
          setRecommendations(data.recommendations);
          localStorage.setItem('jobRecommendations', JSON.stringify(data.recommendations));
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          setRecommendations([]);
        }
      } catch (error) {
        console.error("Error loading job recommendations:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadRecommendations();
  }, [session]);
  
  const refreshRecommendations = async () => {
    if (!session?.user?.email) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Force new recommendations by passing refresh=true
      const response = await fetch(
        `http://127.0.0.1:8000/api/recommendations/jobs?email=${encodeURIComponent(session.user.email)}&refresh=true`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to refresh job recommendations: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.recommendations) {
        setRecommendations(data.recommendations);
        localStorage.setItem('jobRecommendations', JSON.stringify(data.recommendations));
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Error refreshing job recommendations:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-300">Finding job matches for you...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">Error Loading Job Recommendations</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={refreshRecommendations}
              className="px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">No Job Recommendations</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We couldn't find any job matches based on your current profile. Try updating your skills or experience.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={refreshRecommendations}
              className="px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition"
            >
              Refresh Recommendations
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Job Recommendations</h1>
          <p className="text-purple-100">
            Job opportunities that match your skills and experience
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              We found {recommendations.length} job matches for you
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Based on your current skills and experience level
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={refreshRecommendations}
              className="px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        
        {/* Job Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((job, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {job.title}
                  </h3>
                  <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs font-semibold px-2.5 py-1 rounded">
                    {job.match_percentage || '95'}% Match
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{job.company}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{job.location}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{job.type || 'Full-time'}</span>
                  </div>
                </div>
                
                {/* Matching Skills */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Matching Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.matching_skills && job.matching_skills.length > 0 ? (
                      <SkillChips skills={job.matching_skills} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" />
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Skills not specified</span>
                    )}
                  </div>
                </div>
                
                {/* Missing Skills */}
                {job.missing_skills && job.missing_skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Skills to Develop:</h4>
                    <div className="flex flex-wrap gap-2">
                      <SkillChips skills={job.missing_skills} className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" />
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <a 
                    href={job.application_url || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Tips Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-lg p-6 mt-10">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Tips to Improve Your Job Matches
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Add more skills to your profile to increase your match percentage</li>
            <li>Complete your education and experience details</li>
            <li>Upload your latest CV for better job matching</li>
            <li>Check the skills gap analysis to see what skills you should develop</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
