#!/usr/bin/env python
"""
This script creates/repairs the Supabase profiles table required for the application.
Run this script to set up the necessary database structure.

Usage: python setup_database.py
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
import sys

# Load environment variables if available
load_dotenv()

# Supabase credentials (use environment variables if available)
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://vdbgrhvcduaxabvbwxui.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYmdyaHZjZHVheGFidmJ3eHVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU5NTMwMiwiZXhwIjoyMDcxMTcxMzAyfQ.j5-kqS9JnFLdeQ9NarC12yNr67SGrvNzKkDyYA18WWM")

def init_database():
    """Initialize database tables and functions"""
    print("Connecting to Supabase...")
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected successfully!")
    except Exception as e:
        print(f"Failed to connect to Supabase: {e}")
        sys.exit(1)
        
    # Process migration files if they exist
    from pathlib import Path
    import re
    
    # Get list of migration files
    migrations_dir = Path("backend/migrations")
    if not migrations_dir.exists():
        migrations_dir = Path("migrations")
    
    if migrations_dir.exists():
        migration_files = sorted([f for f in migrations_dir.glob("*.sql")])
        if migration_files:
            print(f"\nFound {len(migration_files)} migration files to process")
            
            # Execute each migration file
            for migration_file in migration_files:
                print(f"Applying migration: {migration_file.name}")
                
                # Read SQL from file
                with open(migration_file, "r") as f:
                    sql = f.read()
                
                # Split SQL into individual statements (simple approach)
                statements = re.split(r';(?:\r?\n|\r)', sql)
                
                # Execute each statement
                for statement in statements:
                    statement = statement.strip()
                    if statement:
                        try:
                            # Execute SQL statement
                            result = supabase.rpc("exec_sql", {"query": statement}).execute()
                            
                            # Check for errors
                            if hasattr(result, 'error') and result.error:
                                print(f"Warning: {result.error}")
                                
                        except Exception as e:
                            print(f"Warning: Could not execute statement: {e}")
                            # Continue with next statement rather than stopping
                            continue

    # Create profiles table if it doesn't exist
    print("\nChecking for profiles table...")
    try:
        # Test if profiles table exists by querying it
        test_result = supabase.table("profiles").select("count").limit(1).execute()
        print("✅ Profiles table exists!")
        
        # Check if any rows exist
        row_count = len(test_result.data)
        print(f"   Found {row_count} rows in profiles table.")
        
    except Exception as e:
        print(f"⚠️  Profiles table may not exist or is inaccessible. Error: {str(e)}")
        print("Creating profiles table...")
        
        try:
            # Create profiles table
            create_table_sql = """
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
            
            ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
            
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
              
            CREATE OR REPLACE FUNCTION handle_new_user() 
            RETURNS TRIGGER AS $$
            BEGIN
              INSERT INTO public.profiles (id, email, name)
              VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
              RETURN new;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
            
            CREATE OR REPLACE TRIGGER on_auth_user_created
              AFTER INSERT ON auth.users
              FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
            """
            
            # Execute SQL with Supabase-py (using RPC)
            supabase.rpc('exec_sql', {'sql': create_table_sql}).execute()
            print("✅ Profiles table created successfully!")
        except Exception as create_error:
            print(f"❌ Failed to create profiles table: {create_error}")
            
            # Offer SQL script as fallback
            with open('setup_supabase_tables.sql', 'w') as f:
                f.write(create_table_sql)
            print("\nCreated SQL script 'setup_supabase_tables.sql' that you can run manually in the Supabase SQL editor.")
    
    # Test users table which is used by the application
    print("\nChecking for users table...")
    try:
        test_result = supabase.table("users").select("count").limit(1).execute()
        print("✅ Users table exists!")
        
        # Check if any rows exist
        row_count = len(test_result.data)
        print(f"   Found {row_count} rows in users table.")
        
    except Exception as e:
        print(f"⚠️  Users table may not exist or is inaccessible. Error: {str(e)}")
        print("Creating users table...")
        
        try:
            # Create users table
            create_users_sql = """
            CREATE TABLE IF NOT EXISTS users (
              id UUID PRIMARY KEY,
              name TEXT,
              email TEXT UNIQUE,
              profile_data JSONB,
              created_at TIMESTAMPTZ DEFAULT now(),
              updated_at TIMESTAMPTZ DEFAULT now()
            );
            
            ALTER TABLE users ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can read any user" 
              ON users 
              FOR SELECT 
              TO authenticated
              USING (true);
            
            CREATE POLICY "Users can update their own record" 
              ON users 
              FOR UPDATE 
              USING (auth.uid() = id);
              
            CREATE POLICY "Users can insert their own record" 
              ON users 
              FOR INSERT 
              WITH CHECK (auth.uid() = id);
            """
            
            # Execute SQL with Supabase-py (using RPC)
            supabase.rpc('exec_sql', {'sql': create_users_sql}).execute()
            print("✅ Users table created successfully!")
        except Exception as create_error:
            print(f"❌ Failed to create users table: {create_error}")
            # Add SQL to the same script file
            with open('setup_supabase_tables.sql', 'a') as f:
                f.write("\n\n-- Users table setup\n")
                f.write(create_users_sql)
    
    print("\nDatabase setup complete!")

if __name__ == "__main__":
    init_database()
