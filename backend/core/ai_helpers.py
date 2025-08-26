import os
import google.generativeai as genai
try:
    from dotenv import load_dotenv
except ImportError:
    # Fallback function if python-dotenv is not available
    def load_dotenv():
        print("Warning: python-dotenv not available, using default environment variables")
import json

# Load environment variables from .env file
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def get_gemini_model():
    """Get the Gemini model for text generation."""
    # Try using a model with higher quota limits
    try:
        return genai.GenerativeModel('gemini-pro')
    except Exception as e:
        print(f"Error with gemini-pro model: {e}")
        try:
            return genai.GenerativeModel('gemini-1.0-pro')
        except Exception as e:
            print(f"Error with gemini-1.0-pro model: {e}")
            return genai.GenerativeModel('gemini-1.5-flash')

async def parse_cv_text(cv_text):
    """
    Use Gemini to extract structured information from CV text.
    
    Args:
        cv_text (str): The text content of a CV/resume
        
    Returns:
        dict: Structured CV data including name, education, skills, etc.
    """
    model = get_gemini_model()
    
    # Craft a detailed prompt for CV parsing
    prompt = f"""
    Extract structured information from the following CV/resume text.
    Return the result as a JSON object with the following fields:
    - name: The person's full name
    - email: Email address if present
    - phone: Phone number if present
    - education: List of education entries with school, degree, field, and years
    - skills: List of professional skills (just the skill names)
    - work_experience: List of work experiences with company, role, years, and description
    - projects: List of projects with name and description
    - interests: List of personal interests or hobbies
    
    CV Text:
    {cv_text}
    
    Return ONLY the JSON output, no additional text. Make sure the JSON is valid and properly formatted.
    """
    
    try:
        print("Sending request to Gemini API...")
        response = model.generate_content(prompt)
        print("Received response from Gemini API")
        
        # Try to parse the response as JSON
        try:
            # First, check if the response contains markdown code blocks
            text = response.text
            print(f"Response text length: {len(text)}")
            if "```json" in text:
                # Extract the JSON portion from the markdown code block
                json_text = text.split("```json")[1].split("```")[0].strip()
                print("Extracted JSON from code block")
            elif "```" in text:
                # Extract from a generic code block
                json_text = text.split("```")[1].split("```")[0].strip()
                print("Extracted text from generic code block")
            else:
                json_text = text.strip()
                print("Using raw text as JSON")
                
            # Parse the JSON
            parsed_data = json.loads(json_text)
            return parsed_data
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON from Gemini response: {e}")
            print(f"Raw response: {response.text}")
            return {"error": "Failed to parse CV data", "raw_response": response.text}
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        
        # Provide a fallback response when the API fails due to rate limits
        print("Using fallback method for CV parsing...")
        
        # Basic extraction using simple rules
        fallback_data = {
            "name": extract_name(cv_text),
            "email": extract_email(cv_text),
            "phone": extract_phone(cv_text),
            "skills": extract_skills(cv_text),
            "education": extract_education(cv_text),
            "work_experience": extract_experience(cv_text),
            "projects": extract_projects(cv_text),
            "interests": extract_interests(cv_text),
            "note": "This is a simplified extraction due to API limits. For full details, please review the CV manually."
        }
        
        return {
            "api_error": str(e),
            "parsed_data": fallback_data,
            "message": "API rate limit exceeded. Using basic extraction. Please try again later for better results."
        }

def extract_name(text):
    """Extract a potential name from the CV text"""
    import re
    
    if not text:
        return "Name not detected"
    
    # Look for a name at the beginning (common in CVs)
    lines = text.strip().split('\n')
    
    if not lines:
        return "Name not detected"
    
    # Try to find a line that looks like a name (not all caps, not too long)
    for i, line in enumerate(lines[:10]):  # Check first 10 lines
        line = line.strip()
        # Skip empty lines, headers like "RESUME" or "CV", and lines that are all uppercase
        # Also skip common section headers that might be at the beginning
        if (line and 
            not re.match(r'^(RESUME|CV|CURRICULUM\s+VITAE|ABOUT ME|PROFILE|PERSONAL INFORMATION|CONTACT)$', line, re.IGNORECASE) and
            not line.isupper() and
            len(line) < 40 and  # Names are typically not very long
            not line.startswith('http') and  # Skip URLs
            not '@' in line and  # Skip email addresses
            not re.match(r'^\+?\d', line) and  # Skip lines starting with phone numbers
            len(line.split()) >= 2):  # Name usually has at least first and last name
            return line
    
    # Try to find a pattern that looks like "Name: John Smith" or "Name - John Smith"
    for line in lines[:15]:  # Check more lines for this pattern
        name_match = re.search(r'(?:name|full name|candidate)[:\s-]+([^,\n]{3,40})', line, re.IGNORECASE)
        if name_match:
            return name_match.group(1).strip()
    
    # If we still haven't found anything, look for capitalized words that might be a name
    for i, line in enumerate(lines[:10]):
        words = line.split()
        if len(words) >= 2 and len(words) <= 5:  # Typical name length
            if all(word[0].isupper() for word in words if len(word) > 1):  # Check if words are capitalized
                return line.strip()
            
    # Fallback to first non-empty line
    for line in lines:
        if line.strip():
            return line.strip()
            
    return "Name not detected"

def extract_email(text):
    """Extract email address using simple pattern matching"""
    import re
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    matches = re.findall(email_pattern, text)
    return matches[0] if matches else "Email not detected"

def extract_phone(text):
    """Extract phone number using simple pattern matching"""
    import re
    # More comprehensive phone pattern
    phone_patterns = [
        r'(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}',  # Standard format
        r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}',  # XXX-XXX-XXXX
        r'\(\d{3}\)\s*\d{3}[-.\s]?\d{4}',  # (XXX) XXX-XXXX
        r'\+\d{1,3}\s*\d{3,}',  # International format
    ]
    
    for pattern in phone_patterns:
        matches = re.findall(pattern, text)
        if matches:
            if isinstance(matches[0], tuple):
                # Handle tuple results from capture groups
                return "".join([m for t in matches for m in t if m])
            else:
                return matches[0]
                
    return "Phone not detected"

def extract_skills(text):
    """Extract potential skills from the CV"""
    import re
    
    # Comprehensive list of common technical skills
    technical_skills = {
        # Programming Languages
        "python": "Python",
        "javascript": "JavaScript",
        "typescript": "TypeScript",
        "java": "Java",
        "c\\+\\+": "C++",
        "c#": "C#",
        "php": "PHP",
        "ruby": "Ruby",
        "swift": "Swift",
        "kotlin": "Kotlin",
        "go(lang)?\\b": "Go",
        "rust": "Rust",
        "scala": "Scala",
        "perl": "Perl",
        "r\\b": "R",
        "objective(-)?c": "Objective-C",
        "assembly": "Assembly",
        "shell scripting": "Shell Scripting",
        "bash": "Bash",
        "powershell": "PowerShell",
        "dart": "Dart",
        "haskell": "Haskell",
        "lua": "Lua",
        
        # Frontend
        "html": "HTML",
        "css": "CSS",
        "sass": "Sass",
        "less": "Less",
        "bootstrap": "Bootstrap",
        "tailwind": "Tailwind CSS",
        "material(-)?ui": "Material UI",
        "react": "React",
        "vue(\\.js)?": "Vue.js",
        "angular": "Angular",
        "jquery": "jQuery",
        "redux": "Redux",
        "svelte": "Svelte",
        "webpack": "Webpack",
        "responsive design": "Responsive Design",
        "webassembly": "WebAssembly",
        
        # Backend
        "node(\\.js)?": "Node.js", 
        "express(\\.js)?": "Express.js",
        "django": "Django",
        "flask": "Flask",
        "fastapi": "FastAPI",
        "spring": "Spring",
        "spring boot": "Spring Boot",
        "laravel": "Laravel",
        "asp\\.net": "ASP.NET",
        "ruby on rails": "Ruby on Rails",
        "graphql": "GraphQL",
        "rest": "REST APIs",
        "api": "API Development",
        
        # Databases
        "sql": "SQL",
        "mysql": "MySQL",
        "postgresql": "PostgreSQL",
        "mongodb": "MongoDB",
        "firebase": "Firebase",
        "redis": "Redis",
        "nosql": "NoSQL",
        "oracle": "Oracle",
        "sqlite": "SQLite",
        "cassandra": "Cassandra",
        "elasticsearch": "Elasticsearch",
        
        # DevOps & Cloud
        "aws": "AWS",
        "azure": "Azure",
        "google cloud": "Google Cloud",
        "docker": "Docker",
        "kubernetes": "Kubernetes",
        "jenkins": "Jenkins",
        "ci/cd": "CI/CD",
        "terraform": "Terraform",
        "ansible": "Ansible",
        "vagrant": "Vagrant",
        "serverless": "Serverless",
        
        # Version Control
        "git": "Git",
        "github": "GitHub",
        "gitlab": "GitLab",
        "bitbucket": "Bitbucket",
        
        # Testing
        "unit testing": "Unit Testing",
        "integration testing": "Integration Testing",
        "jest": "Jest",
        "mocha": "Mocha",
        "selenium": "Selenium",
        "cypress": "Cypress",
        "junit": "JUnit",
        "pytest": "PyTest",
        
        # Mobile
        "android": "Android",
        "ios": "iOS",
        "react native": "React Native",
        "flutter": "Flutter",
        "swift": "Swift",
        "xamarin": "Xamarin",
        "ionic": "Ionic",
        "cordova": "Cordova",
        
        # Data Science & AI
        "machine learning": "Machine Learning",
        "deep learning": "Deep Learning",
        "nlp": "Natural Language Processing",
        "computer vision": "Computer Vision",
        "data analysis": "Data Analysis",
        "tensorflow": "TensorFlow",
        "pytorch": "PyTorch",
        "scikit(-)?learn": "scikit-learn",
        "pandas": "Pandas",
        "numpy": "NumPy",
        "tableau": "Tableau",
        "power bi": "Power BI",
        
        # Project Management & Methodologies
        "agile": "Agile",
        "scrum": "Scrum",
        "kanban": "Kanban",
        "waterfall": "Waterfall",
        "jira": "Jira",
        "trello": "Trello",
        "asana": "Asana",
    }
    
    # Soft skills
    soft_skills = {
        "communication": "Communication",
        "teamwork": "Teamwork",
        "leadership": "Leadership",
        "problem solving": "Problem Solving",
        "critical thinking": "Critical Thinking",
        "time management": "Time Management",
        "adaptability": "Adaptability",
        "creativity": "Creativity",
        "conflict resolution": "Conflict Resolution",
        "emotional intelligence": "Emotional Intelligence",
    }
    
    # Combine all skills for searching
    all_skills = {**technical_skills, **soft_skills}
    
    # Container for found skills
    found_skills = []
    
    # Try to identify a "Skills" section first
    skills_section = ""
    skills_headers = ["skills", "technical skills", "competencies", "expertise", "proficiencies"]
    
    for header in skills_headers:
        pattern = r'(?i)(?:^|\n)(?:\s*\b' + header + r'\b\s*:?|\b' + header + r'\b\s*:?)(.+?)(?=\n\s*\b\w+\b\s*:|$)'
        match = re.search(pattern, text)
        if match:
            skills_section = match.group(1).strip()
            break
    
    # If we found a skills section, prioritize extraction from there
    if skills_section:
        # Split by common separators in skills lists
        items = re.split(r'[,•\n|]', skills_section)
        
        # Process each item that might be a skill
        for item in items:
            item = item.strip().lower()
            if len(item) < 2:  # Skip very short items
                continue
                
            # Check if this item matches any of our known skills
            for pattern, skill_name in all_skills.items():
                if re.search(r'\b' + pattern + r'\b', item, re.IGNORECASE):
                    if skill_name not in found_skills:
                        found_skills.append(skill_name)
    
    # Search the entire text for additional skills that might not be in the skills section
    text_lower = text.lower()
    for pattern, skill_name in all_skills.items():
        if re.search(r'\b' + pattern + r'\b', text_lower, re.IGNORECASE):
            if skill_name not in found_skills:
                found_skills.append(skill_name)
    
    # Also check for additional skills commonly found in tech CVs but that might have variations
    additional_patterns = [
        (r'\bui/ux\b|\buser\s+interface\b|\buser\s+experience\b', "UI/UX Design"),
        (r'\bresponsive\s+design\b|\bmobile\s+first\b', "Responsive Design"),
        (r'\bcloud\s+computing\b|\bcloud\s+architecture\b', "Cloud Computing"),
        (r'\brestful\s+api|\brest\s+api\b|\bapi\s+development\b', "RESTful APIs"),
        (r'\bmicro[-\s]?services\b', "Microservices"),
        (r'\bagile\s+development\b|\bagile\s+methodology\b', "Agile Development"),
        (r'\bdevops\b', "DevOps"),
        (r'\bci/cd\b|\bcontinuous\s+integration\b|\bcontinuous\s+deployment\b', "CI/CD"),
        (r'\btdd\b|\btest[-\s]driven\s+development\b', "Test-Driven Development"),
        (r'\bsecurity\b|\bcyber[-\s]?security\b|\bapplication\s+security\b', "Security"),
        (r'\bdatabase\s+design\b|\bdatabase\s+management\b', "Database Design"),
        (r'\bdata\s+modeling\b|\bentity\s+relationship\b', "Data Modeling"),
        (r'\bbig\s+data\b', "Big Data"),
        (r'\bdata\s+warehousing\b|\bdata\s+lake\b', "Data Warehousing"),
        (r'\bsoftware\s+architecture\b|\bsystem\s+design\b', "Software Architecture"),
        (r'\bobject[-\s]?oriented\s+programming\b|\boop\b', "Object-Oriented Programming"),
        (r'\bfunctional\s+programming\b', "Functional Programming"),
        (r'\bsystem\s+administration\b|\bsysadmin\b', "System Administration"),
        (r'\bnetworking\b|\bnetwork\s+security\b', "Networking"),
    ]
    
    for pattern, skill_name in additional_patterns:
        if re.search(pattern, text_lower, re.IGNORECASE):
            if skill_name not in found_skills:
                found_skills.append(skill_name)
    
    # If we didn't find any skills, return a generic placeholder
    return found_skills if found_skills else ["Skills extraction requires full API"]

def extract_education(text):
    """Extract education information from the CV"""
    import re
    
    # Convert to lowercase for case-insensitive matching
    text_lower = text.lower()
    education_section = ""
    
    # Look for common education section headers with better boundary detection
    section_patterns = [
        r'(?:^|\n)\s*education\s*(?::|$)',
        r'(?:^|\n)\s*academic background\s*(?::|$)',
        r'(?:^|\n)\s*academic qualifications\s*(?::|$)',
        r'(?:^|\n)\s*qualifications\s*(?::|$)',
        r'(?:^|\n)\s*educational history\s*(?::|$)'
    ]
    
    # Try to identify an education section with more accurate boundaries
    for pattern in section_patterns:
        match = re.search(pattern, text_lower, re.IGNORECASE)
        if match:
            # Get the start position of the section
            start_pos = match.end()
            
            # Find the next section header to determine the end of the education section
            end_patterns = [
                r'(?:^|\n)\s*experience\s*(?::|$)',
                r'(?:^|\n)\s*employment history\s*(?::|$)',
                r'(?:^|\n)\s*work history\s*(?::|$)',
                r'(?:^|\n)\s*skills\s*(?::|$)',
                r'(?:^|\n)\s*projects\s*(?::|$)',
                r'(?:^|\n)\s*achievements\s*(?::|$)',
                r'(?:^|\n)\s*interests\s*(?::|$)',
                r'(?:^|\n)\s*certifications\s*(?::|$)',
                r'(?:^|\n)\s*publications\s*(?::|$)'
            ]
            
            # Find all potential next section headers
            end_matches = [(p, re.search(p, text_lower[start_pos:], re.IGNORECASE)) for p in end_patterns]
            valid_end_matches = [(p, m) for p, m in end_matches if m]
            
            if valid_end_matches:
                # Find the closest next section (minimum start position)
                closest_match = min(valid_end_matches, key=lambda x: x[1].start())
                end_pos = start_pos + closest_match[1].start()
                education_section = text[start_pos:end_pos].strip()
            else:
                # If no next section, take the rest of the text (with a reasonable limit)
                end_pos = min(start_pos + 1000, len(text))  # Limit to 1000 chars if no next section
                education_section = text[start_pos:end_pos].strip()
            
            break
    
    # If we didn't find a clearly marked section, look for educational keywords in the whole text
    if not education_section:
        # Look for specific education-related keywords in context
        edu_keywords = [
            "bachelor", "master", "phd", "doctorate", "bs", "ba", "ms", "ma", "mba", 
            "degree", "university", "college", "institute", "school", "graduated"
        ]
        
        for keyword in edu_keywords:
            # Look for the keyword with some context (50 chars before and after)
            matches = re.finditer(r'\b' + keyword + r'\b', text_lower)
            for match in matches:
                start = max(0, match.start() - 50)
                end = min(len(text), match.end() + 50)
                education_section += text[start:end] + " "
    
    # Extract common degree names and universities with improved patterns
    degrees = [
        "bachelor", "master", "phd", "doctorate", "bs", "ba", "ms", "ma", "mba",
        "b\\.s", "b\\.a", "m\\.s", "m\\.a", "m\\.b\\.a", "b\\.tech", "m\\.tech", 
        "bachelor's", "master's", "undergraduate", "graduate", "postgraduate"
    ]
    degree_pattern = r'(' + '|'.join(degrees) + r')[^,.\n]{0,30}'
    
    # Define patterns for years (for graduation dates)
    year_pattern = r'(?:19|20)\d{2}'
    
    # Try to identify institution and degree
    institutions = []
    
    # First try to process the education section if found
    if education_section:
        # Split by lines or bullet points to separate different education items
        items = re.split(r'[\n•]+', education_section)
        
        for item in items:
            if len(item.strip()) < 10:  # Skip very short items that are likely not education entries
                continue
                
            # For each education item, create a structured entry
            institution_info = {
                "institution": "",
                "degree": "",
                "field": "",
                "years": ""
            }
            
            # Extract years if present
            year_matches = re.findall(year_pattern, item)
            if year_matches:
                if len(year_matches) >= 2:
                    institution_info["years"] = f"{year_matches[0]} - {year_matches[1]}"
                else:
                    institution_info["years"] = year_matches[0]
            
            # Try to extract degree
            degree_match = re.search(degree_pattern, item, re.IGNORECASE)
            if degree_match:
                institution_info["degree"] = degree_match.group(0).strip()
                
                # Look for the field of study (often follows the degree)
                field_match = re.search(r'(?:' + '|'.join(degrees) + r')[^,.\n]{0,30}\s+(?:in|of)\s+([^,.\n]{3,40})', item, re.IGNORECASE)
                if field_match:
                    institution_info["field"] = field_match.group(1).strip()
            
            # Look for institution name
            uni_patterns = ["university", "college", "institute", "school", "academy"]
            for uni_pattern in uni_patterns:
                if uni_pattern in item.lower():
                    # Find the whole phrase containing the institution name
                    uni_match = re.search(r'([^,.\n]{0,40}' + uni_pattern + r'[^,.\n]{0,40})', item, re.IGNORECASE)
                    if uni_match:
                        institution_info["institution"] = uni_match.group(0).strip()
                        break
            
            # Only add if we found some meaningful information
            if institution_info["institution"] or institution_info["degree"]:
                # Set default field if we found a degree but no field
                if institution_info["degree"] and not institution_info["field"]:
                    institution_info["field"] = "Not specified"
                    
                institutions.append(institution_info)
    
    # If nothing was found, look for education-related sentences in the full text
    if not institutions:
        # Look for sentences containing education-related keywords
        edu_sentences = []
        lines = text.split('\n')
        
        for line in lines:
            lower_line = line.lower()
            if any(keyword in lower_line for keyword in ["degree", "university", "college", "graduated", "education"]):
                edu_sentences.append(line)
        
        if edu_sentences:
            # If we found education-related sentences but couldn't structure them
            return [{
                "institution": edu_sentences[0][:50] + ("..." if len(edu_sentences[0]) > 50 else ""),
                "degree": "Education information found, see CV for details",
                "field": "",
                "years": ""
            }]
        else:
            # If we really couldn't find anything education related
            return [{
                "institution": "Education section not clearly identified",
                "degree": "See full CV for details",
                "field": "",
                "years": ""
            }]
    
    return institutions

def extract_experience(text):
    """Extract work experience information from the CV"""
    import re
    
    # Convert to lowercase for case-insensitive matching
    text_lower = text.lower()
    experience_section = ""
    
    # Look for common experience section headers with better boundary detection
    section_patterns = [
        r'(?:^|\n)\s*(?:work\s+)?experience\s*(?::|$)',
        r'(?:^|\n)\s*employment history\s*(?::|$)',
        r'(?:^|\n)\s*work history\s*(?::|$)',
        r'(?:^|\n)\s*professional experience\s*(?::|$)',
        r'(?:^|\n)\s*work experience\s*(?::|$)',
        r'(?:^|\n)\s*career history\s*(?::|$)'
    ]
    
    # Try to identify an experience section
    for pattern in section_patterns:
        match = re.search(pattern, text_lower)
        if match:
            # Get the start position of the section
            start_pos = match.end()
            
            # Find the next section header to determine the end
            end_patterns = [
                r'(?:^|\n)\s*education\s*(?::|$)',
                r'(?:^|\n)\s*skills\s*(?::|$)',
                r'(?:^|\n)\s*projects\s*(?::|$)',
                r'(?:^|\n)\s*achievements\s*(?::|$)',
                r'(?:^|\n)\s*interests\s*(?::|$)',
                r'(?:^|\n)\s*hobbies\s*(?::|$)',
                r'(?:^|\n)\s*certifications\s*(?::|$)',
                r'(?:^|\n)\s*references\s*(?::|$)'
            ]
            
            # Find all potential next section headers
            end_matches = [(p, re.search(p, text_lower[start_pos:], re.IGNORECASE)) for p in end_patterns]
            valid_end_matches = [(p, m) for p, m in end_matches if m]
            
            if valid_end_matches:
                # Find the closest next section (minimum start position)
                closest_match = min(valid_end_matches, key=lambda x: x[1].start())
                end_pos = start_pos + closest_match[1].start()
                experience_section = text[start_pos:end_pos].strip()
            else:
                # If no next section, take the rest of the text (with a reasonable limit)
                end_pos = min(start_pos + 2000, len(text))  # Limit to 2000 chars if no next section
                experience_section = text[start_pos:end_pos].strip()
            
            break
    
    # If no clear section was found but we have a whole document, try to find experience by keywords
    if not experience_section and len(text) > 100:
        # Look for job title keywords in the document
        job_title_keywords = [
            "developer", "engineer", "manager", "director", "analyst", "designer", 
            "coordinator", "specialist", "consultant", "associate", "assistant"
        ]
        
        for keyword in job_title_keywords:
            matches = re.finditer(r'\b' + keyword + r'\b', text_lower)
            for match in matches:
                # Get context around the keyword (100 chars before and after)
                start = max(0, match.start() - 100)
                end = min(len(text), match.end() + 100)
                context = text[start:end]
                
                # Look for date patterns in this context
                if re.search(r'(19|20)\d{2}', context):
                    experience_section += context + " "
    
    # Extract jobs with improved detection
    jobs = []
    if experience_section:
        # Split experience section into potential job entries
        # Look for patterns that typically start a new job entry
        job_entry_markers = [
            # Date range patterns (common at the start of job entries)
            r'(?:^|\n)(?:\s*)?(?:19|20)\d{2}\s*[-–—]\s*(?:(?:19|20)\d{2}|present|current)',
            # Capitalized company or job title at start of line
            r'(?:^|\n)(?:\s*)?[A-Z][a-zA-Z\s]+(?:Inc\.|LLC|Ltd\.)?(?:\s*[-|,]\s*)?',
            # Job title indicators
            r'(?:^|\n)(?:\s*)?(?:Senior|Junior|Lead|Chief|Director|Manager|Engineer|Developer|Designer|Consultant)'
        ]
        
        # Combine patterns to split by any of these markers
        combined_pattern = '|'.join(job_entry_markers)
        job_entries = re.split(combined_pattern, experience_section)
        job_markers = re.findall(combined_pattern, experience_section)
        
        # Process each job entry with its marker
        for i in range(min(len(job_entries) - 1, len(job_markers))):
            marker = job_markers[i] if i < len(job_markers) else ""
            entry = job_entries[i + 1]
            
            if len(entry.strip()) < 10:  # Skip very short entries
                continue
                
            job_info = {
                "company": "",
                "role": "",
                "years": "",
                "description": ""
            }
            
            # Extract date range if present in the marker or entry
            date_match = re.search(r'((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|present|current)', 
                                  marker + " " + entry, re.IGNORECASE)
            if date_match:
                job_info["years"] = date_match.group(0).strip()
            
            # Look for company name and role
            lines = (marker + " " + entry).split('\n')
            header_line = lines[0].strip()
            
            # Try to split the header line into role and company
            # Common patterns: "Role at Company" or "Company - Role" or "Role, Company"
            role_company_patterns = [
                (r'(.+?)\s+at\s+(.+)', lambda m: (m.group(1).strip(), m.group(2).strip())),
                (r'(.+?)\s+for\s+(.+)', lambda m: (m.group(1).strip(), m.group(2).strip())),
                (r'(.+?)\s*[-–|]\s*(.+)', lambda m: (m.group(2).strip(), m.group(1).strip())),
                (r'(.+?),\s*(.+)', lambda m: (m.group(1).strip(), m.group(2).strip())),
            ]
            
            role_company_found = False
            for pattern, extractor in role_company_patterns:
                match = re.search(pattern, header_line)
                if match:
                    role, company = extractor(match)
                    job_info["role"] = role
                    job_info["company"] = company
                    role_company_found = True
                    break
            
            # If no clear separation, make a best guess
            if not role_company_found:
                words = header_line.split()
                if len(words) >= 2:
                    # Try to identify if it's more likely a company or role
                    company_indicators = ["inc", "llc", "ltd", "corporation", "corp", "group", "technologies"]
                    role_indicators = ["developer", "engineer", "manager", "director", "analyst", "designer", 
                                     "coordinator", "specialist", "consultant"]
                    
                    if any(ind in header_line.lower() for ind in company_indicators):
                        job_info["company"] = header_line
                    elif any(ind in header_line.lower() for ind in role_indicators):
                        job_info["role"] = header_line
                    else:
                        # Default: assume it's a role
                        job_info["role"] = header_line
            
            # Extract description from the rest of the entry
            description_lines = []
            for line in lines[1:]:
                line = line.strip()
                if line:
                    description_lines.append(line)
            
            job_info["description"] = " ".join(description_lines)
            
            # Only add jobs with meaningful information
            if job_info["role"] or job_info["company"]:
                jobs.append(job_info)
    
    # If we couldn't parse any jobs but found experience text, create a generic entry
    if not jobs and experience_section:
        # Try to extract at least the job titles and companies
        job_titles = re.findall(r'(?:senior|junior|lead)?\s*(?:developer|engineer|manager|director|analyst|designer|coordinator|specialist|consultant)', experience_section, re.IGNORECASE)
        companies = re.findall(r'(?:[A-Z][a-zA-Z]+\s*)+(?:Inc\.|LLC|Ltd\.|\bInc\b|\bLLC\b|\bLtd\b)', experience_section)
        
        if job_titles or companies:
            return [{
                "role": job_titles[0].strip() if job_titles else "Position details in CV",
                "company": companies[0].strip() if companies else "Company details in CV",
                "description": "See full CV for detailed work experience description."
            }]
    
    # If nothing was found, look for experience-related terms in the whole text
    if not jobs:
        # Look for job title keywords and date patterns in the whole document
        job_patterns = [
            r'(?:developer|engineer|manager|director|analyst|designer|coordinator|specialist|consultant)',
            r'(?:19|20)\d{2}\s*[-–—]\s*(?:(?:19|20)\d{2}|present|current)',
            r'(?:worked|work|position|role)\s+(?:at|for|with)\s+([A-Z][a-zA-Z\s]+)'
        ]
        
        found_matches = []
        for pattern in job_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                # Get some context around the match
                start = max(0, match.start() - 50)
                end = min(len(text), match.end() + 50)
                context = text[start:end]
                found_matches.append(context)
        
        if found_matches:
            return [{
                "company": "Work experience details present in CV",
                "role": "See full CV for specific roles and companies",
                "description": found_matches[0] + "..." if found_matches else ""
            }]
        
        return [{
            "company": "Experience section not clearly identified",
            "role": "See full CV for details"
        }]
    
    return jobs

def extract_projects(text):
    """Extract project information from the CV"""
    import re
    
    # Convert to lowercase for case-insensitive matching
    text_lower = text.lower()
    project_section = ""
    
    # Look for common project section headers with better boundary detection
    section_patterns = [
        r'(?:^|\n)\s*projects\s*(?::|$)', 
        r'(?:^|\n)\s*personal projects\s*(?::|$)', 
        r'(?:^|\n)\s*portfolio\s*(?::|$)', 
        r'(?:^|\n)\s*project experience\s*(?::|$)',
        r'(?:^|\n)\s*key projects\s*(?::|$)',
        r'(?:^|\n)\s*recent projects\s*(?::|$)',
        r'(?:^|\n)\s*selected projects\s*(?::|$)'
    ]
    
    # Try to identify a projects section with more accurate boundaries
    for pattern in section_patterns:
        match = re.search(pattern, text_lower)
        if match:
            # Get the start position of the section
            start_pos = match.end()
            
            # Find the next section header to determine the end
            end_patterns = [
                r'(?:^|\n)\s*skills\s*(?::|$)',
                r'(?:^|\n)\s*education\s*(?::|$)',
                r'(?:^|\n)\s*experience\s*(?::|$)',
                r'(?:^|\n)\s*work\s+experience\s*(?::|$)',
                r'(?:^|\n)\s*interests\s*(?::|$)',
                r'(?:^|\n)\s*hobbies\s*(?::|$)',
                r'(?:^|\n)\s*certifications\s*(?::|$)',
                r'(?:^|\n)\s*references\s*(?::|$)',
                r'(?:^|\n)\s*publications\s*(?::|$)'
            ]
            
            # Find all potential next section headers
            end_matches = [(p, re.search(p, text_lower[start_pos:], re.IGNORECASE)) for p in end_patterns]
            valid_end_matches = [(p, m) for p, m in end_matches if m]
            
            if valid_end_matches:
                # Find the closest next section (minimum start position)
                closest_match = min(valid_end_matches, key=lambda x: x[1].start())
                end_pos = start_pos + closest_match[1].start()
                project_section = text[start_pos:end_pos].strip()
            else:
                # If no next section, take the rest of the text (with a reasonable limit)
                end_pos = min(start_pos + 1500, len(text))  # Limit to 1500 chars if no next section
                project_section = text[start_pos:end_pos].strip()
            
            break
    
    # If no dedicated project section, look for project indicators throughout the document
    if not project_section:
        project_indicators = [
            r'(?:developed|created|built|designed|implemented|led|managed)\s+(?:a|an|the)?\s+(?:\w+\s+){0,3}(?:project|application|website|system|platform)',
            r'github\.com/[\w-]+/[\w-]+',  # GitHub repository links
            r'project name\s*:',
            r'(?:key|notable|major|significant)\s+(?:project|achievement)'
        ]
        
        project_contexts = []
        for pattern in project_indicators:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                # Get context around the match (100 chars before and after)
                start = max(0, match.start() - 100)
                end = min(len(text), match.end() + 100)
                context = text[start:end]
                project_contexts.append(context)
        
        # If we found project contexts, combine them into a project section
        if project_contexts:
            project_section = " ".join(project_contexts)
    
    # Better project extraction with improved recognition
    projects = []
    
    if project_section:
        # First try to identify project separators - either blank lines or bullet points
        # or numbered list items that might indicate individual projects
        separator_patterns = [
            r'\n\s*\n',  # Blank lines
            r'\n\s*[•●\-*]\s+',  # Bullet points at start of line
            r'\n\s*\d+\.\s+'  # Numbered list items
        ]
        
        # Try each separator pattern until we find one that gives us a reasonable split
        project_entries = [project_section]  # Default: whole section as one entry
        for separator in separator_patterns:
            entries = re.split(separator, project_section)
            if len(entries) > 1 and all(len(entry.strip()) > 0 for entry in entries):
                project_entries = entries
                break
        
        # Process each potential project entry
        for entry in project_entries:
            entry = entry.strip()
            if len(entry) < 15:  # Skip very short entries
                continue
                
            # Try to identify project name and description
            lines = entry.split('\n')
            
            project_info = {
                "name": "",
                "description": "",
                "technologies": []
            }
            
            # First line is often the project name
            if lines[0].strip():
                # Check if it's likely a header (shorter, contains capital letters)
                if len(lines[0].strip()) < 100 and any(c.isupper() for c in lines[0]):
                    project_info["name"] = lines[0].strip()
                    description_lines = lines[1:]
                else:
                    # If first line doesn't look like a header, try to extract project name
                    project_name_patterns = [
                        r'"([^"]+)"',  # Text in quotes
                        r'project:\s*(.+)',  # "Project: name"
                        r'([A-Z][a-zA-Z0-9\s]+(?:System|Platform|Website|Application|Portal|Dashboard|Tool))'  # Capitalized project type
                    ]
                    
                    for pattern in project_name_patterns:
                        match = re.search(pattern, lines[0], re.IGNORECASE)
                        if match:
                            project_info["name"] = match.group(1).strip()
                            break
                    
                    # If still no name found, use the first line or part of it
                    if not project_info["name"]:
                        # If line is too long, take just the first part
                        if len(lines[0]) > 60:
                            project_info["name"] = lines[0][:60] + "..."
                        else:
                            project_info["name"] = lines[0]
                    
                    description_lines = lines[1:]
            else:
                description_lines = lines
            
            # Join the rest of the lines as the description
            project_info["description"] = " ".join([line.strip() for line in description_lines if line.strip()])
            
            # Try to extract technologies used
            tech_patterns = [
                r'(?:technologies|tech stack|tools|languages)(?:\s+used)?(?:\s*:|\s+include|\s+including)\s+(.+)',
                r'(?:using|with|in)\s+([A-Za-z0-9,\s/+]+(?:React|Angular|Vue|Node\.js|Django|Rails|PHP|Python|Java|JavaScript))'
            ]
            
            for pattern in tech_patterns:
                match = re.search(pattern, entry, re.IGNORECASE)
                if match:
                    tech_text = match.group(1)
                    # Split by common separators
                    techs = re.split(r'[,/&\s]+', tech_text)
                    project_info["technologies"] = [tech.strip() for tech in techs if tech.strip() and len(tech.strip()) > 1]
                    break
            
            # Only add projects with meaningful information
            if project_info["name"] and len(project_info["name"]) > 2:
                projects.append(project_info)
    
    # If we didn't find any projects but found project indicators, add a generic entry
    if not projects and project_section:
        # Try to extract at least one potential project name
        name_match = re.search(r'([A-Z][a-zA-Z0-9\s]{2,30}(?:System|Platform|Website|Application|Portal|Dashboard|Tool))', project_section)
        
        return [{
            "name": name_match.group(1) if name_match else "Project details present in CV",
            "description": "See full CV for project details and implementations."
        }]
    
    # If nothing was found, look for project-related keywords throughout the document
    if not projects:
        project_keywords = ["developed", "created", "built", "designed", "implemented", "github", "project"]
        for keyword in project_keywords:
            if keyword in text_lower:
                return [{
                    "name": "Project details present in CV", 
                    "description": "See full CV for details"
                }]
        
        return [{
            "name": "No project information found",
            "description": "Consider adding projects to showcase your practical experience."
        }]
    
    return projects

def extract_interests(text):
    """Extract potential interests or hobbies"""
    import re
    
    text_lower = text.lower()
    interests_section = ""
    
    # Look for common section headers for interests
    patterns = ["interests", "hobbies", "activities", "personal interests"]
    for pattern in patterns:
        if pattern in text_lower:
            # Get text after the pattern
            parts = text_lower.split(pattern, 1)
            if len(parts) > 1:
                # Find the end of the section (next heading or large gap)
                section_text = parts[1]
                # Check for common ending patterns (next section)
                end_patterns = ["skills", "education", "experience", "projects", "references"]
                
                for end_pattern in end_patterns:
                    if end_pattern in section_text:
                        # Cut at next section
                        section_text = section_text.split(end_pattern, 1)[0]
                        
                interests_section = section_text.strip()
                break
    
    # If found, extract interests
    if interests_section:
        # Split by common separators
        items = re.split(r'[,•\n]', interests_section)
        interests = [item.strip() for item in items if item.strip()]
        
        # Remove very short items or items that are likely not interests
        interests = [item for item in interests if len(item) > 3]
        
        if interests:
            return interests
    
    # Try to find common hobbies in the whole text if no section was identified
    common_hobbies = ["reading", "travel", "photography", "coding", "programming",
                     "hiking", "music", "sports", "cooking", "writing", "gaming"]
    
    found_hobbies = []
    for hobby in common_hobbies:
        if re.search(r'\b' + hobby + r'\b', text_lower):
            found_hobbies.append(hobby)
    
    if found_hobbies:
        return found_hobbies
    
    return ["Interests not specifically identified"]
