"""
Roadmap API routes for Career Path Finder

This module handles all learning plan and career roadmap endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from pydantic import BaseModel
import json

# Define the roadmap router
roadmap_router = APIRouter()

# Import LangGraph workflow
from workflows.langgraph_workflow import run_workflow_with_profile

class RoadmapUpdateRequest(BaseModel):
    """Request model for updating a roadmap"""
    email: str
    roadmap_data: Dict[str, Any]

def add_roadmap_routes(app):
    """Add roadmap routes to the main FastAPI app"""
    
    @app.get("/api/roadmap")
    async def get_roadmap(email: str, refresh: bool = False):
        """
        Get the learning roadmap for a user.
        Returns the stored roadmap from the database unless refresh is requested.
        """
        try:
            # Get user profile from Supabase
            from main import supabase
            user_result = supabase.table("users").select("*").eq("email", email).execute()
            user = None
            if user_result.data and len(user_result.data) > 0:
                user = user_result.data[0]
            if not user:
                return {"error": "User not found"}
            
            # Get roadmap from Supabase
            roadmap_result = supabase.table("roadmaps").select("*").eq("user_id", user["id"]).execute()
            
            # If refresh is requested or no roadmap exists, generate a new one
            if refresh or not roadmap_result.data:
                # Generate new roadmap
                return await generate_new_roadmap(user)
            
            # Return existing roadmap
            if roadmap_result.data and len(roadmap_result.data) > 0:
                roadmap_data = roadmap_result.data[0].get("roadmap_data", {})
                return {"roadmap": roadmap_data}
            else:
                # No roadmap found, generate one
                return await generate_new_roadmap(user)
                
        except Exception as e:
            print(f"Error getting roadmap: {e}")
            return {"error": str(e)}
    
    @app.get("/api/roadmap/job/{job_id}")
    async def get_job_specific_roadmap(job_id: str, email: str):
        """
        Get a job-specific learning roadmap.
        This generates a roadmap tailored for a specific job role.
        """
        try:
            # Get user profile
            from main import supabase
            user_result = supabase.table("users").select("*").eq("email", email).execute()
            user = None
            if user_result.data and len(user_result.data) > 0:
                user = user_result.data[0]
            if not user:
                return {"error": "User not found"}
            
            # Get job details
            job_result = supabase.table("job_listings").select("*").eq("id", job_id).execute()
            if not job_result.data or len(job_result.data) == 0:
                return {"error": "Job not found"}
            
            job = job_result.data[0]
            
            # Enhance user profile with job target
            profile_data = user["profile_data"].copy() if "profile_data" in user else {}
            profile_data["target_job"] = {
                "id": job["id"],
                "title": job["title"],
                "company": job["company"],
                "required_skills": job["required_skills"],
                "description": job["description"]
            }
            
            # Run workflow with enhanced profile
            result = await run_workflow_with_profile(profile_data)
            
            if "error" in result and result["error"]:
                return {"error": result["error"]}
            
            return {"roadmap": result.get("roadmap", {})}
            
        except Exception as e:
            print(f"Error generating job-specific roadmap: {e}")
            return {"error": str(e)}
    
    @app.get("/api/roadmap/career/{career_path_id}")
    async def get_career_specific_roadmap(career_path_id: str, email: str):
        """
        Get a career-specific learning roadmap.
        This generates a roadmap tailored for a specific career path.
        """
        try:
            # Get user profile
            from main import supabase
            user_result = supabase.table("users").select("*").eq("email", email).execute()
            user = None
            if user_result.data and len(user_result.data) > 0:
                user = user_result.data[0]
            if not user:
                return {"error": "User not found"}
            
            # Get career path details
            career_result = supabase.table("career_paths").select("*").eq("id", career_path_id).execute()
            if not career_result.data or len(career_result.data) == 0:
                return {"error": "Career path not found"}
            
            career = career_result.data[0]
            
            # Enhance user profile with career target
            profile_data = user["profile_data"].copy() if "profile_data" in user else {}
            profile_data["target_career_path"] = {
                "id": career["id"],
                "title": career["title"],
                "description": career["description"],
                "progression_levels": career["progression_levels"]
            }
            
            # Run workflow with enhanced profile
            result = await run_workflow_with_profile(profile_data)
            
            if "error" in result and result["error"]:
                return {"error": result["error"]}
            
            return {"roadmap": result.get("roadmap", {})}
            
        except Exception as e:
            print(f"Error generating career-specific roadmap: {e}")
            return {"error": str(e)}
    
    @app.post("/api/roadmap/update")
    async def update_roadmap(request: RoadmapUpdateRequest):
        """
        Update a user's roadmap with new data.
        Used to track progress and update milestones.
        """
        try:
            # Get user profile
            from main import supabase
            user_result = supabase.table("users").select("*").eq("email", request.email).execute()
            user = None
            if user_result.data and len(user_result.data) > 0:
                user = user_result.data[0]
            if not user:
                return {"error": "User not found"}
            
            # Update roadmap in database
            roadmap_result = supabase.table("roadmaps").select("id").eq("user_id", user["id"]).execute()
            
            if roadmap_result.data and len(roadmap_result.data) > 0:
                # Update existing roadmap
                update_result = supabase.table("roadmaps").update({
                    "roadmap_data": request.roadmap_data,
                    "updated_at": "now()"
                }).eq("user_id", user["id"]).execute()
                
                if update_result.error:
                    return {"error": str(update_result.error)}
                
                return {"success": True, "message": "Roadmap updated successfully"}
            else:
                # Insert new roadmap
                insert_result = supabase.table("roadmaps").insert({
                    "user_id": user["id"],
                    "roadmap_data": request.roadmap_data
                }).execute()
                
                if insert_result.error:
                    return {"error": str(insert_result.error)}
                
                return {"success": True, "message": "Roadmap created successfully"}
            
        except Exception as e:
            print(f"Error updating roadmap: {e}")
            return {"error": str(e)}

async def generate_new_roadmap(user):
    """Helper function to generate a new roadmap for a user"""
    try:
        # Get profile data for the workflow
        profile_data = user["profile_data"].copy() if "profile_data" in user else {}
        profile_data["email"] = user["email"]
        profile_data["user_id"] = user["id"]
        
        # Run the LangGraph workflow
        result = await run_workflow_with_profile(profile_data)
        
        if "error" in result and result["error"]:
            return {"error": result["error"]}
        
        # Save the roadmap to the database
        from main import supabase
        roadmap_data = result.get("roadmap", {})
        
        # Check if user already has a roadmap
        existing_roadmap = supabase.table("roadmaps").select("*").eq("user_id", user["id"]).execute()
        
        if existing_roadmap.data and len(existing_roadmap.data) > 0:
            # Update existing roadmap
            supabase.table("roadmaps").update({
                "roadmap_data": roadmap_data,
                "updated_at": "now()"
            }).eq("user_id", user["id"]).execute()
        else:
            # Insert new roadmap
            supabase.table("roadmaps").insert({
                "user_id": user["id"],
                "roadmap_data": roadmap_data
            }).execute()
        
        return {
            "roadmap": roadmap_data,
            "skills_analysis": result.get("skills_analysis", {}),
            "career_recommendations": result.get("career_recommendations", [])
        }
        
    except Exception as e:
        print(f"Error generating new roadmap: {e}")
        return {"error": str(e)}
