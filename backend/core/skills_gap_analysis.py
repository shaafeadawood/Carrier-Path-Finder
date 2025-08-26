"""
Skills Gap Analysis Module

This module analyzes the gap between a user's skills and the skills required for specific jobs.
It integrates with LangGraph workflow for enhanced AI-powered analysis.
"""

import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from backend.core.job_recommendation import SAMPLE_JOBS

# Import Gemini for enhanced analysis
try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        GEMINI_AVAILABLE = True
    else:
        GEMINI_AVAILABLE = False
except ImportError:
    GEMINI_AVAILABLE = False

async def analyze_skills_gap_with_ai(user_profile: Dict[str, Any], target_role: str = None) -> Dict[str, Any]:
    """
    Analyze skills gap using AI (Gemini) for enhanced insights.
    
    Args:
        user_profile: User profile data
        target_role: Optional target role to analyze for
    
    Returns:
        AI-enhanced skills gap analysis
    """
    if not GEMINI_AVAILABLE:
        # Fall back to traditional analysis if Gemini is not available
        return analyze_skills_gap(user_profile, job_id=None)
    
    try:
        # Extract skills and other relevant info from profile
        user_skills = user_profile.get('skills', [])
        work_experience = user_profile.get('work_experience', [])
        education = user_profile.get('education', [])
        
        # Format experience and education for the prompt
        exp_text = "\n".join([f"{exp.get('position', 'Position')} at {exp.get('company', 'Company')}" 
                            for exp in work_experience[:3]])
        edu_text = "\n".join([f"{edu.get('degree', 'Degree')} from {edu.get('institution', 'Institution')}" 
                            for edu in education[:2]])
        
        # Create a detailed prompt for Gemini
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""
        Perform a detailed skills gap analysis for a professional with the following profile:
        
        Skills: {user_skills}
        
        Work Experience:
        {exp_text}
        
        Education:
        {edu_text}
        
        {f'Target Role: {target_role}' if target_role else 'Analyze general career growth opportunities'}
        
        Provide a detailed skills analysis in JSON format with these sections:
        1. "current_skill_level": Professional's current level (Junior, Mid, Senior, etc.)
        2. "strengths": Array of skills that are strengths
        3. "gaps": Array of skills that should be developed
        4. "recommendations": Array of actionable recommendations to improve skills
        5. "learning_resources": Array of specific learning resources (courses, books, etc.)
        6. "career_paths": Suitable career paths based on current skills
        7. "estimated_timeline": Estimated timeline (in months) to bridge the gaps
        
        Return ONLY valid JSON.
        """
        
        response = await model.generate_content_async(prompt)
        
        try:
            # Extract JSON from response
            import re
            text = response.text
            
            # Find JSON pattern in response
            json_match = re.search(r'```json\n(.*?)\n```', text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                json_str = text
            
            # Clean up any non-JSON text
            json_str = re.sub(r'^[^{]*', '', json_str)
            json_str = re.sub(r'[^}]*$', '', json_str)
            
            analysis = json.loads(json_str)
            
            # Add user's original skills to the response
            analysis["user_skills"] = user_skills
            analysis["ai_powered"] = True
            
            return analysis
            
        except Exception as e:
            print(f"Failed to parse JSON from AI skills analysis: {e}")
            # Fall back to traditional analysis
            return analyze_skills_gap(user_profile, job_id=None)
            
    except Exception as e:
        print(f"Error in AI skills gap analysis: {e}")
        # Fall back to traditional analysis
        return analyze_skills_gap(user_profile, job_id=None)


def analyze_skills_gap(user_profile: Dict[str, Any], job_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyze the skills gap between a user's profile and a job
    
    Args:
        user_profile: User profile data
        job_id: Optional job ID to analyze skills gap for
    
    Returns:
        Skills gap analysis data
    """
    # Get user skills
    user_skills = user_profile.get('skills', [])
    
    # If job_id is provided, analyze gap for that specific job
    if job_id:
        job = next((j for j in SAMPLE_JOBS if j['id'] == job_id), None)
        if not job:
            return {"error": "Job not found"}
        
        return analyze_job_skills_gap(user_skills, job)
    
    # If no job_id, analyze gaps for all jobs
    all_gaps = []
    for job in SAMPLE_JOBS:
        gap_analysis = analyze_job_skills_gap(user_skills, job)
        all_gaps.append(gap_analysis)
    
    # Sort by match score
    sorted_gaps = sorted(all_gaps, key=lambda x: x['match_score'], reverse=True)
    
    # Determine general skill level based on matched skills
    if len(user_skills) < 3:
        skill_level = "Beginner"
    elif len(user_skills) < 7:
        skill_level = "Intermediate"
    else:
        skill_level = "Advanced"
    
    # Identify common missing skills across top jobs
    common_missing_skills = []
    if sorted_gaps:
        # Get missing skills from top 3 jobs
        top_jobs = sorted_gaps[:3] if len(sorted_gaps) >= 3 else sorted_gaps
        all_missing = [skill for job in top_jobs for skill in job['missing_skills']]
        
        # Count occurrences
        from collections import Counter
        skill_counts = Counter(all_missing)
        
        # Skills missing in at least 2 jobs
        common_missing_skills = [skill for skill, count in skill_counts.items() if count >= 2]
    
    return {
        "skills_gaps": sorted_gaps,
        "user_skills": user_skills,
        "total_jobs_analyzed": len(sorted_gaps),
        "current_skill_level": skill_level,
        "common_missing_skills": common_missing_skills,
        "ai_powered": False
    }

def analyze_job_skills_gap(user_skills: List[str], job: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze skills gap for a specific job
    
    Args:
        user_skills: List of user skills
        job: Job data
    
    Returns:
        Skills gap analysis for the job
    """
    job_skills = job['skills']
    
    # Find matching and missing skills
    matching_skills = [skill for skill in user_skills if any(skill.lower() in js.lower() for js in job_skills)]
    missing_skills = [skill for skill in job_skills if not any(us.lower() in skill.lower() for us in user_skills)]
    
    # Calculate match score
    match_score = len(matching_skills) / max(len(job_skills), 1)
    
    # Generate learning recommendations for missing skills
    learning_recommendations = []
    for skill in missing_skills:
        learning_recommendations.append({
            "skill": skill,
            "resources": [
                {"type": "course", "name": f"Complete {skill} Course", "platform": "Udemy"},
                {"type": "tutorial", "name": f"{skill} for Beginners", "platform": "YouTube"},
                {"type": "documentation", "name": f"Official {skill} Docs", "platform": "Official Website"}
            ]
        })
    
    return {
        "job_id": job['id'],
        "job_title": job['title'],
        "company": job['company'],
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "match_score": round(match_score, 2),
        "learning_recommendations": learning_recommendations
    }