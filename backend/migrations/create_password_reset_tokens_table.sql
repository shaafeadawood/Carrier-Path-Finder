-- Create password reset tokens table
create table if not exists public.password_reset_tokens (
    id uuid default uuid_generate_v4() primary key,
    email varchar not null,
    token varchar not null unique,
    expires_at timestamp with time zone not null,
    used boolean default false,
    created_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.password_reset_tokens enable row level security;

-- Create policy for admins to see all tokens
create policy "Admins can see all password reset tokens"
    on public.password_reset_tokens
    for select
    to authenticated
    using (auth.uid() in (select user_id from public.admin_users));

-- Create policy for token insertion
create policy "Allow password reset token creation"
    on public.password_reset_tokens
    for insert
    to service_role
    with check (true);

-- Create policy for token updates
create policy "Allow password reset token updates"
    on public.password_reset_tokens
    for update
    to service_role
    using (true);

-- Create index on token and email for faster lookups
create index if not exists password_reset_tokens_token_idx on public.password_reset_tokens(token);
create index if not exists password_reset_tokens_email_idx on public.password_reset_tokens(email);
