create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id bigint not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.favorites enable row level security;

grant select, insert, delete on public.favorites to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'favorites'
      and policyname = 'Users can select own favorites'
  ) then
    create policy "Users can select own favorites"
    on public.favorites
    for select
    to authenticated
    using ((select auth.uid()) = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'favorites'
      and policyname = 'Users can insert own favorites'
  ) then
    create policy "Users can insert own favorites"
    on public.favorites
    for insert
    to authenticated
    with check ((select auth.uid()) = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'favorites'
      and policyname = 'Users can delete own favorites'
  ) then
    create policy "Users can delete own favorites"
    on public.favorites
    for delete
    to authenticated
    using ((select auth.uid()) = user_id);
  end if;
end $$;
