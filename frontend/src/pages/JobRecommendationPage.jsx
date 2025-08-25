import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../contexts/useUserProfile';
import JobRecommendations from '../components/JobRecommendations';
import Card from '../components/Card';
import { Link } from 'react-router-dom';

export default function JobRecommendationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    skillLevel: ''
  });
  const { session } = useUserProfile();

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchRecommendations = async (forceRefresh = false) => {
    if (!session?.user?.email) {
      setError("You must be logged in to view job recommendations");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Check localStorage cache first unless forceRefresh is true
      const cachedData = localStorage.getItem('jobRecommendations');
      if (cachedData && !forceRefresh) {
        setRecommendations(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/recommendations/jobs?email=${encodeURIComponent(session.user.email)}${forceRefresh ? '&refresh=true' : ''}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch job recommendations: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.recommendations) {
        setRecommendations(data.recommendations);
        localStorage.setItem('jobRecommendations', JSON.stringify(data.recommendations));
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error("Error fetching job recommendations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters to recommendations
  const filteredRecommendations = recommendations.filter(job => {
    if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.jobType && job.type !== filters.jobType) {
      return false;
    }
    if (filters.skillLevel) {
      const matchPercentage = parseInt(job.match_percentage || '0');
      if (filters.skillLevel === 'high' && matchPercentage < 80) {
        return false;
      } else if (filters.skillLevel === 'medium' && (matchPercentage < 60 || matchPercentage >= 80)) {
        return false;
      } else if (filters.skillLevel === 'low' && matchPercentage >= 60) {
        return false;
      }
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Job Recommendations</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">Finding job matches for you...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Job Recommendations</h1>
          <Card>
            <div className="text-center p-6">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Job Recommendations</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => fetchRecommendations(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Try Again
                </button>
                <Link to="/dashboard" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Job Recommendations</h1>
        
        {/* Filters */}
        <Card className="mb-8">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Filter Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Filter by location"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Type</label>
                <select
                  name="jobType"
                  value={filters.jobType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skill Match</label>
                <select
                  name="skillLevel"
                  value={filters.skillLevel}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All Matches</option>
                  <option value="high">High Match (80%+)</option>
                  <option value="medium">Medium Match (60-79%)</option>
                  <option value="low">Low Match (below 60%)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredRecommendations.length} {filteredRecommendations.length === 1 ? 'job' : 'jobs'} found
              </span>
              <button
                onClick={() => fetchRecommendations(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Recommendations
              </button>
            </div>
          </div>
        </Card>
        
        {/* Recommendations */}
        {filteredRecommendations.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Job Matches Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {recommendations.length === 0 
                  ? "We couldn't find any job matches for your profile. Try updating your skills or experience."
                  : "No jobs match your current filters. Try adjusting your filter criteria."}
              </p>
              {recommendations.length === 0 && (
                <div className="flex justify-center">
                  <Link to="/cv" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    Upload Your CV to Improve Matches
                  </Link>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRecommendations.map((job, index) => (
              <Card key={index} className="hover:shadow-xl transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      parseInt(job.match_percentage || '0') >= 80 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : parseInt(job.match_percentage || '0') >= 60
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {job.match_percentage || '95'}% Match
                    </span>
                  </div>
                  
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{job.type || 'Full-time'}</span>
                    </div>
                  </div>
                  
                  {job.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {job.description.length > 120 
                        ? `${job.description.substring(0, 120)}...` 
                        : job.description}
                    </p>
                  )}
                  
                  {/* Skills */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matching Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {job.matching_skills && job.matching_skills.length > 0 ? job.matching_skills.slice(0, 5).map((skill, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      )) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">No matching skills specified</span>
                      )}
                      {job.matching_skills && job.matching_skills.length > 5 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">+{job.matching_skills.length - 5} more</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Apply Button */}
                  <a 
                    href={job.application_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                  >
                    Apply Now
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
