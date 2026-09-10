create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  constraint profiles_username_format_check check (username ~ '^[A-Za-z0-9_]{3,30}$'),
  constraint profiles_avatar_url_check check (avatar_url is null or avatar_url ~ '^https?://')
);

create unique index profiles_username_lower_unique_idx
  on public.profiles (lower(username));

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;

create policy "Authenticated users can read public profiles"
  on public.profiles for select to authenticated
  using (true);

create policy "Users can create their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
