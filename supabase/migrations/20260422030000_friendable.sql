-- Athar · Supabase Phase 2c: friend-request privacy
-- ── Per-user "accepting friend requests" toggle ─────────
-- ── Decline blocks re-requests (uses existing 'blocked') ─

alter table public.profiles
  add column if not exists friendable boolean not null default true;

-- Trigger blocks friendship inserts when addressee has friendable=false.
create or replace function public.friendships_enforce_friendable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_friendable boolean;
begin
  select p.friendable into is_friendable
  from public.profiles p
  where p.user_id = new.addressee_id;

  if is_friendable is false then
    raise exception 'NOT_FRIENDABLE' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_friendships_friendable on public.friendships;
create trigger trg_friendships_friendable
  before insert on public.friendships
  for each row execute function public.friendships_enforce_friendable();

-- Search RPC now returns friendable so the UI can disable the Add button.
drop function if exists public.search_users(text);
create or replace function public.search_users(q text)
returns table (
  user_id uuid,
  handle citext,
  display_name text,
  avatar_url text,
  friendable boolean
)
language sql
security definer
set search_path = public
as $$
  select p.user_id, p.handle, p.display_name, p.avatar_url, p.friendable
  from public.profiles p
  where p.handle is not null
    and auth.uid() is not null
    and p.user_id <> auth.uid()
    and (
      p.handle ilike q || '%'
      or p.display_name ilike '%' || q || '%'
    )
  order by
    case when p.handle ilike q || '%' then 0 else 1 end,
    p.handle
  limit 20;
$$;

grant execute on function public.search_users(text) to authenticated;
