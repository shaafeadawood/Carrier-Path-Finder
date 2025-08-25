"""
CV Parser API Module

This module provides a FastAPI endpoint for CV parsing using LangGraph and Gemini API.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import Dict, Any, List, Optional
import os
import traceback

from core.file_processing import extract_text_from_file
from core.cache_utils import get_cache_key, get_from_cache, save_to_cache
from workflows.langgraph_workflow import run_workflow_with_cv

router = APIRouter()

@router.post("/api/cv/parse")
async def parse_cv(
    file: UploadFile = File(...), 
    email: Optional[str] = Query(None, description="User email for persistence"),
    use_langgraph: bool = Query(True, description="Whether to use LangGraph workflow for enhanced processing")
):
    """
    Parse a CV file and return structured information.
    
    This endpoint uses a combination of text extraction and AI (Gemini API) to parse CV content
    into structured data. It can optionally save the parsed information to the user's profile.
    
    Parameters:
    - file: The CV file (PDF or DOCX) to parse
    - email: Optional user email for saving results to profile
    - use_langgraph: Whether to use LangGraph workflow (recommended for best results)
    
    Returns:
    - Structured CV data with skills, education, experience, etc.
    """
    # Print detailed debug information
    print(f"CV Parser called: File={file.filename}, Content-Type={file.content_type}, Size={file.size}, Email={email}")
    
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    try:
        # Extract text from file
        extracted_text = await extract_text_from_file(file)
        
        if not extracted_text or len(extracted_text) < 50:  # Basic validation
            print("Insufficient text extracted")
            # Still attempt fallback extraction even with limited text
            from core.ai_helpers import (extract_name, extract_email, extract_phone, extract_skills, 
                                 extract_education, extract_experience, extract_projects, extract_interests)
            fallback_data = {
                "name": extract_name(extracted_text),
                "email": extract_email(extracted_text),
                "phone": extract_phone(extracted_text),
                "skills": extract_skills(extracted_text) if extracted_text else ["Insufficient document text"],
                "education": extract_education(extracted_text) if extracted_text else "Could not extract education information",
                "work_experience": extract_experience(extracted_text) if extracted_text else "Could not extract work experience",
                "projects": extract_projects(extracted_text) if extracted_text else [],
                "interests": extract_interests(extracted_text) if extracted_text else []
            }
            return {
                "status": "partial",
                "data": fallback_data,
                "message": "Limited text extracted from document. Results may be incomplete."
            }
        
        # Check cache first to avoid redundant processing
        cache_key = get_cache_key(extracted_text)
        cached_result = get_from_cache(cache_key)
        
        if cached_result:
            print("Using cached CV parsing result")
            return {
                "status": "success",
                "data": cached_result,
                "source": "cache"
            }
        
        if use_langgraph:
            try:
                # Process with LangGraph workflow - this does CV parsing, skills analysis,
                # career recommendations, and roadmap generation in one workflow
                print(f"Processing CV with LangGraph workflow for email: {email}")
                workflow_result = await run_workflow_with_cv(extracted_text)
                
                if "error" in workflow_result and workflow_result["error"]:
                    print(f"Error in LangGraph workflow: {workflow_result['error']}")
                    raise Exception(workflow_result["error"])
                
                # Extract the parsed profile from the workflow result
                parsed_cv = workflow_result.get("parsed_profile", {})
                
                # If the name is missing or looks like a heading, use our extraction method
                if not parsed_cv.get("name") or parsed_cv.get("name") in ["About Me", "Profile", "Personal Information"]:
                    from core.ai_helpers import extract_name
                    better_name = extract_name(extracted_text)
                    if better_name and better_name != "Name not detected":
                        parsed_cv["name"] = better_name
                        print(f"Fixed name extraction: {better_name}")
                
                # Same for email if missing
                if not parsed_cv.get("email") or parsed_cv.get("email") == "Not provided":
                    from core.ai_helpers import extract_email
                    better_email = extract_email(extracted_text)
                    if better_email and better_email != "Email not detected":
                        parsed_cv["email"] = better_email
                        print(f"Fixed email extraction: {better_email}")
                
                # Add workflow results to the parsed CV data
                result = {
                    "status": "success",
                    "data": parsed_cv,
                    "workflow_result": {
                        "skills_analysis": workflow_result.get("skills_analysis"),
                        "career_recommendations": workflow_result.get("career_recommendations"),
                        "roadmap": workflow_result.get("roadmap")
                    },
                    "source": "langgraph"
                }
                
                # Save parsed CV to cache
                save_to_cache(cache_key, parsed_cv)
                
                # Save to user profile if email provided
                if email:
                    from main import supabase
                    user_result = supabase.table("users").select("*").eq("email", email).execute()
                    
                    if user_result.data and len(user_result.data) > 0:
                        user = user_result.data[0]
                        # Update user profile with CV data
                        profile_data = {
                            "name": parsed_cv.get("name", user.get("name", "")),
                            "email": parsed_cv.get("email", email),
                            "education": parsed_cv.get("education", ""),
                            "experience": parsed_cv.get("work_experience", ""),
                            "projects": parsed_cv.get("projects", ""),
                            "skills": parsed_cv.get("skills", []),
                            "cv_data": parsed_cv,
                            "updated_at": "now()"
                        }
                        
                        supabase.table("users").update({"profile_data": profile_data}).eq("id", user["id"]).execute()
                        result["profile_updated"] = True
                
                return result
                
            except Exception as workflow_error:
                print(f"LangGraph workflow error: {workflow_error}")
                traceback.print_exc()
                # Fall back to basic parsing
                print("Falling back to basic parsing...")
        
        # If LangGraph is disabled or fails, use basic parsing
        from core.ai_helpers import parse_cv_text
        parsed_cv = await parse_cv_text(extracted_text)
        
        # Handle different response formats
        if "api_error" in parsed_cv:
            print(f"Using fallback data due to API error: {parsed_cv['api_error']}")
            result_data = parsed_cv.get("parsed_data", {})
            save_to_cache(cache_key, result_data)
            return {
                "status": "success",
                "data": result_data,
                "source": "fallback",
                "message": parsed_cv.get("message", "Using basic extraction due to API limits")
            }
        elif "error" in parsed_cv:
            # Use fallback methods
            from core.ai_helpers import (extract_name, extract_email, extract_phone, extract_skills, 
                              extract_education, extract_experience, extract_projects, extract_interests)
            fallback_data = {
                "name": extract_name(extracted_text),
                "email": extract_email(extracted_text),
                "phone": extract_phone(extracted_text),
                "skills": extract_skills(extracted_text),
                "education": extract_education(extracted_text),
                "work_experience": extract_experience(extracted_text),
                "projects": extract_projects(extracted_text),
                "interests": extract_interests(extracted_text)
            }
            return {
                "status": "partial",
                "data": fallback_data,
                "error": parsed_cv["error"]
            }
        else:
            # Successful parsing
            save_to_cache(cache_key, parsed_cv)
            
            # Save to user profile if email provided
            if email:
                from main import supabase
                user_result = supabase.table("users").select("*").eq("email", email).execute()
                
                if user_result.data and len(user_result.data) > 0:
                    user = user_result.data[0]
                    # Update user profile with CV data
                    profile_data = {
                        "name": parsed_cv.get("name", user.get("name", "")),
                        "email": parsed_cv.get("email", email),
                        "education": parsed_cv.get("education", ""),
                        "experience": parsed_cv.get("work_experience", ""),
                        "projects": parsed_cv.get("projects", ""),
                        "skills": parsed_cv.get("skills", []),
                        "cv_data": parsed_cv,
                        "updated_at": "now()"
                    }
                    
                    supabase.table("users").update({"profile_data": profile_data}).eq("id", user["id"]).execute()
                    return {
                        "status": "success",
                        "data": parsed_cv,
                        "source": "basic_ai",
                        "profile_updated": True
                    }
            
            return {
                "status": "success",
                "data": parsed_cv,
                "source": "basic_ai"
            }
    except Exception as e:
        print(f"Error processing CV: {e}")
        traceback.print_exc()
        # Instead of failing, return a fallback response
        try:
            # Still try to extract basic info
            from core.ai_helpers import (extract_name, extract_email, extract_phone, extract_skills, 
                              extract_education, extract_experience, extract_projects, extract_interests)
            
            fallback_data = {
                "name": extract_name(extracted_text if 'extracted_text' in locals() else ""),
                "email": extract_email(extracted_text if 'extracted_text' in locals() else ""),
                "phone": extract_phone(extracted_text if 'extracted_text' in locals() else ""),
                "skills": extract_skills(extracted_text if 'extracted_text' in locals() else ""),
                "education": extract_education(extracted_text if 'extracted_text' in locals() else ""),
                "work_experience": extract_experience(extracted_text if 'extracted_text' in locals() else ""),
                "projects": extract_projects(extracted_text if 'extracted_text' in locals() else ""),
                "interests": extract_interests(extracted_text if 'extracted_text' in locals() else "")
            }
            
            return {
                "status": "error_with_fallback",
                "data": fallback_data,
                "error": str(e)
            }
        except Exception as fallback_error:
            # If even fallback fails, return the error
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to process CV: {str(e)}. Fallback extraction also failed: {str(fallback_error)}"
            )

def add_cv_routes(app):
    """Add CV parsing routes to the main FastAPI app."""
    app.include_router(router)
