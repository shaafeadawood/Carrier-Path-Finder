"""
Job Recommendation Module

This module provides functions for recommending jobs based on user profiles and skills.
"""

from typing import Dict, Any, List, Optional

# Sample job data for use in recommendations and gap analysis
SAMPLE_JOBS = [
    {
        "id": "job-1",
        "title": "Senior Software Engineer",
        "company": "Tech Innovations Inc.",
        "location": "Remote",
        "salary_range": "$120,000 - $150,000",
        "required_skills": ["Python", "React", "FastAPI", "Cloud Computing", "System Design", "CI/CD"],
        "description": "Looking for a senior software engineer to build scalable web applications.",
        "requirements": "5+ years experience in full-stack development, Python expertise.",
        "application_url": "https://example.com/apply/job-1"
    },
    {
        "id": "job-2",
        "title": "Full Stack Developer",
        "company": "Digital Solutions Co.",
        "location": "New York, NY (Hybrid)",
        "salary_range": "$100,000 - $130,000",
        "required_skills": ["JavaScript", "React", "Node.js", "MongoDB", "Git", "REST APIs"],
        "description": "Join our team to develop innovative web solutions for enterprise clients.",
        "requirements": "3+ years experience in JavaScript development.",
        "application_url": "https://example.com/apply/job-2"
    },
    {
        "id": "job-3",
        "title": "Machine Learning Engineer",
        "company": "AI Research Labs",
        "location": "San Francisco, CA",
        "salary_range": "$140,000 - $180,000",
        "required_skills": ["Python", "TensorFlow", "PyTorch", "Data Science", "Statistics", "Computer Vision"],
        "description": "Work on cutting-edge ML models for our AI platform.",
        "requirements": "MS/PhD in Computer Science or related field, experience with ML frameworks.",
        "application_url": "https://example.com/apply/job-3"
    }
]

def get_job_recommendations(user_profile: Dict[str, Any], limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get job recommendations for a user based on their profile.
    
    Args:
        user_profile: The user's profile data containing skills and preferences
        limit: Maximum number of recommendations to return
        
    Returns:
        List of job recommendation objects
    """
    # Extract user skills
    user_skills = user_profile.get("skills", [])
    if isinstance(user_skills, str):
        user_skills = [s.strip() for s in user_skills.split(',')]
    
    # Normalize user skills to lowercase for better matching
    user_skills_lower = [s.lower() for s in user_skills]
    
    # Calculate match percentage for each job
    job_matches = []
    for job in SAMPLE_JOBS:
        # Extract required skills
        required_skills = job.get("required_skills", [])
        required_skills_lower = [s.lower() for s in required_skills]
        
        # Find matching skills
        matching_skills = []
        for skill in required_skills:
            if skill.lower() in user_skills_lower or any(skill.lower() in us for us in user_skills_lower):
                matching_skills.append(skill)
        
        # Calculate match percentage
        total_required = len(required_skills)
        if total_required > 0:
            match_percentage = (len(matching_skills) / total_required) * 100
        else:
            match_percentage = 0
        
        # Create job recommendation object
        job_recommendation = {
            "id": job["id"],
            "title": job["title"],
            "company": job["company"],
            "location": job["location"],
            "salary_range": job["salary_range"],
            "match_percentage": round(match_percentage, 1),
            "skills_match": matching_skills,
            "description": job["description"],
            "requirements": job["requirements"],
            "application_url": job["application_url"]
        }
        
        job_matches.append(job_recommendation)
    
    # Sort by match percentage (highest first)
    job_matches.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    # Return limited number of recommendations
    return job_matches[:limit]
