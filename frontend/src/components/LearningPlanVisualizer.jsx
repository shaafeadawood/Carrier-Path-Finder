import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserProfile } from '../contexts/useUserProfile';
import Card from '../components/Card';

export default function LearningPlanVisualizer() {
  const { userProfile, session } = useUserProfile();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('roadmap');
  const navigate = useNavigate();
  const { targetJobId, targetCareerPathId } = useParams();

  useEffect(() => {
    fetchLearningPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, targetJobId, targetCareerPathId]);

  const fetchLearningPlan = async (forceRefresh = false) => {
    if (!session?.user?.email) {
      setError("You need to be logged in to view your learning plan");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if we have cached data and not forcing refresh
      const cachedData = localStorage.getItem('learningPlan');
      if (cachedData && !forceRefresh && !targetJobId && !targetCareerPathId) {
        setPlan(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      // Determine which API endpoint to call
      let url = `http://127.0.0.1:8000/api/roadmap?email=${encodeURIComponent(session.user.email)}`;
      
      if (forceRefresh) {
        url += '&refresh=true';
      }
      
      if (targetJobId) {
        url = `http://127.0.0.1:8000/api/roadmap/job/${targetJobId}?email=${encodeURIComponent(session.user.email)}`;
      } else if (targetCareerPathId) {
        url = `http://127.0.0.1:8000/api/roadmap/career/${targetCareerPathId}?email=${encodeURIComponent(session.user.email)}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch learning plan: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setPlan(data);
      
      // Only cache the default roadmap
      if (!targetJobId && !targetCareerPathId) {
        localStorage.setItem('learningPlan', JSON.stringify(data));
      }
    } catch (err) {
      console.error("Error fetching learning plan:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoadmapGeneration = async () => {
    if (!session?.user?.email) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/roadmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          user_id: userProfile.id,
          career_goal: userProfile.career_goal || "Software Developer",
          skills: userProfile.skills || [],
          experience_level: userProfile.level || "Beginner"
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate roadmap: ${errorText}`);
      }
      
      // Fetch the newly generated roadmap
      fetchLearningPlan(true);
    } catch (err) {
      console.error("Error generating roadmap:", err);
      setError(err.message);
    }
  };

  const updateMilestoneStatus = async (milestoneIndex, taskIndex, newStatus) => {
    if (!plan || !plan.roadmap || !session?.user?.email) {
      return;
    }
    
    // Create a deep copy of the plan to update
    const updatedPlan = JSON.parse(JSON.stringify(plan));
    
    // Update the task status
    if (taskIndex !== undefined) {
      updatedPlan.roadmap.milestones[milestoneIndex].tasks[taskIndex].status = newStatus;
    } else {
      // Mark all tasks in milestone as complete
      updatedPlan.roadmap.milestones[milestoneIndex].tasks.forEach(task => {
        task.status = newStatus;
      });
      
      // Also mark the milestone as completed
      updatedPlan.roadmap.milestones[milestoneIndex].completed = newStatus === 'done';
    }
    
    // Update the progress percentage
    const totalTasks = updatedPlan.roadmap.milestones.reduce((sum, milestone) => sum + milestone.tasks.length, 0);
    const completedTasks = updatedPlan.roadmap.milestones.reduce((sum, milestone) => {
      return sum + milestone.tasks.filter(task => task.status === 'done').length;
    }, 0);
    
    updatedPlan.roadmap.progress.percentage = Math.round((completedTasks / totalTasks) * 100);
    updatedPlan.roadmap.progress.milestones_completed = updatedPlan.roadmap.milestones.filter(m => m.completed).length;
    
    // Update the kanban board
    const allTasks = [];
    updatedPlan.roadmap.milestones.forEach(milestone => {
      milestone.tasks.forEach(task => {
        allTasks.push({
          title: task.title,
          status: task.status
        });
      });
    });
    
    updatedPlan.roadmap.kanban = {
      backlog: allTasks.filter(task => task.status === 'backlog').map(task => task.title),
      in_progress: allTasks.filter(task => task.status === 'in_progress').map(task => task.title),
      done: allTasks.filter(task => task.status === 'done').map(task => task.title)
    };
    
    // Optimistically update UI
    setPlan(updatedPlan);
    
    // Save to backend
    try {
      const response = await fetch('http://127.0.0.1:8000/api/roadmap/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          roadmap_data: updatedPlan.roadmap
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update roadmap: ${response.status}`);
      }
      
      // Update localStorage
      localStorage.setItem('learningPlan', JSON.stringify(updatedPlan));
    } catch (err) {
      console.error("Error updating roadmap:", err);
      // Revert to original plan on error
      fetchLearningPlan();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Learning Plan</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="ml-3 text-lg text-gray-600 dark:text-gray-300">Building your personalized learning plan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Learning Plan</h1>
          <Card>
            <div className="text-center p-6">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Learning Plan</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => fetchLearningPlan(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Try Again
                </button>
                <button
                  onClick={handleRoadmapGeneration}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Generate New Roadmap
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!plan || !plan.roadmap) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Learning Plan</h1>
          <Card>
            <div className="text-center p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">No Learning Plan Available</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                You don't have a learning plan yet. Generate one based on your profile and career goals.
              </p>
              <button
                onClick={handleRoadmapGeneration}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Generate My Learning Plan
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const roadmap = plan.roadmap;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Learning Plan</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {roadmap.target_career_path?.title 
            ? `Career path: ${roadmap.target_career_path.title}`
            : 'Your personalized roadmap to success'}
        </p>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roadmap'
                  ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resources'
                  ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Learning Resources
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tracker'
                  ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Progress Tracker
            </button>
          </nav>
        </div>
        
        {/* Summary Card */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{roadmap.roadmap_summary}</h2>
                <div className="flex items-center">
                  <div className="w-full md:w-64 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${roadmap.progress.percentage || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {roadmap.progress.percentage || 0}% Complete
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => fetchLearningPlan(true)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button
                  onClick={handleRoadmapGeneration}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Generate New Plan
                </button>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Tab Content */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            {roadmap.milestones && roadmap.milestones.map((milestone, milestoneIndex) => (
              <Card key={milestoneIndex}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      {milestone.title}
                      {milestone.timeline && <span className="ml-2 text-sm font-normal text-gray-500">({milestone.timeline})</span>}
                    </h3>
                    <div className="flex items-center">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        milestone.completed
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {milestone.completed ? 'Completed' : 'In Progress'}
                      </div>
                      <button
                        onClick={() => updateMilestoneStatus(milestoneIndex, undefined, milestone.completed ? 'backlog' : 'done')}
                        className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title={milestone.completed ? "Mark as incomplete" : "Mark all as complete"}
                      >
                        {milestone.completed ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {milestone.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{milestone.description}</p>
                  )}
                  
                  {/* Tasks */}
                  <div className="space-y-3 mt-4">
                    {milestone.tasks && milestone.tasks.map((task, taskIndex) => (
                      <div 
                        key={taskIndex}
                        className={`p-3 rounded-lg border ${
                          task.status === 'done'
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                            : task.status === 'in_progress'
                              ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                              : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <button
                              onClick={() => {
                                const newStatus = task.status === 'done' 
                                  ? 'backlog' 
                                  : task.status === 'in_progress' ? 'done' : 'in_progress';
                                updateMilestoneStatus(milestoneIndex, taskIndex, newStatus);
                              }}
                              className={`mr-3 flex-shrink-0 h-5 w-5 rounded-full border ${
                                task.status === 'done'
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : task.status === 'in_progress'
                                    ? 'border-blue-500'
                                    : 'border-gray-300 dark:border-gray-500'
                              } flex items-center justify-center`}
                            >
                              {task.status === 'done' && (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {task.status === 'in_progress' && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </button>
                            <span className={task.status === 'done' ? 'line-through text-gray-500 dark:text-gray-400' : ''}>
                              {task.title}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            {task.difficulty && (
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                task.difficulty === 'easy'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : task.difficulty === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {task.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Skills */}
                  {milestone.required_skills && milestone.required_skills.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {milestone.required_skills.map((skill, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {activeTab === 'resources' && (
          <div className="space-y-8">
            {/* Courses */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Recommended Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roadmap.learning_plan?.courses && roadmap.learning_plan.courses.map((course, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                        {typeof course === 'string' ? course : course.title}
                      </h4>
                      {typeof course !== 'string' && (
                        <>
                          {course.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{course.description}</p>
                          )}
                          {course.url && (
                            <a 
                              href={course.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              View Course →
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            {/* Projects */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Practice Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roadmap.learning_plan?.projects && roadmap.learning_plan.projects.map((project, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                        {typeof project === 'string' ? project : project.title}
                      </h4>
                      {typeof project !== 'string' && project.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            {/* Certifications */}
            {roadmap.learning_plan?.certifications && roadmap.learning_plan.certifications.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Recommended Certifications</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {roadmap.learning_plan.certifications.map((cert, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">
                        {typeof cert === 'string' ? cert : cert.title}
                        {typeof cert !== 'string' && cert.description && (
                          <p className="ml-6 text-sm text-gray-600 dark:text-gray-400">{cert.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}
            
            {/* Mentorship */}
            {roadmap.mentorship && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Mentorship & Networking</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {roadmap.mentorship}
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}
        
        {activeTab === 'tracker' && (
          <div className="space-y-8">
            {/* Progress Overview */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Progress Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{roadmap.progress.percentage || 0}%</div>
                    <div className="text-gray-600 dark:text-gray-400 mt-1">Overall Completion</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                      {roadmap.progress.milestones_completed || 0}/{roadmap.milestones?.length || 0}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mt-1">Milestones Completed</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      {roadmap.kanban?.done?.length || 0}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mt-1">Tasks Completed</div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* KPIs */}
            {roadmap.progress_tracking?.key_performance_indicators && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Key Performance Indicators</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {roadmap.progress_tracking.key_performance_indicators.map((kpi, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">{kpi}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}
            
            {/* Kanban Board */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Task Board</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <span className="h-3 w-3 rounded-full bg-gray-400 mr-2"></span>
                      To Do ({roadmap.kanban?.backlog?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {roadmap.kanban?.backlog?.map((task, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded shadow-sm">
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <span className="h-3 w-3 rounded-full bg-blue-400 mr-2"></span>
                      In Progress ({roadmap.kanban?.in_progress?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {roadmap.kanban?.in_progress?.map((task, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-900 p-3 rounded shadow-sm">
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <span className="h-3 w-3 rounded-full bg-green-400 mr-2"></span>
                      Done ({roadmap.kanban?.done?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {roadmap.kanban?.done?.map((task, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-900 p-3 rounded shadow-sm">
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Checkpoints */}
            {roadmap.progress_tracking?.checkpoints && roadmap.progress_tracking.checkpoints.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Progress Checkpoints</h3>
                  <div className="space-y-3">
                    {roadmap.progress_tracking.checkpoints.map((checkpoint, index) => (
                      <div key={index} className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-indigo-200 dark:bg-indigo-900 flex-shrink-0"></div>
                        <div className="h-px flex-grow bg-indigo-200 dark:bg-indigo-900 mx-2"></div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg">
                          <span className="font-medium text-gray-800 dark:text-gray-200">{checkpoint.title}</span>
                          {checkpoint.timeline && (
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({checkpoint.timeline})</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}