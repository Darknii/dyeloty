-- Supersede legacy permissive listing read policies. The current MVP exposes
-- listings publicly regardless of their available/reserved/sold status.
drop policy if exists "Enable read access for all users" on public.listings;
drop policy if exists "Everyone can read active listings" on public.listings;
drop policy if exists "Public can read listings" on public.listings;

create policy "Public can read listings"
on public.listings
for select
to anon, authenticated
using (true);

-- `yarns` is not used by the current application, but this remains safe if a
-- legacy table is present and resolves the documented foreign-key lookup path.
do $$
begin
  if to_regclass('public.yarns') is not null then
    execute 'create index if not exists yarns_brand_id_idx on public.yarns (brand_id)';
  end if;
end $$;
