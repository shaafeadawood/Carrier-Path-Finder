from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from supabase import Client


class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    user_id: Optional[str] = None


def add_contact_routes(app: FastAPI, supabase: Client):
    """
    Add contact form API routes to the main FastAPI application
    """
    
    @app.post("/api/contact")
    async def submit_contact_form(contact: ContactMessage):
        """
        Submit a contact form message to be stored in the database
        
        Parameters:
        - contact: The contact form data including name, email, subject, and message
        
        Returns:
        - JSON response with status and message ID if successful
        """
        try:
            # Add timestamp
            timestamp = datetime.now().isoformat()
            
            # Insert into Supabase
            result = supabase.table("contact_messages").insert({
                "name": contact.name,
                "email": contact.email,
                "subject": contact.subject,
                "message": contact.message,
                "user_id": contact.user_id,
                "created_at": timestamp,
                "status": "unread"
            }).execute()
            
            # Check for errors
            if hasattr(result, 'error') and result.error:
                raise HTTPException(status_code=500, detail=f"Database error: {result.error}")
                
            # Return success with the message ID
            message_id = result.data[0]['id'] if result.data and len(result.data) > 0 else None
            return {
                "status": "success",
                "message": "Contact form submitted successfully",
                "message_id": message_id
            }
            
        except Exception as e:
            # Log the error
            print(f"Error submitting contact form: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to submit contact form: {str(e)}")
    
    @app.get("/api/admin/contact-messages")
    async def get_contact_messages(status: Optional[str] = None):
        """
        Get all contact messages with optional filtering by status
        
        Parameters:
        - status: Optional filter for message status ("read", "unread", "archived")
        
        Returns:
        - List of contact messages
        """
        try:
            # Start the query
            query = supabase.table("contact_messages").select("*")
            
            # Add filter if status is provided
            if status:
                query = query.eq("status", status)
                
            # Execute the query
            result = query.order("created_at", desc=True).execute()
            
            # Return the messages
            return {
                "status": "success", 
                "messages": result.data if result.data else []
            }
            
        except Exception as e:
            # Log the error
            print(f"Error fetching contact messages: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch contact messages: {str(e)}")
    
    @app.put("/api/admin/contact-messages/{message_id}")
    async def update_contact_message_status(message_id: str, status: str):
        """
        Update the status of a contact message
        
        Parameters:
        - message_id: The ID of the message to update
        - status: The new status ("read", "unread", "archived")
        
        Returns:
        - JSON response with status
        """
        try:
            # Validate status
            valid_statuses = ["read", "unread", "archived"]
            if status not in valid_statuses:
                raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
            
            # Update the message status
            result = supabase.table("contact_messages").update({
                "status": status,
                "updated_at": datetime.now().isoformat()
            }).eq("id", message_id).execute()
            
            # Check for errors
            if hasattr(result, 'error') and result.error:
                raise HTTPException(status_code=500, detail=f"Database error: {result.error}")
            
            # Check if message was found
            if result.data is None or len(result.data) == 0:
                raise HTTPException(status_code=404, detail="Message not found")
                
            # Return success
            return {
                "status": "success",
                "message": f"Message status updated to {status}"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            # Log the error
            print(f"Error updating message status: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to update message status: {str(e)}")
    
    @app.delete("/api/admin/contact-messages/{message_id}")
    async def delete_contact_message(message_id: str):
        """
        Delete a contact message
        
        Parameters:
        - message_id: The ID of the message to delete
        
        Returns:
        - JSON response with status
        """
        try:
            # Delete the message
            result = supabase.table("contact_messages").delete().eq("id", message_id).execute()
            
            # Check for errors
            if hasattr(result, 'error') and result.error:
                raise HTTPException(status_code=500, detail=f"Database error: {result.error}")
            
            # Return success
            return {
                "status": "success",
                "message": "Message deleted successfully"
            }
            
        except Exception as e:
            # Log the error
            print(f"Error deleting message: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to delete message: {str(e)}")

    return app
