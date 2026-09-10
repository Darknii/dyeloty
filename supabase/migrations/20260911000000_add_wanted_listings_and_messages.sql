-- A listing can either be an external offer or a request for yarn.
alter table public.listings
  add column if not exists listing_type text not null default 'offer';

update public.listings set listing_type = 'offer' where listing_type is null;

alter table public.listings
  drop constraint if exists listings_listing_type_check;

alter table public.listings
  add constraint listings_listing_type_check check (listing_type in ('offer', 'wanted'));

alter table public.listings
  drop constraint if exists listings_status_check;

alter table public.listings
  add constraint listings_status_check check (status in ('available', 'reserved', 'sold', 'found'));

create index if not exists listings_wanted_active_idx
  on public.listings (created_at desc)
  where listing_type = 'wanted' and status = 'available';

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_1 uuid not null references auth.users(id) on delete cascade,
  user_2 uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_distinct_users check (user_1 <> user_2),
  constraint conversations_canonical_users check (user_1 < user_2),
  constraint conversations_unique_pair unique (user_1, user_2)
);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at);
create index if not exists messages_sender_id_idx
  on public.messages (sender_id);
create index if not exists messages_unread_recipient_idx
  on public.messages (conversation_id, sender_id) where read_at is null;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Participants can read conversations"
  on public.conversations for select to authenticated
  using ((select auth.uid()) in (user_1, user_2));

create policy "Users can start conversations"
  on public.conversations for insert to authenticated
  with check (
    (select auth.uid()) in (user_1, user_2)
    and user_1 <> user_2
    and user_1 < user_2
  );

create policy "Participants can read messages"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (select auth.uid()) in (c.user_1, c.user_2)
    )
  );

create policy "Participants can send messages as themselves"
  on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (select auth.uid()) in (c.user_1, c.user_2)
    )
  );

create or replace function public.mark_conversation_read(target_conversation_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.messages m
  set read_at = now()
  where m.conversation_id = target_conversation_id
    and m.sender_id <> auth.uid()
    and m.read_at is null
    and exists (
      select 1 from public.conversations c
      where c.id = target_conversation_id and auth.uid() in (c.user_1, c.user_2)
    );
$$;

grant execute on function public.mark_conversation_read(uuid) to authenticated;
