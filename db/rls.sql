-- RLS for owner-only access using Supabase Auth
alter table if exists chats enable row level security;
alter table if exists messages enable row level security;

-- Drop old anon policies if present
do $$
begin
  if exists (select 1 from pg_policies where polname = 'chats_read_all') then
    drop policy chats_read_all on chats;
  end if;
  if exists (select 1 from pg_policies where polname = 'chats_insert_zip_only') then
    drop policy chats_insert_zip_only on chats;
  end if;
  if exists (select 1 from pg_policies where polname = 'messages_read_all') then
    drop policy messages_read_all on messages;
  end if;
  if exists (select 1 from pg_policies where polname = 'messages_insert_zip_only') then
    drop policy messages_insert_zip_only on messages;
  end if;
end $$;

-- Owner-only SELECT
create policy chats_select_owner on chats
for select to authenticated using ( user_id = auth.uid() );

create policy messages_select_owner on messages
for select to authenticated using ( user_id = auth.uid() );

-- Owner-only INSERT (must set user_id = auth.uid())
create policy chats_insert_owner on chats
for insert to authenticated
with check ( zip ~ '^\d{5}$' and user_id = auth.uid() );

create policy messages_insert_owner on messages
for insert to authenticated
with check ( zip ~ '^\d{5}$' and length(content) <= 2000 and user_id = auth.uid() );

-- No UPDATE/DELETE policies → blocked by default
