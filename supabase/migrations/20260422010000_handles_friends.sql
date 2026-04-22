-- Athar · Supabase Phase 2a: public handles + friendships

-- ── Extensions ───────────────────────────────────────────

create extension if not exists citext;

-- ── profiles.handle ──────────────────────────────────────

alter table public.profiles
  add column if not exists handle citext unique;

alter table public.profiles
  add constraint profiles_handle_format
  check (handle is null or handle ~ '^[a-z0-9_]{3,20}$');

-- Let any signed-in user read the public columns on other profiles.
-- The existing "profiles_self_read" stays (owner sees everything); this
-- add-on covers peer lookups for friend search.
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read"
  on public.profiles for select
  to authenticated
  using (true);

-- ── Friendships ──────────────────────────────────────────

create type friendship_status as enum ('pending', 'accepted', 'blocked');

create table if not exists public.friendships (
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create index if not exists idx_friendships_addressee on public.friendships (addressee_id);

alter table public.friendships enable row level security;

drop policy if exists "friendships_party_read" on public.friendships;
create policy "friendships_party_read"
  on public.friendships for select
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "friendships_requester_insert" on public.friendships;
create policy "friendships_requester_insert"
  on public.friendships for insert
  to authenticated
  with check (auth.uid() = requester_id and status = 'pending');

drop policy if exists "friendships_addressee_update" on public.friendships;
create policy "friendships_addressee_update"
  on public.friendships for update
  to authenticated
  using (auth.uid() = addressee_id)
  with check (auth.uid() = addressee_id and status in ('accepted', 'blocked'));

drop policy if exists "friendships_party_delete" on public.friendships;
create policy "friendships_party_delete"
  on public.friendships for delete
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop trigger if exists trg_friendships_touch on public.friendships;
create trigger trg_friendships_touch
  before update on public.friendships
  for each row execute function public.touch_updated_at();

-- ── Search RPC ───────────────────────────────────────────

create or replace function public.search_users(q text)
returns table (user_id uuid, handle citext, display_name text, avatar_url text)
language sql
security definer
set search_path = public
as $$
  select p.user_id, p.handle, p.display_name, p.avatar_url
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
