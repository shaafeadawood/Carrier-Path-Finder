
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { FadeIn } from '../components/animations';
import { useToast } from '../components/Toast';

export default function LearningPlanVisualizer({ plan, error, fetchLearningPlan, handleRoadmapGeneration, navigate, loading }) {
  const [activeTab, setActiveTab] = useState('roadmap');
  const showToast = useToast();

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  useEffect(() => {
    if (!loading && plan && plan.roadmap) {
      showToast('Learning plan loaded!', 'success');
    }
  }, [loading, plan, showToast]);


  if (loading) {
    return (
      <FadeIn>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600 dark:text-gray-300">Generating your learning plan...</p>
          </div>
        </div>
      </FadeIn>
    );
  }

  if (!plan || !plan.roadmap) {
    return (
      <FadeIn>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Learning Plan</h1>
            <Card>
              <div className="text-center p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">No Learning Plan Available</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">You don't have a learning plan yet. Generate one based on your profile and career goals.</p>
                <button onClick={async () => {
                  showToast('Generating your learning plan...', 'info');
                  await handleRoadmapGeneration();
                }} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Generate My Learning Plan</button>
              </div>
            </Card>
          </div>
        </div>
      </FadeIn>
    );
  }

  const roadmap = plan.roadmap;
  return (
    <FadeIn>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Learning Plan</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {roadmap.target_career_path?.title ? `Career path: ${roadmap.target_career_path.title}` : 'Your personalized roadmap to success'}
          </p>
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex space-x-8" aria-label="Learning Plan Tabs">
              <button onClick={() => setActiveTab('roadmap')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'roadmap' ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>Roadmap</button>
              <button onClick={() => setActiveTab('resources')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'resources' ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>Learning Resources</button>
              <button onClick={() => setActiveTab('tracker')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tracker' ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>Progress Tracker</button>
            </nav>
          </div>
          {/* Progress Bar and Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{roadmap.roadmap_summary}</h2>
              <div className="flex items-center">
                <div className="w-full md:w-64 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${roadmap.progress?.percentage || 0}%` }}></div>
                </div>
                <span>{roadmap.progress?.percentage || 0}% Complete</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => fetchLearningPlan(true)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center">Refresh</button>
              <button onClick={async () => {
                showToast('Generating a new roadmap...', 'info');
                await handleRoadmapGeneration();
              }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Generate New Plan</button>
            </div>
          </div>
          {/* Tab Content */}
          {activeTab === 'resources' && (
            <div className="space-y-8 mt-8">{/* ...resources tab content... */}</div>
          )}
          {activeTab === 'tracker' && (
            <div className="space-y-8 mt-8">{/* ...tracker tab content... */}</div>
          )}
          {activeTab === 'roadmap' && (
            <div className="space-y-8 mt-8">{/* ...roadmap tab content... */}</div>
          )}
          <div className="mt-8 text-center">
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition inline-flex items-center">Back to Dashboard</button>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}