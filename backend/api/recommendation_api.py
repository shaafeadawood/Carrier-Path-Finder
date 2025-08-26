"""
Recommendation API routes for Career Path Finder

This module handles all job and career recommendation endpoints.
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

# Import job recommendation module
from backend.core.job_recommendation import get_job_recommendations
from backend.core.career_path_progression import get_career_path_recommendations
from backend.core.skills_gap_analysis import analyze_skills_gap

# Import LangGraph workflow
from workflows.langgraph_workflow import run_workflow_with_cv, run_workflow_with_profile

# Define the recommendation router
recommendation_router = APIRouter()

class RecommendationRequest(BaseModel):
    """Request model for recommendations"""
    user_profile: Dict[str, Any]
    limit: Optional[int] = 10
    filters: Optional[Dict[str, Any]] = {}

# Add routes to FastAPI app
def add_recommendation_routes(app):
    """Add recommendation routes to the main FastAPI app"""
    
    @app.post("/api/roadmap/generate")
    async def generate_roadmap(profile_data: Dict[str, Any]):
        """
        Generate a comprehensive career roadmap using LangGraph workflow.
        Takes profile data and returns a detailed roadmap with skills analysis,
        career recommendations, and learning plan.
        """
        try:
            # Run the LangGraph workflow with profile data
            result = await run_workflow_with_profile(profile_data)
            
            if "error" in result and result["error"]:
                return {"status": "error", "message": result["error"]}
            
            # Store results in database if user_id is provided
            user_id = profile_data.get("user_id")
            if user_id:
                from main import supabase
                roadmap_data = result.get("roadmap", {})
                
                # Check if user already has a roadmap
                existing_roadmap = supabase.table("roadmaps").select("*").eq("user_id", user_id).execute()
                
                if existing_roadmap.data and len(existing_roadmap.data) > 0:
                    # Update existing roadmap
                    supabase.table("roadmaps").update({
                        "roadmap_data": roadmap_data,
                        "updated_at": "now()"
                    }).eq("user_id", user_id).execute()
                else:
                    # Insert new roadmap
                    supabase.table("roadmaps").insert({
                        "user_id": user_id,
                        "roadmap_data": roadmap_data
                    }).execute()
            
            return {
                "status": "success",
                "roadmap": result.get("roadmap", {}),
                "skills_analysis": result.get("skills_analysis", {}),
                "career_recommendations": result.get("career_recommendations", [])
            }
            
        except Exception as e:
            print(f"Error generating roadmap: {e}")
            return {"status": "error", "message": str(e)}
    
    @app.get("/api/recommendations/jobs")
    async def get_jobs(email: str, limit: int = 10):
        """Get job recommendations for a user"""
        try:
            # Get user profile from Supabase
            from main import supabase
            user_result = supabase.table("users").select("*").eq("email", email).execute()
            user = None
            if user_result.data and len(user_result.data) > 0:
                user = user_result.data[0]
            if not user:
                return {"error": "User not found"}
            
            # Get recommendations
            recommendations = get_job_recommendations(user["profile_data"], limit=limit)
            return {"recommendations": recommendations}
        except Exception as e:
            print(f"Error getting job recommendations: {e}")
            return {"error": str(e)}
    
    @app.get("/api/recommendations/career-paths")
    async def get_career_paths(email: str, limit: int = 5):
        """Get career path recommendations for a user"""
        try:
            # Get user profile from Supabase
            from main import supabase
            user_result = supabase.table("users").select("*").eq("email", email).execute()
            user = None
            if user_result.data and len(user_result.data) > 0:
                user = user_result.data[0]
            if not user:
                return {"error": "User not found"}
            
            # Get recommendations
            recommendations = get_career_path_recommendations(user["profile_data"], limit=limit)
            return {"recommendations": recommendations}
        except Exception as e:
            print(f"Error getting career path recommendations: {e}")
            return {"error": str(e)}
    
    @app.get("/api/skills-gap")
    async def get_skills_gap(email: str, job_id: Optional[str] = None):
        """Get skills gap analysis for a user and optional job"""
        try:
            # Get user profile from Supabase
            from main import supabase
            user_result = supabase.table("users").select("*").eq("email", email).execute()
            user = None
            if user_result.data and len(user_result.data) > 0:
                user = user_result.data[0]
            if not user:
                return {"error": "User not found"}
            
            # Get skills gap analysis
            gap_analysis = analyze_skills_gap(user["profile_data"], job_id)
            return gap_analysis
        except Exception as e:
            print(f"Error analyzing skills gap: {e}")
            return {"error": str(e)}