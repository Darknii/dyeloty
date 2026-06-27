alter table public.listings
add column if not exists status text;

update public.listings
set status = case
  when status is null then 'available'
  when status = 'active' then 'available'
  when status = 'reserved' then 'reserved'
  when status = 'sold' then 'sold'
  when status in ('inactive', 'found') then 'sold'
  else 'available'
end;

alter table public.listings
alter column status set default 'available';

alter table public.listings
alter column status set not null;

alter table public.listings
drop constraint if exists listings_status_check;

alter table public.listings
add constraint listings_status_check
check (status in ('available', 'reserved', 'sold'));
