from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from supabase import Client
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import html

# Load environment variables
load_dotenv()

# Get email settings from environment variables
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
EMAIL_RECIPIENT = os.getenv("EMAIL_RECIPIENT", "support@careercompass.com")

# Create a router
router = APIRouter()

# Define the contact form model
class ContactForm(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(..., min_length=5, max_length=200)
    message: str = Field(..., min_length=10, max_length=2000)

# Function to get Supabase client (will be overridden in main.py)
async def get_supabase() -> Client:
    # This is a placeholder that will be overridden in main.py
    # We just need this so the router can define the dependency
    pass

# Function to sanitize input to prevent XSS
def sanitize_input(text: str) -> str:
    return html.escape(text)

# Function to send email notification
def send_email_notification(contact: ContactForm) -> bool:
    if not EMAIL_USERNAME or not EMAIL_PASSWORD:
        print("Email credentials not found in environment variables. Skipping email notification.")
        return False

    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USERNAME
        msg['To'] = EMAIL_RECIPIENT
        msg['Subject'] = f"Contact Form Submission: {sanitize_input(contact.subject)}"
        
        # Create HTML content
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                .container {{ padding: 20px; }}
                .header {{ background-color: #f0f4f8; padding: 15px; border-radius: 5px; }}
                .content {{ margin-top: 20px; }}
                .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Contact Form Submission</h2>
                    <p>You have received a new message from the Career Compass contact form.</p>
                </div>
                <div class="content">
                    <p><strong>Name:</strong> {sanitize_input(contact.name)}</p>
                    <p><strong>Email:</strong> {sanitize_input(contact.email)}</p>
                    <p><strong>Subject:</strong> {sanitize_input(contact.subject)}</p>
                    <p><strong>Message:</strong></p>
                    <p>{sanitize_input(contact.message)}</p>
                </div>
                <div class="footer">
                    <p>This email was sent automatically from the Career Compass contact form.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Attach HTML content
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

@router.post("/api/contact")
async def contact(form: ContactForm, supabase: Client = Depends(get_supabase)):
    """
    Submit a contact form that will be saved to the database and trigger an email notification.
    """
    try:
        # Sanitize inputs
        sanitized_form = {
            "name": sanitize_input(form.name),
            "email": sanitize_input(form.email),
            "subject": sanitize_input(form.subject),
            "message": sanitize_input(form.message),
            "status": "new"  # For tracking if the contact request has been handled
        }
        
        # Print debug info
        print(f"Contact form received: {sanitized_form}")
        print(f"Supabase client: {supabase is not None}")
        
        # Make sure the table exists
        try:
            # Try to query the table to see if it exists
            test_query = supabase.table("contact_messages").select("count", count="exact").limit(1).execute()
            table_name = "contact_messages"
            print(f"Using contact_messages table. Record count: {test_query.count if hasattr(test_query, 'count') else 'unknown'}")
        except Exception as table_error:
            print(f"Error with contact_messages table: {table_error}")
            # Try contact_forms table as fallback
            try:
                test_query = supabase.table("contact_forms").select("count", count="exact").limit(1).execute()
                table_name = "contact_forms"
                print(f"Using contact_forms table. Record count: {test_query.count if hasattr(test_query, 'count') else 'unknown'}")
            except Exception as fallback_error:
                print(f"Error with contact_forms table: {fallback_error}")
                # Create a simple table if neither exists
                table_name = "contact_messages"
                print(f"Will attempt to use {table_name} table regardless")
        
        # Save to database
        result = supabase.table(table_name).insert(sanitized_form).execute()
        
        # Check result
        if hasattr(result, 'error') and result.error:
            print(f"Database error: {result.error}")
            return JSONResponse(
                status_code=500,
                content={
                    "status": "error",
                    "detail": f"Database error: {result.error}",
                    "message": "Failed to save your message. Please try again later."
                }
            )
            
        if not hasattr(result, 'data') or not result.data:
            print("No data returned from insert operation")
            return JSONResponse(
                status_code=500,
                content={
                    "status": "error",
                    "detail": "Failed to save contact form submission to database",
                    "message": "Failed to save your message. Please try again later."
                }
            )
        
        # Send email notification (don't fail if email fails, just log it)
        email_sent = send_email_notification(form)
        print(f"Email notification sent: {email_sent}")
        
        # Return success response with JSONResponse to ensure proper JSON formatting
        return JSONResponse(
            content={
                "status": "success",
                "message": "Your message has been received. We'll get back to you soon.",
                "email_sent": email_sent
            }
        )
    
    except HTTPException as http_e:
        # Handle HTTP exceptions explicitly with proper JSON response
        print(f"HTTP Exception in contact form submission: {http_e.detail}")
        return JSONResponse(
            status_code=http_e.status_code,
            content={
                "status": "error",
                "detail": http_e.detail,
                "message": "An error occurred while processing your request."
            }
        )
    
    except Exception as e:
        print(f"Contact form submission error: {e}")
        # Return a proper JSON response even in case of error
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "detail": str(e),
                "message": "An error occurred while processing your request."
            }
        )
