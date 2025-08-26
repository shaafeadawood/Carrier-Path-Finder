from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from supabase import Client
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import html
from datetime import datetime, timedelta
import secrets
import string

# Load environment variables
load_dotenv()

# Get email settings from environment variables
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
EMAIL_SENDER = os.getenv("EMAIL_SENDER", EMAIL_USERNAME)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Create a router
router = APIRouter()

# Define the request models
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str = Field(..., min_length=20, max_length=100)
    new_password: str = Field(..., min_length=8)
    
    @validator('new_password')
    def password_strength(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v

# Function to get Supabase client (will be overridden in main.py)
async def get_supabase() -> Client:
    # This is a placeholder that will be overridden in main.py
    pass

# Function to sanitize input to prevent XSS
def sanitize_input(text: str) -> str:
    return html.escape(text) if text else ""

# Generate a secure random token
def generate_reset_token(length=64):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

# Function to send password reset email
def send_password_reset_email(email: str, token: str) -> bool:
    if not EMAIL_USERNAME or not EMAIL_PASSWORD:
        print("Email credentials not found in environment variables. Skipping email.")
        return False

    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_SENDER
        msg['To'] = email
        msg['Subject'] = "Password Reset Request - Career Compass"
        
        # Create HTML content
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: #f9fafb; padding: 20px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }}
                .footer {{ background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; border: 1px solid #e5e7eb; }}
                .button {{ display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }}
                .button:hover {{ background-color: #4338ca; }}
                .warning {{ color: #b91c1c; margin-top: 15px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset your password for your Career Compass account. Click the button below to reset your password:</p>
                    
                    <p style="text-align: center;">
                        <a href="{reset_link}" class="button">Reset Your Password</a>
                    </p>
                    
                    <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                    
                    <p class="warning">Note: This password reset link will expire in 1 hour for security reasons.</p>
                </div>
                <div class="footer">
                    <p>&copy; {datetime.now().year} Career Compass. All rights reserved.</p>
                    <p>This is an automated email. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Attach HTML content
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        return False

@router.post("/auth/password-reset-request")
async def request_password_reset(
    request: PasswordResetRequest, 
    background_tasks: BackgroundTasks,
    supabase: Client = Depends(get_supabase)
):
    """
    Request a password reset link to be sent to the user's email.
    """
    try:
        email = request.email.lower()
        
        # Check if user exists
        user_result = supabase.auth.admin.list_users()
        user_found = False
        
        for user in user_result.users:
            if user.email == email:
                user_found = True
                break
        
        if not user_found:
            # For security reasons, don't reveal if email exists or not
            return {
                "status": "success",
                "message": "If your email is registered, you will receive password reset instructions."
            }
        
        # Generate a secure reset token
        token = generate_reset_token()
        expiry = datetime.now() + timedelta(hours=1)
        
        # Store the token in the database
        result = supabase.table("password_reset_tokens").insert({
            "email": email,
            "token": token,
            "expires_at": expiry.isoformat(),
            "used": False
        }).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create password reset token")
        
        # Send the password reset email in the background
        background_tasks.add_task(send_password_reset_email, email, token)
        
        return {
            "status": "success",
            "message": "If your email is registered, you will receive password reset instructions."
        }
    
    except Exception as e:
        print(f"Password reset request error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred processing your request")

@router.post("/auth/password-reset-confirm")
async def confirm_password_reset(
    request: PasswordResetConfirm,
    supabase: Client = Depends(get_supabase)
):
    """
    Reset the user's password using the token sent via email.
    """
    try:
        token = sanitize_input(request.token)
        
        # Check if token exists and is valid
        result = supabase.table("password_reset_tokens").select("*").eq("token", token).eq("used", False).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=400, detail="Invalid or expired token")
        
        token_data = result.data[0]
        
        # Check if token is expired
        expires_at = datetime.fromisoformat(token_data["expires_at"])
        if datetime.now() > expires_at:
            raise HTTPException(status_code=400, detail="Token has expired. Please request a new password reset.")
        
        # Get the user email
        email = token_data["email"]
        
        # Reset the password using Supabase Auth API
        try:
            # Update password in Supabase Auth
            update_result = supabase.auth.admin.update_user_by_email(
                email=email,
                password=request.new_password
            )
            
            # Mark token as used
            supabase.table("password_reset_tokens").update({"used": True}).eq("token", token).execute()
            
            return {
                "status": "success",
                "message": "Password has been reset successfully. You can now log in with your new password."
            }
        except Exception as auth_error:
            print(f"Error updating password: {auth_error}")
            raise HTTPException(status_code=500, detail="Failed to update password")
    
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Password reset confirmation error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred processing your request")