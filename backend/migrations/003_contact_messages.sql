-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new', -- 'new', 'read', 'responded', 'archived'
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster status filtering
CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON contact_messages (status);

-- Create index for user relationship
CREATE INDEX IF NOT EXISTS contact_messages_user_id_idx ON contact_messages (user_id);

-- Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Admin users can read all contact messages
CREATE POLICY "Admins can read contact messages" 
    ON contact_messages 
    FOR SELECT 
    USING (
        auth.uid() IN (SELECT id FROM admin_users)
    );

-- Admin users can update contact messages (to change status)
CREATE POLICY "Admins can update contact messages" 
    ON contact_messages 
    FOR UPDATE 
    USING (
        auth.uid() IN (SELECT id FROM admin_users)
    );

-- Users can insert contact messages
CREATE POLICY "Anyone can insert contact messages" 
    ON contact_messages 
    FOR INSERT 
    WITH CHECK (true);

-- Users can read their own messages if they were logged in when sending
CREATE POLICY "Users can read their own contact messages" 
    ON contact_messages 
    FOR SELECT 
    USING (
        auth.uid() = user_id AND user_id IS NOT NULL
    );
