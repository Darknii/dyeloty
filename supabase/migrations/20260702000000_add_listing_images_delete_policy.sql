do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users delete own listing images'
  ) then
    create policy "Authenticated users delete own listing images"
    on storage.objects
    for delete
    to authenticated
    using (
      bucket_id = 'listing-images'
      and (storage.foldername(name))[1] = 'listings'
      and (storage.foldername(name))[2] = (select auth.uid())::text
    );
  end if;
end $$;
