# Career Path Finder - Environment Setup

This guide explains how to set up the environment for the Career Path Finder application, focusing on the integration with Supabase.

## Environment Variables

The project uses environment variables to configure various services like Supabase and Google's Gemini API.

### Frontend Environment (.env in frontend folder)

The frontend uses Vite, which requires environment variables to be prefixed with `VITE_`.

```
# Supabase Configuration
VITE_SUPABASE_URL=https://vdbgrhvcduaxabvbwxui.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYmdyaHZjZHVheGFidmJ3eHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1OTUzMDIsImV4cCI6MjA3MTE3MTMwMn0.ueKR3IWs5-gJiXHoZ3Yjb4CHNYTOAVkci2PKYsvfCFs
```

### Backend Environment (.env in backend folder)

The backend needs both Supabase credentials and the Gemini API key:

```
# Career Path Finder API Keys
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
SUPABASE_URL=https://vdbgrhvcduaxabvbwxui.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYmdyaHZjZHVheGFidmJ3eHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1OTUzMDIsImV4cCI6MjA3MTE3MTMwMn0.ueKR3IWs5-gJiXHoZ3Yjb4CHNYTOAVkci2PKYsvfCFs
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYmdyaHZjZHVheGFidmJ3eHVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU5NTMwMiwiZXhwIjoyMDcxMTcxMzAyfQ.j5-kqS9JnFLdeQ9NarC12yNr67SGrvNzKkDyYA18WWM
```

## Supabase Configuration

The application uses Supabase for:

1. **Authentication** - Handling user login and registration
2. **Database** - Storing user profiles and application data
3. **Storage** - For file uploads like CVs

### Key Differences Between Keys

- **SUPABASE_ANON_KEY** - Used for frontend client authentication (limited permissions)
- **SUPABASE_SERVICE_KEY** - Used by the backend for administrative operations (full permissions)

### Using Environment Variables

#### In Frontend (React/Vite)

The frontend accesses environment variables using Vite's `import.meta.env`:

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

#### In Backend (Python/FastAPI)

The backend uses dotenv to load environment variables:

```python
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
```

## Database Setup

To ensure the required tables exist in Supabase:

1. Run the database setup script:

```bash
cd backend
python setup_database.py
```

2. If the automatic setup fails, you can manually create the tables using SQL:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  education TEXT,
  experience TEXT,
  projects TEXT,
  interests TEXT,
  skills TEXT[],
  career_goal TEXT,
  level TEXT,
  is_onboarded BOOLEAN DEFAULT false,
  profile_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Set up RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can read their own profile" 
  ON profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

## CV Parser Integration with Supabase

The CV Parser now includes Supabase integration:

1. It uses the user's authenticated session from Supabase to associate uploaded CVs with users
2. It fallbacks to using the user's email from Supabase when CV extraction fails to find an email
3. It stores parsing results in the user's profile in the Supabase database

## Starting the Application

1. Start the backend server:

```bash
cd backend
python main.py
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
```

## Troubleshooting

If you encounter issues with Supabase authentication or database access:

1. Check that your environment variables are correctly set in both frontend and backend
2. Ensure you've run the database setup script to create necessary tables
3. Check the console logs for any authentication or database errors
4. Verify that your Supabase project has the correct settings for authentication and storage
