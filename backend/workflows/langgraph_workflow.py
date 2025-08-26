"""
LangGraph Workflow for Career Path Finder

This module implements a multi-step workflow using LangGraph for:
1. CV parsing
2. Skills analysis
3. Career path recommendations
4. Roadmap generation

The workflow orchestrates calls to Google's Gemini API to provide
sophisticated AI-powered career guidance.
"""

from typing import Dict, Any, List, TypedDict, Annotated, Optional
import os
import dotenv
from enum import Enum
import google.generativeai as genai
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langgraph.graph import StateGraph, END

# Configure Gemini API
import dotenv
dotenv.load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables")
else:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini API configured successfully")


# Define workflow states
class WorkflowState(TypedDict):
    """State maintained throughout the workflow execution."""
    # Input data
    raw_cv: Optional[str]
    user_input: Optional[Dict[str, Any]]
    
    # Intermediate results
    parsed_profile: Optional[Dict[str, Any]]
    skills_analysis: Optional[Dict[str, Any]]
    career_recommendations: Optional[List[Dict[str, Any]]]
    
    # Final output
    roadmap: Optional[Dict[str, Any]]
    
    # Metadata and flow control
    error: Optional[str]
    current_step: str


# Define the nodes for the graph
async def parse_cv_node(state: WorkflowState) -> Dict:
    """Parse CV text into a structured profile using Gemini API."""
    try:
        if not state.get("raw_cv"):
            return {
                "current_step": "skills_analysis",
                "parsed_profile": state.get("user_input", {})
            }
        
        # If we have a raw CV, parse it with Gemini
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""
        Extract structured information from the following CV.
        Return ONLY a valid JSON object with these fields:
        - name: The person's full name
        - email: Email address
        - phone: Phone number
        - education: Array of education entries, each with institution, degree, and year
        - work_experience: Array of work experience entries, each with company, position, duration, and description
        - skills: Array of technical and soft skills
        - projects: Array of projects with name and description
        - interests: Array of personal interests/hobbies

        CV TEXT:
        {state['raw_cv']}
        """

        response = await model.generate_content_async(prompt)
        
        try:
            # Try to extract JSON from the response
            import json
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
            
            parsed_profile = json.loads(json_str)
            
            # Return the updated state
            return {
                "parsed_profile": parsed_profile,
                "current_step": "skills_analysis"
            }
            
        except Exception as e:
            print(f"Failed to parse JSON from Gemini response: {e}")
            # Fallback to basic parsing
            from core.ai_helpers import parse_cv_text
            parsed_profile = await parse_cv_text(state['raw_cv'])
            return {
                "parsed_profile": parsed_profile,
                "current_step": "skills_analysis"
            }
            
    except Exception as e:
        print(f"Error in parse_cv_node: {e}")
        return {
            "error": f"Failed to parse CV: {str(e)}",
            "current_step": "end"
        }


async def skills_analysis_node(state: WorkflowState) -> Dict:
    """Analyze skills and identify gaps based on career goals."""
    try:
        profile = state.get("parsed_profile", {})
        if not profile:
            return {
                "error": "No profile data available for skills analysis",
                "current_step": "end"
            }
        
        # Get user's career goal if available
        career_goal = profile.get("career_goal", "")
        current_skills = profile.get("skills", [])
        
        # Use Gemini to analyze skills and gaps
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""
        Analyze the skills of a professional with the following profile:
        
        Current Skills: {current_skills}
        Career Goal: {career_goal if career_goal else "Not specified"}
        
        Provide a detailed skills analysis in JSON format with these fields:
        - current_skill_level: A description of the current skill level (e.g., "Junior", "Mid-level", "Senior")
        - strengths: Array of skills that are strengths
        - gaps: Array of skills that should be developed to reach career goals
        - recommendations: Array of specific recommendations to improve skills
        - relevant_industries: Array of industries where these skills are valuable
        
        Return ONLY valid JSON.
        """

        response = await model.generate_content_async(prompt)
        
        try:
            # Try to extract JSON from the response
            import json
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
            
            skills_analysis = json.loads(json_str)
            
            # Return the updated state
            return {
                "skills_analysis": skills_analysis,
                "current_step": "career_recommendations"
            }
            
        except Exception as e:
            print(f"Failed to parse JSON from skills analysis: {e}")
            # Provide a fallback analysis
            skills_analysis = {
                "current_skill_level": "Could not determine",
                "strengths": current_skills[:3] if len(current_skills) >= 3 else current_skills,
                "gaps": ["Communication skills", "Project management", "Data analysis"],
                "recommendations": ["Take online courses in identified gap areas", "Work on personal projects", "Join professional communities"],
                "relevant_industries": ["Technology", "Finance", "Healthcare"]
            }
            
            return {
                "skills_analysis": skills_analysis,
                "current_step": "career_recommendations"
            }
            
    except Exception as e:
        print(f"Error in skills_analysis_node: {e}")
        return {
            "error": f"Failed to analyze skills: {str(e)}",
            "current_step": "end"
        }


async def career_recommendations_node(state: WorkflowState) -> Dict:
    """Generate career path recommendations based on profile and skills analysis."""
    try:
        profile = state.get("parsed_profile", {})
        skills_analysis = state.get("skills_analysis", {})
        
        if not profile:
            return {
                "error": "No profile data available for career recommendations",
                "current_step": "end"
            }
        
        # Extract relevant information
        current_skills = profile.get("skills", [])
        strengths = skills_analysis.get("strengths", [])
        gaps = skills_analysis.get("gaps", [])
        current_level = skills_analysis.get("current_skill_level", "Not determined")
        
        # Use Gemini to generate career recommendations
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""
        Based on the following profile, recommend 3-5 potential career paths:
        
        Current Skills: {current_skills}
        Strengths: {strengths}
        Skill Gaps: {gaps}
        Current Level: {current_level}
        
        For each career path, provide:
        - title: The career path title
        - description: Short description of this career path
        - required_skills: Skills needed for this path
        - matching_skills: Skills the candidate already has that match
        - missing_skills: Skills the candidate needs to develop
        - growth_potential: Description of growth opportunities
        - timeline: Estimated timeline to achieve career progression (in months)
        - next_steps: Immediate actions to take
        
        Return the recommendations as a JSON array. ONLY return valid JSON.
        """

        response = await model.generate_content_async(prompt)
        
        try:
            # Try to extract JSON from the response
            import json
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
            
            # Make sure it's wrapped in square brackets if not already
            if not json_str.strip().startswith('['):
                json_str = f"[{json_str}]"
            
            career_recommendations = json.loads(json_str)
            
            # Return the updated state
            return {
                "career_recommendations": career_recommendations,
                "current_step": "roadmap_generation"
            }
            
        except Exception as e:
            print(f"Failed to parse JSON from career recommendations: {e}")
            # Provide fallback recommendations
            from backend.core.career_path_progression import get_career_path_recommendations
            career_recommendations = get_career_path_recommendations(profile, limit=3)
            
            return {
                "career_recommendations": career_recommendations,
                "current_step": "roadmap_generation"
            }
            
    except Exception as e:
        print(f"Error in career_recommendations_node: {e}")
        return {
            "error": f"Failed to generate career recommendations: {str(e)}",
            "current_step": "end"
        }


async def roadmap_generation_node(state: WorkflowState) -> Dict:
    """Generate a detailed career roadmap with learning plan."""
    try:
        profile = state.get("parsed_profile", {})
        skills_analysis = state.get("skills_analysis", {})
        career_recommendations = state.get("career_recommendations", [])
        
        if not profile or not skills_analysis or not career_recommendations:
            return {
                "error": "Insufficient data to generate roadmap",
                "current_step": "end"
            }
        
        # Select the top career path (first in the list)
        top_career_path = career_recommendations[0] if career_recommendations else {}
        
        # Use Gemini to generate a detailed roadmap
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""
        Create a detailed career development roadmap for a professional with the following profile:
        
        Current Skills: {profile.get('skills', [])}
        Strengths: {skills_analysis.get('strengths', [])}
        Skill Gaps: {skills_analysis.get('gaps', [])}
        Target Career Path: {top_career_path.get('title', 'Not specified')}
        
        Generate a comprehensive roadmap with the following structure:
        
        1. roadmap_summary: Brief overview of the roadmap
        
        2. milestones: Array of milestone objects, each containing:
           - title: Milestone name
           - description: What this milestone involves
           - timeline: Timeframe to achieve (in weeks)
           - required_skills: Skills needed for this milestone
           - resources: Suggested learning resources (courses, books, etc.)
        
        3. learning_plan: Object containing:
           - courses: Array of recommended courses
           - projects: Array of suggested projects to build skills
           - certifications: Array of relevant certifications to pursue
           
        4. progress_tracking: Object containing:
           - key_performance_indicators: Array of KPIs to track progress
           - checkpoints: Array of checkpoint objects with title and timeline
           
        5. mentorship: Suggestions for finding mentorship and networking
        
        Return ONLY valid JSON with these sections. The JSON should be properly formatted.
        """

        response = await model.generate_content_async(prompt)
        
        try:
            # Try to extract JSON from the response
            import json
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
            
            roadmap = json.loads(json_str)
            
            # Add target career path to the roadmap
            roadmap["target_career_path"] = top_career_path
            
            # Add all career recommendations
            roadmap["career_recommendations"] = career_recommendations
            
            # Add skills analysis
            roadmap["skills_analysis"] = skills_analysis
            
            # Add some gamification elements
            roadmap["gamification"] = {
                "xp_points": 0,
                "level": 1,
                "badges": [],
                "streak": 0,
                "achievements": []
            }
            
            # Add kanban board structure
            roadmap["kanban"] = {
                "backlog": [m["title"] for m in roadmap.get("milestones", [])[:3]],
                "in_progress": [],
                "done": []
            }
            
            # Add progress tracking
            roadmap["progress"] = {
                "percentage": 0,
                "milestones_completed": 0,
                "total_milestones": len(roadmap.get("milestones", []))
            }
            
            # Return the updated state with the roadmap
            return {
                "roadmap": roadmap,
                "current_step": "end"
            }
            
        except Exception as e:
            print(f"Failed to parse JSON from roadmap generation: {e}")
            # Provide a fallback roadmap
            roadmap = {
                "roadmap_summary": "Career development plan based on your profile",
                "milestones": [
                    {
                        "title": "Build foundation skills",
                        "description": "Focus on core skills development",
                        "timeline": "4 weeks",
                        "required_skills": skills_analysis.get("gaps", [])[:3],
                        "resources": ["Online courses", "Practice projects", "Books"]
                    },
                    {
                        "title": "Create portfolio projects",
                        "description": "Build projects to demonstrate your skills",
                        "timeline": "8 weeks",
                        "required_skills": profile.get("skills", [])[:3],
                        "resources": ["GitHub", "Personal website", "Project tutorials"]
                    }
                ],
                "learning_plan": {
                    "courses": ["Fundamentals course", "Advanced topics", "Specialized skills"],
                    "projects": ["Personal portfolio", "Collaborative project", "Open source contribution"],
                    "certifications": ["Industry certification", "Platform-specific certification"]
                },
                "progress_tracking": {
                    "key_performance_indicators": ["Skills mastered", "Projects completed", "Job applications"],
                    "checkpoints": [
                        {"title": "Initial progress review", "timeline": "4 weeks"},
                        {"title": "Mid-point assessment", "timeline": "12 weeks"}
                    ]
                },
                "mentorship": "Seek mentorship through professional networks and online communities",
                "target_career_path": top_career_path,
                "career_recommendations": career_recommendations,
                "skills_analysis": skills_analysis,
                "gamification": {
                    "xp_points": 0,
                    "level": 1,
                    "badges": [],
                    "streak": 0,
                    "achievements": []
                },
                "kanban": {
                    "backlog": ["Build foundation skills", "Create portfolio projects"],
                    "in_progress": [],
                    "done": []
                },
                "progress": {
                    "percentage": 0,
                    "milestones_completed": 0,
                    "total_milestones": 2
                }
            }
            
            return {
                "roadmap": roadmap,
                "current_step": "end"
            }
            
    except Exception as e:
        print(f"Error in roadmap_generation_node: {e}")
        return {
            "error": f"Failed to generate roadmap: {str(e)}",
            "current_step": "end"
        }


# Create the workflow graph
def create_career_path_workflow() -> StateGraph:
    """Create and return the LangGraph workflow for career path finding."""
    
    # Create a new graph
    workflow = StateGraph(WorkflowState)
    
    # Add nodes to the graph
    workflow.add_node("parse_cv", parse_cv_node)
    workflow.add_node("skills_analysis", skills_analysis_node)
    workflow.add_node("career_recommendations", career_recommendations_node)
    workflow.add_node("roadmap_generation", roadmap_generation_node)
    
    # Define the edges - the flow between nodes
    workflow.add_edge("parse_cv", "skills_analysis")
    workflow.add_edge("skills_analysis", "career_recommendations")
    workflow.add_edge("career_recommendations", "roadmap_generation")
    workflow.add_edge("roadmap_generation", END)
    
    # Add conditional edges for error handling
    workflow.add_conditional_edges(
        "parse_cv",
        lambda state: "end" if state.get("error") else "skills_analysis"
    )
    
    workflow.add_conditional_edges(
        "skills_analysis",
        lambda state: "end" if state.get("error") else "career_recommendations"
    )
    
    workflow.add_conditional_edges(
        "career_recommendations",
        lambda state: "end" if state.get("error") else "roadmap_generation"
    )
    
    # Set the entry point
    workflow.set_entry_point("parse_cv")
    
    # Compile the graph
    return workflow.compile()


# Example usage
async def run_workflow_with_cv(cv_text: str) -> Dict[str, Any]:
    """Run the workflow with a CV text input."""
    workflow = create_career_path_workflow()
    
    # Initialize the state
    initial_state = WorkflowState(
        raw_cv=cv_text,
        user_input=None,
        parsed_profile=None,
        skills_analysis=None,
        career_recommendations=None,
        roadmap=None,
        error=None,
        current_step="parse_cv"
    )
    
    # Execute the workflow
    result = await workflow.ainvoke(initial_state)
    return result


async def run_workflow_with_profile(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Run the workflow with a manually entered profile."""
    workflow = create_career_path_workflow()
    
    # Initialize the state
    initial_state = WorkflowState(
        raw_cv=None,
        user_input=profile_data,
        parsed_profile=None,
        skills_analysis=None,
        career_recommendations=None,
        roadmap=None,
        error=None,
        current_step="parse_cv"
    )
    
    # Execute the workflow
    result = await workflow.ainvoke(initial_state)
    return result