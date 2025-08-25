import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../contexts/useUserProfile";
import { supabase } from "../../supabaseClient";
import AppLayout from "../components/layout/AppLayout";
import StatsCard from "../components/dashboard/StatsCard";
import DashboardCard from "../components/dashboard/DashboardCard";
import TaskCard from "../components/dashboard/TaskCard";
import ProgressCard from "../components/dashboard/ProgressCard";
import Button from "../components/Button";
import ProgressRing from "../components/dashboard/ProgressRing";
import LatestActivities from "../components/dashboard/LatestActivities";
import SkillsRadarChart from "../components/dashboard/SkillsRadarChart";
import ProfileCompletion from "../components/ProfileCompletion";
import SkillsGapAnalysisButton from "../components/dashboard/SkillsGapAnalysisButton";
import JobRecommendationButton from "../components/dashboard/JobRecommendationButton";
import RoadmapGeneratorButton from "../components/dashboard/RoadmapGeneratorButton";










export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userProfile, session, loading: profileLoading } = useUserProfile();

  useEffect(() => {
    let cancelled = false;
    async function fetchDashboard() {
      setLoading(true);
      try {
        // Double check if we have an active session directly from Supabase
        const { data: authData, error: authError } = await supabase.auth.getSession();
        const currentSession = authData?.session;
        
        // Log authentication state for debugging
        console.log("Dashboard auth check - Context session:", !!session, "Supabase session:", !!currentSession);
        
        if (authError) {
          console.error("Supabase auth error:", authError);
        }
        
        // No active Supabase session - redirect to login
        if (!currentSession) {
          console.log("No active session found in dashboard, redirecting to login");
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 100);
          return;
        }
        
        const email = currentSession.user.email;
        console.log(`Fetching dashboard data for user: ${email}`);
        
        // Fetch dashboard data from backend
        const res = await fetch(`http://127.0.0.1:8000/api/dashboard?email=${encodeURIComponent(email)}`);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Dashboard API error: ${res.status} - ${errorText}`);
          throw new Error(`Failed to fetch dashboard data: ${res.status} - ${errorText}`);
        }
        
        const data = await res.json();
        console.log("Dashboard data received:", data ? "Success" : "Empty response");
        
        if (data.error === "User not found" && userProfile) {
          // User exists in Supabase but not in backend - send profile to backend
          console.log("User not found in backend, syncing profile...");
          
          try {
            const syncResponse = await fetch('http://127.0.0.1:8000/api/user/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: userProfile.id,
                name: userProfile.name || currentSession.user.user_metadata?.full_name || "New User",
                email: userProfile.email || currentSession.user.email,
                education: userProfile.education || "",
                experience: userProfile.experience || "",
                projects: userProfile.projects || "",
                interests: userProfile.interests || "",
                skills: userProfile.skills || []
              }),
            });
            
            if (syncResponse.ok) {
              console.log("Profile synced to backend, retrying dashboard fetch");
              // Try fetching dashboard again after sync
              const retryRes = await fetch(`http://127.0.0.1:8000/api/dashboard?email=${encodeURIComponent(email)}`);
              if (!retryRes.ok) {
                throw new Error(`Retry failed: ${retryRes.status}`);
              }
              
              const retryData = await retryRes.json();
              if (!cancelled) setDashboard(retryData);
            } else {
              const syncErrorText = await syncResponse.text();
              console.error(`Profile sync error: ${syncResponse.status} - ${syncErrorText}`);
            }
          } catch (syncErr) {
            console.error("Error syncing profile to backend:", syncErr);
          }
        } else if (!cancelled) {
          setDashboard(data);
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    
    // Check if we have a direct session from Supabase, regardless of context state
    async function checkAndFetchDashboard() {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          console.log("Active Supabase session found, fetching dashboard");
          fetchDashboard();
        } else if (!profileLoading) {
          console.log("No active session and profile loading complete");
          setLoading(false);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setLoading(false);
      }
    }
    
    // Start by checking Supabase session directly
    checkAndFetchDashboard();
    
    return () => { cancelled = true; };
  }, [navigate, session, userProfile, profileLoading]);

  // Only show loading if we're actually waiting for data
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!dashboard || !dashboard.profile) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Your Dashboard
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 max-w-md">
            No profile found. Please complete the onboarding process to set up your career journey.
          </p>
          <Button
            onClick={() => navigate("/onboarding")}
            variant="primary"
            size="lg"
          >
            Go to Onboarding
          </Button>
        </div>
      </AppLayout>
    );
  }

  const { welcome_message, profile, progress, kanban, gamification, last_updated } = dashboard;

  // Map tasks to our component format
  const pendingTasks = kanban.backlog.map((task, idx) => ({
    id: `backlog-${idx}`,
    title: task,
    status: 'pending',
    priority: idx % 3 === 0 ? 'high' : idx % 2 === 0 ? 'medium' : 'low',
    category: 'Learning'
  }));

  const inProgressTasks = kanban.in_progress.map((task, idx) => ({
    id: `in_progress-${idx}`,
    title: task,
    status: 'inProgress',
    priority: 'medium',
    category: 'In Progress'
  }));

  // Process completed tasks for use in the UI
  const COMPLETED_TASKS = kanban.done.map((task, idx) => ({
    id: `done-${idx}`,
    title: task,
    status: 'completed',
    category: 'Completed'
  }));

  // Activities for activity feed
  const recentActivities = [
    { title: 'CV updated', time: '2 hours ago', color: 'bg-green-500' },
    { title: 'Completed Python Basics course', time: 'Yesterday', color: 'bg-indigo-500' },
    { title: 'Added new skills to profile', time: '3 days ago', color: 'bg-blue-500' },
    { title: 'Generated new career roadmap', time: '1 week ago', color: 'bg-purple-500' },
  ];

  return (
    <AppLayout>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{welcome_message}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Continue your journey to becoming a <span className="font-medium text-indigo-600 dark:text-indigo-400">{profile.career_goal}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatsCard
          title="XP Points"
          value={gamification.xp_points}
          subtitle="Level Progress"
          trend="up"
          trendValue="+20% this week"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          }
          color="purple"
        />
        
        <StatsCard
          title="Skills Mastered"
          value={profile.skills ? profile.skills.length : 0}
          subtitle="Skills in your profile"
          trend="up"
          trendValue="+2 new"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          }
          color="blue"
        />
        
        <StatsCard
          title="Learning Streak"
          value={`${gamification.streak} days`}
          subtitle="Keep it up!"
          trend="up"
          trendValue="Best: 14 days"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          }
          color="amber"
        />
        
        <StatsCard
          title="Roadmap Progress"
          value={`${progress.percentage}%`}
          subtitle="Career path completion"
          trend={progress.percentage > 50 ? "up" : "neutral"}
          trendValue={progress.percentage > 75 ? "Almost there!" : "In progress"}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          }
          color="green"
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Tracking Section */}
          <DashboardCard 
            title="Career Progress" 
            subtitle="Track your journey towards your career goals"
            headerIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            }
            actions={
              <Button
                variant="ghost"
                size="sm"
                rightIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                }
              >
                View Details
              </Button>
            }
          >
            <div className="space-y-4">
              {progress.milestones.map((milestone, idx) => (
                <ProgressCard
                  key={idx}
                  title={milestone.title}
                  progress={milestone.completed ? 100 : Math.floor(Math.random() * 80)}
                  variant={idx % 3 === 0 ? 'indigo' : idx % 2 === 0 ? 'blue' : 'purple'}
                  subtitle={`${milestone.tasks.filter(t => t.status === 'done').length}/${milestone.tasks.length} tasks completed`}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  }
                />
              ))}

              <div className="pt-2 text-center">
                <Button
                  onClick={() => navigate('/learning-plan')}
                  variant="secondary"
                  size="md"
                  fullWidth
                >
                  View Complete Roadmap
                </Button>
              </div>
            </div>
          </DashboardCard>

          {/* Tasks Section */}
          <DashboardCard
            title="Current Tasks"
            subtitle="Your learning and career development tasks"
            headerIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            }
            actions={
              <div className="flex items-center gap-2">
                <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                </button>
                <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                <button className="px-3 py-1 text-sm font-medium text-gray-900 dark:text-white border-b-2 border-indigo-500">
                  All Tasks
                </button>
                <button className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  In Progress
                </button>
                <button className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Completed
                </button>
              </div>
              
              {/* Task List */}
              <div className="space-y-3">
                {inProgressTasks.slice(0, 2).map((task) => (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    description="Task details would be displayed here"
                    status={task.status}
                    priority={task.priority}
                    category={task.category}
                    dueDate={new Date(Date.now() + Math.floor(Math.random() * 10) * 86400000).toISOString()}
                  />
                ))}
                
                {pendingTasks.slice(0, 1).map((task) => (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    description="Task details would be displayed here"
                    status={task.status}
                    priority={task.priority}
                    category={task.category}
                  />
                ))}
              </div>
              
              <div className="pt-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                >
                  View All Tasks
                </Button>
              </div>
            </div>
          </DashboardCard>
          
          {/* Skills Visualization */}
          <DashboardCard
            title="Skills Assessment"
            subtitle="Overview of your current skillset"
            headerIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            }
            actions={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/skills-gap')}
              >
                Analyze Gaps
              </Button>
            }
          >
            {profile.skills && profile.skills.length > 0 ? (
              <SkillsRadarChart skills={profile.skills} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No skills information available. Add skills to see your assessment.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/onboarding')}
                >
                  Add Skills
                </Button>
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <DashboardCard
            title="Your Profile"
            variant="accent"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-3xl font-bold mb-4">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {profile.name || "User"}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {profile.career_goal || "Career Seeker"}
              </p>
              
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {profile.email || "Email not available"}
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {profile.skills && profile.skills.slice(0, 4).map((skill, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {profile.skills && profile.skills.length > 4 && (
                  <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    +{profile.skills.length - 4} more
                  </span>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/onboarding')}
              >
                Edit Profile
              </Button>
            </div>
          </DashboardCard>
          
          {/* Profile Completion */}
          <ProfileCompletion userProfile={profile} />
          
          {/* Badges & Achievements */}
          <DashboardCard
            title="Achievements"
            headerIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            }
          >
            <div>
              <div className="flex flex-wrap gap-4 justify-center mb-4">
                {gamification.badges && gamification.badges.map((badge, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl mb-2">
                      🏅
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                      {badge}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Achievements</h4>
                <ul className="space-y-2 text-sm">
                  {gamification.achievements && gamification.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-amber-500">⭐</span>
                      <span className="text-gray-600 dark:text-gray-300">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DashboardCard>
          
          {/* Activity Feed */}
          <DashboardCard
            title="Recent Activity"
            variant="gradient"
          >
            <LatestActivities activities={recentActivities} />
          </DashboardCard>
          
          {/* Quick Actions */}
          <DashboardCard
            title="Quick Actions"
            subtitle="Tools and resources at your fingertips"
          >
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => navigate('/cv')}
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                }
              >
                Manage CV
              </Button>
              
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => navigate('/job-recommendations')}
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                }
              >
                Find Jobs
              </Button>
              
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => navigate('/learning-plan')}
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                }
              >
                Learning Resources
              </Button>
              
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => navigate('/skills-gap')}
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                }
              >
                Add New Skills
              </Button>
            </div>
          </DashboardCard>
        </div>
      </div>
      
      {/* Footer Information */}
      <div className="mt-8 text-right text-xs text-gray-400 dark:text-gray-500">
        Last updated: {last_updated || new Date().toLocaleString()}
      </div>
    </AppLayout>
  );
}