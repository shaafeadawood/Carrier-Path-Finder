import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const LearningPlan = ({ userId, targetJobId, targetCareerPathId }) => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('milestones');
  
  useEffect(() => {
    async function fetchRoadmap() {
      setLoading(true);
      try {
        // Fetch roadmap from Supabase
        const { data, error } = await supabase
          .from('roadmaps')
          .select('roadmap_data, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error) {
          console.error('Error fetching roadmap:', error);
          setError('Failed to load your learning plan.');
        } else if (data) {
          setRoadmap(data.roadmap_data);
        }
      } catch (err) {
        console.error('Exception fetching roadmap:', err);
        setError('An unexpected error occurred.');
      }
      setLoading(false);
    }
    
    if (userId) {
      fetchRoadmap();
    }
  }, [userId, targetJobId, targetCareerPathId]);
  
  // Function to update the progress of a milestone
  const updateMilestoneProgress = async (milestoneIndex, status) => {
    if (!roadmap || !roadmap.kanban) return;
    
    // Clone the current kanban board
    const updatedKanban = {
      backlog: [...(roadmap.kanban.backlog || [])],
      in_progress: [...(roadmap.kanban.in_progress || [])],
      done: [...(roadmap.kanban.done || [])]
    };
    
    // Get the milestone title
    const milestoneTitle = roadmap.milestones[milestoneIndex].title;
    
    // Remove from all lists first (to avoid duplicates)
    updatedKanban.backlog = updatedKanban.backlog.filter(item => item !== milestoneTitle);
    updatedKanban.in_progress = updatedKanban.in_progress.filter(item => item !== milestoneTitle);
    updatedKanban.done = updatedKanban.done.filter(item => item !== milestoneTitle);
    
    // Add to the appropriate list
    if (status === 'backlog') {
      updatedKanban.backlog.push(milestoneTitle);
    } else if (status === 'in_progress') {
      updatedKanban.in_progress.push(milestoneTitle);
    } else if (status === 'done') {
      updatedKanban.done.push(milestoneTitle);
    }
    
    // Calculate progress percentage
    const totalMilestones = roadmap.milestones.length;
    const completedMilestones = updatedKanban.done.length;
    const progressPercentage = Math.round((completedMilestones / totalMilestones) * 100);
    
    // Update roadmap in state
    const updatedRoadmap = {
      ...roadmap,
      kanban: updatedKanban,
      progress: {
        ...roadmap.progress,
        percentage: progressPercentage,
        milestones_completed: completedMilestones,
        total_milestones: totalMilestones
      }
    };
    
    setRoadmap(updatedRoadmap);
    
    // Update in database
    try {
      const { error } = await supabase
        .from('roadmaps')
        .update({
          roadmap_data: updatedRoadmap,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error updating roadmap:', error);
      }
    } catch (err) {
      console.error('Exception updating roadmap:', err);
    }
  };
  
  if (loading) return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-6 py-1">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded col-span-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
            </div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
      <div className="text-center mt-4 text-gray-500 dark:text-gray-400">Loading your learning plan...</div>
    </div>
  );
  
  if (error) return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 border-red-500">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Learning Plan</h2>
      <p className="text-gray-600 dark:text-gray-300">{error}</p>
      <button 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        onClick={() => window.location.href = '/cv'}
      >
        Upload or Update CV
      </button>
    </div>
  );
  
  if (!roadmap) return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 border-yellow-500">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Learning Plan</h2>
      <p className="text-gray-600 dark:text-gray-300">No learning plan found. Upload your CV or complete your profile to generate a personalized learning plan.</p>
      <button 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        onClick={() => window.location.href = '/cv'}
      >
        Upload CV
      </button>
    </div>
  );
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Your Learning Plan
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {roadmap.roadmap_summary || "Personalized roadmap based on your profile and career goals"}
            </p>
          </div>
          
          {/* Progress Indicator */}
          <div className="mt-4 md:mt-0">
            <div className="flex items-center">
              <div className="mr-3">
                <svg className="w-12 h-12" viewBox="0 0 36 36">
                  <path 
                    className="stroke-current text-gray-300 dark:text-gray-600" 
                    fill="none" 
                    strokeWidth="3" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path 
                    className="stroke-current text-blue-500" 
                    fill="none" 
                    strokeWidth="3" 
                    strokeDasharray={`${roadmap.progress?.percentage || 0}, 100`} 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.5" className="text-xs font-medium text-blue-500 fill-current" textAnchor="middle">
                    {roadmap.progress?.percentage || 0}%
                  </text>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                <p className="text-lg font-medium text-gray-800 dark:text-white">
                  {roadmap.progress?.milestones_completed || 0} / {roadmap.progress?.total_milestones || 0} milestones
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {roadmap.target_career_path && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Target Career Path:</span> {roadmap.target_career_path.title}
            </p>
          </div>
        )}
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'milestones' 
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('milestones')}
          >
            Milestones
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'kanban' 
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('kanban')}
          >
            Kanban Board
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'resources' 
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('resources')}
          >
            Learning Resources
          </button>
        </nav>
      </div>
      
      {/* Content Based on Active Tab */}
      <div className="p-6">
        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Milestones</h3>
            
            {roadmap.milestones?.map((milestone, index) => {
              // Determine status
              let status = 'backlog';
              if (roadmap.kanban?.in_progress?.includes(milestone.title)) {
                status = 'in_progress';
              } else if (roadmap.kanban?.done?.includes(milestone.title)) {
                status = 'done';
              }
              
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    status === 'done' 
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900' 
                      : status === 'in_progress'
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                        {status === 'done' && (
                          <span className="text-green-500 mr-2">✓</span>
                        )}
                        {milestone.title}
                      </h4>
                      <p className="mt-1 text-gray-600 dark:text-gray-400">
                        {milestone.description}
                      </p>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeline</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.timeline}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Required Skills</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {milestone.required_skills?.map((skill, idx) => (
                              <span key={idx} className="inline-block px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                      <select 
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                        value={status}
                        onChange={(e) => updateMilestoneProgress(index, e.target.value)}
                      >
                        <option value="backlog">Backlog</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Kanban Board Tab */}
        {activeTab === 'kanban' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Kanban Board</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Backlog Column */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Backlog</h4>
                <div className="space-y-3 min-h-[200px]">
                  {roadmap.kanban?.backlog?.length > 0 ? (
                    roadmap.kanban.backlog.map((item, index) => (
                      <div key={index} className="p-3 bg-white dark:bg-gray-700 rounded shadow-sm border-l-4 border-gray-400">
                        {item}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No items in backlog</p>
                  )}
                </div>
              </div>
              
              {/* In Progress Column */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">In Progress</h4>
                <div className="space-y-3 min-h-[200px]">
                  {roadmap.kanban?.in_progress?.length > 0 ? (
                    roadmap.kanban.in_progress.map((item, index) => (
                      <div key={index} className="p-3 bg-white dark:bg-gray-700 rounded shadow-sm border-l-4 border-blue-500">
                        {item}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-blue-600 dark:text-blue-400 italic">No items in progress</p>
                  )}
                </div>
              </div>
              
              {/* Done Column */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">Done</h4>
                <div className="space-y-3 min-h-[200px]">
                  {roadmap.kanban?.done?.length > 0 ? (
                    roadmap.kanban.done.map((item, index) => (
                      <div key={index} className="p-3 bg-white dark:bg-gray-700 rounded shadow-sm border-l-4 border-green-500">
                        {item}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-green-600 dark:text-green-400 italic">No completed items yet</p>
                  )}
                </div>
              </div>
            </div>
            
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Drag items between columns to update your progress. Your changes will be saved automatically.
            </p>
          </div>
        )}
        
        {/* Learning Resources Tab */}
        {activeTab === 'resources' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Learning Resources</h3>
            
            {/* Courses */}
            {roadmap.learning_plan?.courses && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Recommended Courses</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roadmap.learning_plan.courses.map((course, index) => (
                    <div key={index} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                      <h5 className="font-medium text-gray-800 dark:text-gray-200">{course}</h5>
                      <div className="flex justify-end mt-4">
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800">
                          Find Course
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Projects */}
            {roadmap.learning_plan?.projects && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Suggested Projects</h4>
                <div className="space-y-3">
                  {roadmap.learning_plan.projects.map((project, index) => (
                    <div key={index} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                      <h5 className="font-medium text-gray-800 dark:text-gray-200">{project}</h5>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Certifications */}
            {roadmap.learning_plan?.certifications && (
              <div>
                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Recommended Certifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roadmap.learning_plan.certifications.map((cert, index) => (
                    <div key={index} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                      <h5 className="font-medium text-gray-800 dark:text-gray-200">{cert}</h5>
                      <div className="flex justify-end mt-4">
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800">
                          Learn More
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* No learning resources */}
            {!roadmap.learning_plan?.courses && !roadmap.learning_plan?.projects && !roadmap.learning_plan?.certifications && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No learning resources available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPlan;
