-- Athar · Supabase Phase 1: auth + progress sync
-- Run this in the Supabase SQL editor once.

-- ── Tables ───────────────────────────────────────────────

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ── Row-Level Security ───────────────────────────────────

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
drop policy if exists "profiles_self_write" on public.profiles;
drop policy if exists "user_progress_self_read" on public.user_progress;
drop policy if exists "user_progress_self_write" on public.user_progress;

create policy "profiles_self_read"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles_self_write"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_progress_self_read"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "user_progress_self_insert"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "user_progress_self_update"
  on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── updated_at trigger ───────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_user_progress_touch on public.user_progress;
create trigger trg_user_progress_touch
  before update on public.user_progress
  for each row execute function public.touch_updated_at();

-- ── Auto-create profile on signup ────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
