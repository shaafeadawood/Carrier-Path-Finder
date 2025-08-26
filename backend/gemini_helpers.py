import os
import google.generativeai as genai
from typing import Dict, Any, Optional, List
import json
import time

# Initialize Gemini API with key from environment
try:
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    if not GEMINI_API_KEY:
        print("WARNING: GEMINI_API_KEY environment variable not set.")
    else:
        genai.configure(api_key=GEMINI_API_KEY)
except Exception as e:
    print(f"Error initializing Gemini API: {e}")

async def parse_cv_with_gemini(cv_text: str) -> Dict[str, Any]:
    """
    Parse CV text using Google Gemini API to extract structured information
    
    Args:
        cv_text: The plain text extracted from a CV/resume document
        
    Returns:
        A dictionary containing parsed CV data including personal information,
        skills, education, work experience, etc.
    """
    try:
        # Check if API key is available
        if not GEMINI_API_KEY:
            print("Gemini API key not available, returning empty results")
            return {"error": "Gemini API key not configured"}
            
        # Set up the model
        model = genai.GenerativeModel('gemini-pro')
        
        # Create structured prompt for CV parsing
        prompt = f"""
        You are a professional CV/resume parser. Extract the following information from this CV text:
        
        {cv_text}
        
        Provide output in JSON format with the following structure:
        {{
            "personal_info": {{
                "name": "Extracted full name",
                "email": "Extracted email",
                "phone": "Extracted phone",
                "location": "Extracted location/address",
                "linkedin": "Extracted LinkedIn profile",
                "portfolio": "Extracted website/portfolio"
            }},
            "summary": "Professional summary/objective if present",
            "skills": ["Skill 1", "Skill 2", ...],
            "education": [
                {{
                    "degree": "Degree name",
                    "institution": "Institution name",
                    "location": "Institution location",
                    "date": "Completion date or range",
                    "details": ["Any notable achievements"]
                }}
            ],
            "work_experience": [
                {{
                    "position": "Job title",
                    "company": "Company name",
                    "location": "Company location",
                    "date": "Employment period",
                    "responsibilities": ["Responsibility 1", "Responsibility 2", ...]
                }}
            ],
            "projects": [
                {{
                    "name": "Project name",
                    "description": "Brief description",
                    "technologies": ["Technology 1", "Technology 2", ...],
                    "link": "Project link if available"
                }}
            ],
            "certifications": ["Certification 1", "Certification 2", ...],
            "languages": ["Language 1", "Language 2", ...],
            "interests": ["Interest 1", "Interest 2", ...]
        }}
        
        Only include fields where information is available. If some information is not present in the CV, skip those fields.
        """

        # Generate response
        response = model.generate_content(prompt)
        
        # Extract text response
        text_response = response.text
        
        # Try to parse the JSON response
        # Remove markdown code block indicators if present
        if "```json" in text_response:
            text_response = text_response.split("```json")[1].split("```")[0].strip()
        elif "```" in text_response:
            text_response = text_response.split("```")[1].strip()
            
        # Parse JSON
        parsed_data = json.loads(text_response)
        
        # Ensure skills is a list
        if "skills" in parsed_data and not isinstance(parsed_data["skills"], list):
            if isinstance(parsed_data["skills"], str):
                # Convert comma-separated string to list
                parsed_data["skills"] = [s.strip() for s in parsed_data["skills"].split(",")]
            else:
                parsed_data["skills"] = []
                
        return parsed_data
    
    except json.JSONDecodeError as e:
        print(f"Error parsing Gemini response as JSON: {e}")
        print(f"Raw response was: {text_response if 'text_response' in locals() else 'No response received'}")
        return {
            "error": "Failed to parse Gemini API response",
            "raw_response": text_response if 'text_response' in locals() else None
        }
    
    except Exception as e:
        print(f"Error using Gemini API: {e}")
        return {
            "error": f"Gemini API error: {str(e)}",
            "raw_response": text_response if 'text_response' in locals() else None
        }

async def generate_job_recommendations(profile_data: Dict[str, Any], count: int = 5) -> List[Dict[str, Any]]:
    """
    Generate job recommendations based on user profile data
    
    Args:
        profile_data: User profile data containing skills, experience, etc.
        count: Number of job recommendations to generate
        
    Returns:
        List of job recommendations
    """
    try:
        # Check if API key is available
        if not GEMINI_API_KEY:
            print("Gemini API key not available, returning sample data")
            return [
                {"title": "Software Developer", "company": "Tech Corp", "match_score": 95},
                {"title": "Web Developer", "company": "Digital Solutions", "match_score": 90},
                {"title": "Frontend Developer", "company": "UI Experts", "match_score": 85},
            ]
        
        # Set up the model
        model = genai.GenerativeModel('gemini-pro')
        
        # Extract skills and experience from profile
        skills = profile_data.get("skills", [])
        experience = profile_data.get("experience", "")
        education = profile_data.get("education", "")
        interests = profile_data.get("interests", "")
        
        # Create structured prompt
        prompt = f"""
        Based on this user's profile, recommend {count} suitable job positions:
        
        Skills: {", ".join(skills) if isinstance(skills, list) else skills}
        Experience: {experience}
        Education: {education}
        Interests: {interests}
        
        For each job, provide:
        1. Job title
        2. Company type that might offer this role
        3. Why it's a good match (2-3 sentences)
        4. Required skills they already have
        5. Skills they might need to develop
        6. Match score (a number between 0-100)
        
        Format the output as a JSON array:
        [
          {{
            "title": "Job Title",
            "company": "Type of Company",
            "description": "Why this job is a good match",
            "matching_skills": ["Skill1", "Skill2"],
            "skills_to_develop": ["Skill1", "Skill2"],
            "match_score": 85
          }},
          ...
        ]
        """
        
        # Generate response
        response = model.generate_content(prompt)
        
        # Extract and parse JSON
        text_response = response.text
        
        # Clean up the response to extract just the JSON
        if "```json" in text_response:
            text_response = text_response.split("```json")[1].split("```")[0].strip()
        elif "```" in text_response:
            text_response = text_response.split("```")[1].strip()
            
        # Parse JSON
        job_recommendations = json.loads(text_response)
        
        return job_recommendations
    
    except Exception as e:
        print(f"Error generating job recommendations: {e}")
        # Return fallback recommendations
        return [
            {
                "title": "Software Developer",
                "company": "Technology Company",
                "description": "Based on your programming skills and experience.",
                "matching_skills": skills[:3] if isinstance(skills, list) and len(skills) > 0 else ["Programming"],
                "skills_to_develop": ["System Design", "Cloud Technologies"],
                "match_score": 85
            },
            {
                "title": "Web Developer",
                "company": "Digital Agency",
                "description": "Your web development skills make you a good candidate.",
                "matching_skills": skills[1:4] if isinstance(skills, list) and len(skills) > 1 else ["Web Development"],
                "skills_to_develop": ["Advanced JavaScript Frameworks"],
                "match_score": 80
            }
        ]

async def generate_skills_gap_analysis(profile_data: Dict[str, Any], target_job: str) -> Dict[str, Any]:
    """
    Generate a skills gap analysis comparing the user's current skills with those required for a target job
    
    Args:
        profile_data: User profile data containing current skills
        target_job: The job title the user is targeting
        
    Returns:
        Dictionary with skills analysis information
    """
    try:
        # Check if API key is available
        if not GEMINI_API_KEY:
            print("Gemini API key not available, returning sample data")
            return {
                "target_job": target_job,
                "current_skills": profile_data.get("skills", [])[:5],
                "required_skills": ["JavaScript", "React", "Node.js", "MongoDB", "AWS"],
                "skills_gap": ["MongoDB", "AWS"],
                "recommended_learning": [
                    {"skill": "MongoDB", "resources": ["MongoDB University", "Practical MongoDB Course"]},
                    {"skill": "AWS", "resources": ["AWS Certified Developer", "Cloud Practitioner Essentials"]}
                ]
            }
            
        # Set up the model
        model = genai.GenerativeModel('gemini-pro')
        
        # Extract user skills
        user_skills = profile_data.get("skills", [])
        user_experience = profile_data.get("experience", "")
        
        # Create structured prompt
        prompt = f"""
        Perform a skills gap analysis for someone with these skills:
        
        Current skills: {", ".join(user_skills) if isinstance(user_skills, list) else user_skills}
        Experience: {user_experience}
        Target job: {target_job}
        
        Provide:
        1. Current relevant skills they have for this job
        2. Required skills for the target job
        3. Skills gap (required skills they don't have)
        4. Recommended learning resources for each missing skill
        
        Format as JSON:
        {{
          "target_job": "{target_job}",
          "current_skills": ["Skill1", "Skill2", ...],
          "required_skills": ["Skill1", "Skill2", ...],
          "skills_gap": ["Skill1", "Skill2", ...],
          "recommended_learning": [
            {{
              "skill": "Skill Name",
              "resources": ["Resource1", "Resource2", ...]
            }},
            ...
          ]
        }}
        """
        
        # Generate response
        response = model.generate_content(prompt)
        
        # Extract and parse JSON
        text_response = response.text
        
        # Clean up the response to extract just the JSON
        if "```json" in text_response:
            text_response = text_response.split("```json")[1].split("```")[0].strip()
        elif "```" in text_response:
            text_response = text_response.split("```")[1].strip()
            
        # Parse JSON
        analysis = json.loads(text_response)
        
        return analysis
    
    except Exception as e:
        print(f"Error generating skills gap analysis: {e}")
        # Return fallback analysis
        return {
            "target_job": target_job,
            "current_skills": user_skills if isinstance(user_skills, list) else [],
            "required_skills": ["Technical Skills", "Soft Skills", "Industry Knowledge"],
            "skills_gap": ["Advanced Technical Skills", "Industry-Specific Knowledge"],
            "recommended_learning": [
                {
                    "skill": "Technical Skills",
                    "resources": ["Online Courses", "Practice Projects", "Documentation"]
                },
                {
                    "skill": "Industry Knowledge",
                    "resources": ["Industry Publications", "Networking Events", "Professional Certifications"]
                }
            ],
            "error": str(e)
        }

async def generate_learning_roadmap(profile_data: Dict[str, Any], target_job: str) -> Dict[str, Any]:
    """
    Generate a personalized learning roadmap for achieving a target job position
    
    Args:
        profile_data: User profile data
        target_job: The job title the user is targeting
        
    Returns:
        Dictionary with roadmap information
    """
    try:
        # Check if API key is available
        if not GEMINI_API_KEY:
            print("Gemini API key not available, returning sample data")
            return {
                "target_job": target_job,
                "timeline_months": 6,
                "current_level": "Intermediate",
                "milestones": [
                    {
                        "title": "Foundation",
                        "description": "Build fundamental skills",
                        "duration_weeks": 4,
                        "tasks": [
                            {"name": "Complete online course", "status": "pending"},
                            {"name": "Build practice project", "status": "pending"}
                        ]
                    },
                    {
                        "title": "Specialization",
                        "description": "Develop specialized skills",
                        "duration_weeks": 8,
                        "tasks": [
                            {"name": "Complete advanced course", "status": "pending"},
                            {"name": "Contribute to open source", "status": "pending"}
                        ]
                    }
                ]
            }
            
        # Set up the model
        model = genai.GenerativeModel('gemini-pro')
        
        # Extract relevant user data
        user_skills = profile_data.get("skills", [])
        user_experience = profile_data.get("experience", "")
        user_education = profile_data.get("education", "")
        
        # Create structured prompt
        prompt = f"""
        Create a detailed learning roadmap for someone transitioning to a {target_job} role.
        
        Current profile:
        - Skills: {", ".join(user_skills) if isinstance(user_skills, list) else user_skills}
        - Experience: {user_experience}
        - Education: {user_education}
        
        The roadmap should include:
        1. Estimated timeline (in months)
        2. Assessment of current skill level
        3. 3-5 key milestones, each with:
           - Title and description
           - Duration (in weeks)
           - 2-4 specific learning tasks
        
        Format as JSON:
        {{
          "target_job": "{target_job}",
          "timeline_months": 6,
          "current_level": "Beginner/Intermediate/Advanced",
          "milestones": [
            {{
              "title": "Milestone Title",
              "description": "Short description",
              "duration_weeks": 4,
              "tasks": [
                {{"name": "Task description", "status": "pending"}},
                ...
              ]
            }},
            ...
          ]
        }}
        """
        
        # Generate response
        response = model.generate_content(prompt)
        
        # Extract and parse JSON
        text_response = response.text
        
        # Clean up the response to extract just the JSON
        if "```json" in text_response:
            text_response = text_response.split("```json")[1].split("```")[0].strip()
        elif "```" in text_response:
            text_response = text_response.split("```")[1].strip()
            
        # Parse JSON
        roadmap = json.loads(text_response)
        
        return roadmap
    
    except Exception as e:
        print(f"Error generating learning roadmap: {e}")
        # Return fallback roadmap
        return {
            "target_job": target_job,
            "timeline_months": 6,
            "current_level": "Intermediate",
            "milestones": [
                {
                    "title": "Skill Development",
                    "description": "Focus on core skills required for the role",
                    "duration_weeks": 8,
                    "tasks": [
                        {"name": "Identify key skills for the role", "status": "pending"},
                        {"name": "Complete relevant online courses", "status": "pending"},
                        {"name": "Practice with real-world projects", "status": "pending"}
                    ]
                },
                {
                    "title": "Professional Development",
                    "description": "Build professional network and credentials",
                    "duration_weeks": 8,
                    "tasks": [
                        {"name": "Update resume and LinkedIn profile", "status": "pending"},
                        {"name": "Attend industry events and webinars", "status": "pending"},
                        {"name": "Connect with professionals in the field", "status": "pending"}
                    ]
                },
                {
                    "title": "Job Application Preparation",
                    "description": "Prepare for job applications and interviews",
                    "duration_weeks": 8,
                    "tasks": [
                        {"name": "Research target companies", "status": "pending"},
                        {"name": "Practice interview questions", "status": "pending"},
                        {"name": "Prepare portfolio showcasing relevant skills", "status": "pending"}
                    ]
                }
            ],
            "error": str(e)
        }
