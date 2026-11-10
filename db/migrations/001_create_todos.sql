-- 001: to-do list for the admin dashboard.
-- Idempotent: safe to run any number of times.

create table if not exists public.todos (
  id          integer generated always as identity primary key,
  text        text        not null check (char_length(text) between 1 and 500),
  done        boolean     not null default false,
  created_by  text        not null,
  created_at  timestamptz not null default now()
);

-- Only the server touches this table (through DATABASE_URL). RLS with no
-- policies keeps it out of reach of Supabase's public API keys.
-- Enabling RLS when it's already on is a no-op.
alter table public.todos enable row level security;
