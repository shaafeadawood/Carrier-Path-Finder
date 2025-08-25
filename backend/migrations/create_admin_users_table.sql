-- Create admin_users table
create table if not exists public.admin_users (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.admin_users enable row level security;

-- Create policy for admins to see all admins
create policy "Admins can see all admins"
    on public.admin_users
    for select
    to authenticated
    using (auth.uid() in (select user_id from public.admin_users));

-- Create policy for superadmins to modify admins
create policy "Superadmins can modify admins"
    on public.admin_users
    using (auth.uid() in (
        select user_id from public.admin_users 
        where user_id in (select user_id from public.super_admins)
    ));

-- Create index on user_id for faster lookups
create index if not exists admin_users_user_id_idx on public.admin_users(user_id);
