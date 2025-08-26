
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
            