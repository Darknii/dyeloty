alter table public.profiles
  add column knitting_preferences text[] not null default '{}',
  add column favorite_fibres text[] not null default '{}',
  add column knitting_since smallint,
  add column knitting_vibes text[] not null default '{}',
  add column role text not null default 'user',
  add constraint profiles_knitting_preferences_length_check check (cardinality(knitting_preferences) <= 8),
  add constraint profiles_favorite_fibres_length_check check (cardinality(favorite_fibres) <= 8),
  add constraint profiles_knitting_since_check check (knitting_since is null or knitting_since between 1900 and 2100),
  add constraint profiles_knitting_vibes_length_check check (cardinality(knitting_vibes) <= 2),
  add constraint profiles_role_check check (role in ('user', 'team', 'founder'));

revoke insert, update on public.profiles from authenticated;

grant insert (
  user_id,
  username,
  avatar_url,
  bio,
  knitting_preferences,
  favorite_fibres,
  knitting_since,
  knitting_vibes
) on public.profiles to authenticated;

grant update (
  user_id,
  username,
  avatar_url,
  bio,
  knitting_preferences,
  favorite_fibres,
  knitting_since,
  knitting_vibes
) on public.profiles to authenticated;
