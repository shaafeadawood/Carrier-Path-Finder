
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../contexts/useUserProfile';
import LearningPlanVisualizer from '../components/LearningPlanVisualizer';

const LearningPlanPage = () => {
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useUserProfile();
  const navigate = useNavigate();

  // Fetch the learning plan from backend
  const fetchLearningPlan = useCallback(async (force = false) => {
    if (!userProfile || !userProfile.email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/roadmap?email=${encodeURIComponent(userProfile.email)}${force ? '&force=1' : ''}`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to fetch learning plan');
      }
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Generate a new roadmap
  const handleRoadmapGeneration = useCallback(async () => {
    if (!userProfile || !userProfile.email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userProfile.email })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to generate roadmap');
      }
      await fetchLearningPlan(true);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userProfile, fetchLearningPlan]);

  useEffect(() => {
    if (userProfile && userProfile.email) {
      fetchLearningPlan();
    }
  }, [userProfile, fetchLearningPlan]);

  return (
    <LearningPlanVisualizer
      plan={plan}
      error={error}
      fetchLearningPlan={fetchLearningPlan}
      handleRoadmapGeneration={handleRoadmapGeneration}
      navigate={navigate}
      loading={loading}
    />
  );
};

export default LearningPlanPage;
