import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../contexts/useUserProfile';
import SkillsVisualization from '../components/SkillsVisualization';
import SkillChips from '../components/SkillChips';

export default function SkillsGapPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const { session } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    const loadAnalysis = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First check if we have analysis in localStorage
        const savedAnalysis = localStorage.getItem('skillsGapAnalysis');
        if (savedAnalysis) {
          setAnalysis(JSON.parse(savedAnalysis));
          setLoading(false);
          return;
        }
        
        // If not, fetch from the API
        if (!session?.user?.email) {
          throw new Error("User not authenticated");
        }
        
        const email = session.user.email;
        const response = await fetch(`http://127.0.0.1:8000/api/analyze/skills-gap?email=${encodeURIComponent(email)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch skills gap analysis: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.analysis) {
          setAnalysis(data.analysis);
          localStorage.setItem('skillsGapAnalysis', JSON.stringify(data.analysis));
        } else if (data.error) {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error("Error loading skills gap analysis:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadAnalysis();
  }, [session]);
  
  const regenerateAnalysis = async () => {
    if (!session?.user?.email) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Force new analysis by passing force=true
      const response = await fetch(
        `http://127.0.0.1:8000/api/analyze/skills-gap?email=${encodeURIComponent(session.user.email)}&force=true`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to regenerate skills gap analysis: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.analysis) {
        setAnalysis(data.analysis);
        localStorage.setItem('skillsGapAnalysis', JSON.stringify(data.analysis));
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error regenerating skills gap analysis:", error);
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
          <p className="mt-3 text-gray-600 dark:text-gray-300">Loading skills analysis...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">Error Loading Skills Analysis</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={regenerateAnalysis}
              className="px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">No Analysis Available</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You need to generate a skills gap analysis first.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={regenerateAnalysis}
              className="px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition"
            >
              Generate Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { 
    current_skills = [], 
    missing_skills = [], 
    recommended_courses = [], 
    current_level = "", 
    target_level = "",
    skill_match_percentage = 0
  } = analysis;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Skills Gap Analysis</h1>
          <p className="text-indigo-100">
            Bridging the gap between your current skills and career goals
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Progress Summary Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-3/4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Your Skill Match
              </h2>
              <div className="flex items-center mb-2">
                <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                  <div 
                    className="bg-indigo-600 h-4 rounded-full" 
                    style={{ width: `${skill_match_percentage}%` }}
                  ></div>
                </div>
                <span className="ml-4 font-semibold text-lg text-indigo-600 dark:text-indigo-400">
                  {skill_match_percentage}%
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Current: {current_level}</span>
                <span>Target: {target_level}</span>
              </div>
            </div>
            
            <div className="w-full md:w-1/4 flex flex-col items-center">
              <button
                onClick={regenerateAnalysis}
                className="px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition w-full md:w-auto"
              >
                Regenerate Analysis
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-3 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition w-full md:w-auto"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
        
        {/* Skills Visualization */}
        <SkillsVisualization 
          currentSkills={current_skills} 
          targetSkills={missing_skills}
        />
        
        {/* Skills Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Current Skills */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Your Current Skills
            </h3>
            {current_skills.length > 0 ? (
              <SkillChips skills={current_skills} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" />
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No skills found. Update your profile to add skills.</p>
            )}
          </div>
          
          {/* Missing Skills */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Skills to Develop
            </h3>
            {missing_skills.length > 0 ? (
              <SkillChips skills={missing_skills} className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" />
            ) : (
              <p className="text-gray-600 dark:text-gray-400">Great job! You have all the required skills.</p>
            )}
          </div>
        </div>
        
        {/* Recommended Resources */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
            Recommended Learning Resources
          </h3>
          
          {recommended_courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommended_courses.map((course, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition"
                >
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                    {course.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                      {course.platform}
                    </span>
                    <a 
                      href={course.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
                    >
                      Learn More →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
              No specific courses recommended at this time.
            </p>
          )}
        </div>
        
        {/* Action Plan */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Next Steps
          </h3>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li>Focus on acquiring the missing skills highlighted in your analysis</li>
            <li>Explore the recommended learning resources to build these skills</li>
            <li>Update your profile as you acquire new skills to track your progress</li>
            <li>Generate a new roadmap based on your updated skill set</li>
          </ol>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/learning-plan')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg text-white hover:from-indigo-700 hover:to-blue-700 transition"
            >
              View Your Learning Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
