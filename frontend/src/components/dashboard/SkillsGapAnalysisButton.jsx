import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import Button from '../Button';

/**
 * Button component for analyzing skills gap compared to job requirements
 */
const SkillsGapAnalysisButton = ({ email }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const analyzeSkillsGap = async () => {
    console.log("Analyzing skills gap with email:", email);
    
    // Double check authentication via Supabase
    const { data } = await supabase.auth.getSession();
    if (!data?.session) {
      console.log("No active session found, redirecting to login");
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the backend API to get skills gap analysis
      const response = await fetch(`http://127.0.0.1:8000/api/analyze/skills-gap?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to analyze skills gap: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.analysis) {
        // Store the analysis in localStorage to display it
        localStorage.setItem('skillsGapAnalysis', JSON.stringify(result.analysis));
        
        // Navigate to skills gap page
        setTimeout(() => {
          navigate('/skills-gap');
        }, 1000);
      } else if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error analyzing skills gap:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      onClick={analyzeSkillsGap}
      disabled={isLoading}
      isLoading={isLoading}
      variant="secondary"
      size="md"
      fullWidth
      leftIcon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
    >
      Analyze Skills Gap
    </Button>
  );
};

SkillsGapAnalysisButton.propTypes = {
  email: PropTypes.string
};

export default SkillsGapAnalysisButton;