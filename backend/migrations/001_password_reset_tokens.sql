-- Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON password_reset_tokens (token);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx ON password_reset_tokens (user_id);

-- Row Level Security
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Policies for password_reset_tokens
CREATE POLICY "Service role can manage password reset tokens"
    ON password_reset_tokens
    USING (true)
    WITH CHECK (true);

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM password_reset_tokens
    WHERE expires_at < NOW() OR used = true;
END;
$$;

-- Schedule a job to clean up expired tokens daily
-- This requires pg_cron extension which might not be available in all Supabase plans
-- If pg_cron is not available, you'll need to handle cleanup in your application code
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_extension 
        WHERE extname = 'pg_cron'
    ) THEN
        -- Drop the job if it already exists (for idempotent migrations)
        PERFORM cron.unschedule('cleanup_expired_password_reset_tokens');
        
        -- Schedule the job to run daily at 3 AM
        PERFORM cron.schedule(
            'cleanup_expired_password_reset_tokens',
            '0 3 * * *',  -- Run at 3 AM every day
            'SELECT cleanup_expired_tokens()'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If pg_cron is not available, just continue
        RAISE NOTICE 'pg_cron extension not available. Token cleanup will need to be handled by application code.';
END;
$$;
