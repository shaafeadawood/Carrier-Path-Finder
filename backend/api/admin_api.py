from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Body
from pydantic import BaseModel, Field
from typing import Optional
from supabase import Client
import os
import uuid

# Create a router
router = APIRouter()

# Define request models
class AdminUserCreate(BaseModel):
    email: str = Field(..., description="Email address of the user to make an admin")
    admin_key: str = Field(..., description="Secret admin key to authorize this action")

# Function to get Supabase client (will be overridden in main.py)
async def get_supabase() -> Client:
    # This is a placeholder that will be overridden in main.py
    pass

@router.post("/api/admin/create")
async def create_admin_user(
    request: AdminUserCreate,
    supabase: Client = Depends(get_supabase)
):
    """
    Create an admin user. This endpoint requires a secret admin key.
    """
    # Check admin key
    admin_key = os.getenv("ADMIN_CREATE_KEY")
    if not admin_key or request.admin_key != admin_key:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    
    try:
        # Find user by email
        user_result = supabase.auth.admin.list_users()
        user_id = None
        
        for user in user_result.users:
            if user.email == request.email:
                user_id = user.id
                break
        
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if already an admin
        admin_check = supabase.table("admin_users").select("*").eq("user_id", user_id).execute()
        
        if admin_check.data and len(admin_check.data) > 0:
            return {
                "status": "success",
                "message": f"User {request.email} is already an admin",
                "user_id": user_id
            }
        
        # Create admin user entry
        result = supabase.table("admin_users").insert({
            "user_id": user_id
        }).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create admin user")
        
        return {
            "status": "success",
            "message": f"User {request.email} has been made an admin",
            "user_id": user_id
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error creating admin user: {e}")
        raise HTTPException(status_code=500, detail=str(e))