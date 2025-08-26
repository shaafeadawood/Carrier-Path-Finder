-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users (email);

-- Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admin_users table
CREATE POLICY "Admins can read admin users" 
    ON admin_users 
    FOR SELECT 
    USING (
        auth.uid() IN (SELECT id FROM admin_users)
    );

-- Only super admins can insert/update admin records
CREATE POLICY "Super admins can insert admin users" 
    ON admin_users 
    FOR INSERT 
    WITH CHECK (
        auth.uid() IN (SELECT id FROM admin_users WHERE role = 'super_admin')
    );

CREATE POLICY "Super admins can update admin users" 
    ON admin_users 
    FOR UPDATE 
    USING (
        auth.uid() IN (SELECT id FROM admin_users WHERE role = 'super_admin')
    );

-- Add function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM admin_users 
        WHERE id = user_id
    );
END;
$$;