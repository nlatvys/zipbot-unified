-- Supabase SQL (run in SQL editor)
create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  zip text not null,
  created_at timestamp with time zone default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references chats(id) on delete cascade,
  zip text not null,
  role text check (role in ('user','assistant','system')) default 'user',
  content text not null,
  created_at timestamp with time zone default now()
);

-- Enable Realtime
alter publication supabase_realtime add table chats;
alter publication supabase_realtime add table messages;

-- (Optional) RLS example — keep open for demo first!
-- alter table chats enable row level security;
-- alter table messages enable row level security;
-- Create policies later to restrict by session user or API key.


-- Add session_id columns (text) for ownership without auth (temporary)
alter table if exists chats add column if not exists session_id text;
alter table if exists messages add column if not exists session_id text;

-- Index for session filters
create index if not exists idx_chats_session on chats(session_id);
create index if not exists idx_messages_session on messages(session_id);

-- Add user_id to enforce owner-only via RLS (Supabase Auth)
alter table if exists chats add column if not exists user_id uuid;
alter table if exists messages add column if not exists user_id uuid;

create index if not exists idx_chats_user on chats(user_id);
create index if not exists idx_messages_user on messages(user_id);
