-- Favorites are queried by listing id when related records are cleaned up or inspected.
create index if not exists favorites_listing_id_idx on public.favorites (listing_id);
