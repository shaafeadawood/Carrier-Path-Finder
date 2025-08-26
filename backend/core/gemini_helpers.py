"""
Gemini AI Helper Module

This module provides functions for interacting with Google's Gemini API
specifically for CV parsing and text analysis.
"""

import os
import re
import json
from typing import Dict, Any, Optional, List

# Import Gemini API
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# Configure API
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Safety settings - set to allow more content for resume parsing
safety_settings = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

async def parse_cv_with_gemini(cv_text: str) -> Dict[str, Any]:
    """
    Parse CV text into structured data using Google's Gemini API.
    
    Args:
        cv_text: The raw text extracted from a CV file
        
    Returns:
        Dictionary containing parsed CV data
    """
    if not api_key:
        return {
            "api_error": "Gemini API key not configured",
            "message": "Please set the GEMINI_API_KEY environment variable"
        }
    
    try:
        # Create a Gemini model instance with safety settings
        model = genai.GenerativeModel(
            model_name="gemini-pro",
            safety_settings=safety_settings
        )
        
        # Create the prompt
        prompt = f"""
        Extract structured information from the following CV.
        Return ONLY a valid JSON object with these fields:
        - name: The person's full name
        - email: Email address if present, otherwise empty string
        - phone: Phone number if present, otherwise empty string
        - education: Array of education entries, each with institution, degree, and year
        - work_experience: Array of work experience entries, each with company, position, duration, and description
        - skills: Array of technical and soft skills
        - projects: Array of projects with name and description
        - interests: Array of personal interests/hobbies

        CV TEXT:
        {cv_text}
        """
        
        # Generate response
        response = await model.generate_content_async(prompt)
        
        # Extract JSON data
        try:
            text = response.text
            
            # Try to find JSON pattern in the response
            json_match = re.search(r'```json\n(.*?)\n```', text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                json_str = text
            
            # Clean up any non-JSON text
            json_str = re.sub(r'^[^{]*', '', json_str)
            json_str = re.sub(r'[^}]*$', '', json_str)
            
            # Parse JSON
            parsed_cv = json.loads(json_str)
            
            return parsed_cv
            
        except Exception as parse_error:
            print(f"Error parsing Gemini response: {parse_error}")
            # Return the raw text as fallback
            return {
                "error": f"Failed to parse response: {str(parse_error)}",
                "raw_response": response.text
            }
            
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return {"error": str(e)}