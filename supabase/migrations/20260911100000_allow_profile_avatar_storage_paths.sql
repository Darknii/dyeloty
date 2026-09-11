alter table public.profiles
  drop constraint profiles_avatar_url_check;

alter table public.profiles
  add constraint profiles_avatar_url_check check (
    avatar_url is null
    or avatar_url ~ '^https?://'
    or avatar_url ~* ('^' || user_id::text || '/[0-9a-f-]{36}\.(jpg|png|webp)$')
  );
