alter table public.listings
add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update
set public = excluded.public;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read listing images'
  ) then
    create policy "Public read listing images"
    on storage.objects
    for select
    to public
    using (bucket_id = 'listing-images');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users upload own listing images'
  ) then
    create policy "Authenticated users upload own listing images"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'listing-images'
      and (storage.foldername(name))[1] = 'listings'
      and (storage.foldername(name))[2] = (select auth.uid())::text
    );
  end if;
end $$;
