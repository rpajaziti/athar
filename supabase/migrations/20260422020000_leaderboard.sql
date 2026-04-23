-- Athar · Supabase Phase 2b: attempts log + leaderboard

-- ── Attempts log ─────────────────────────────────────────

create table if not exists public.attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tier text,
  surah_id int,
  correct int not null,
  total int not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_attempts_user_created on public.attempts (user_id, created_at desc);
create index if not exists idx_attempts_created on public.attempts (created_at desc);

alter table public.attempts enable row level security;

drop policy if exists "attempts_self_read" on public.attempts;
create policy "attempts_self_read"
  on public.attempts for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "attempts_self_insert" on public.attempts;
create policy "attempts_self_insert"
  on public.attempts for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ── Leaderboard RPC ──────────────────────────────────────

drop function if exists public.friend_leaderboard();
drop function if exists public.leaderboard(text, int, int);
drop function if exists public.my_leaderboard_rank(text, int);

create or replace function public.leaderboard(
  p_scope text,
  p_window_days int,
  p_limit int default 50
) returns table (
  user_id uuid,
  handle citext,
  display_name text,
  avatar_url text,
  score int,
  attempts int,
  accuracy numeric,
  streak int,
  is_self boolean,
  rank int
)
language sql
security definer
set search_path = public
as $$
  with me as (select auth.uid() as uid),
  candidates as (
    select case when f.requester_id = (select uid from me) then f.addressee_id else f.requester_id end as uid
    from public.friendships f
    where p_scope = 'friends'
      and f.status = 'accepted'
      and (select uid from me) in (f.requester_id, f.addressee_id)
    union
    select (select uid from me)
    where p_scope = 'friends' and (select uid from me) is not null
    union
    select p.user_id
    from public.profiles p
    where p_scope = 'global' and p.handle is not null
  ),
  windowed as (
    select
      a.user_id,
      sum(a.correct)::int as score,
      count(*)::int       as att,
      case when sum(a.total) > 0
           then round(100.0 * sum(a.correct)::numeric / sum(a.total), 1)
           else 0
      end as accuracy
    from public.attempts a
    where p_window_days is not null
      and a.created_at >= now() - make_interval(days => p_window_days)
    group by a.user_id
  ),
  alltime as (
    select
      up.user_id,
      coalesce((up.data->>'totalCorrect')::int, 0) as score,
      coalesce((up.data->>'totalAttempts')::int, 0) as att,
      case
        when coalesce((up.data->>'totalQuestions')::int, 0) > 0
        then round(
          100.0 * coalesce((up.data->>'totalCorrect')::int, 0)::numeric
                / coalesce((up.data->>'totalQuestions')::int, 1),
          1
        )
        else null
      end as accuracy
    from public.user_progress up
  ),
  base as (
    select
      c.uid as user_id,
      case when p_window_days is null then coalesce(a.score, 0)    else coalesce(w.score, 0)    end as score,
      case when p_window_days is null then coalesce(a.att, 0)      else coalesce(w.att, 0)      end as att,
      case when p_window_days is null then a.accuracy else w.accuracy end as accuracy
    from candidates c
    left join windowed w on w.user_id = c.uid
    left join alltime  a on a.user_id = c.uid
  ),
  ranked as (
    select b.*, rank() over (order by b.score desc, b.att desc) as rnk
    from base b
  )
  select
    r.user_id,
    p.handle,
    p.display_name,
    p.avatar_url,
    r.score,
    r.att as attempts,
    r.accuracy,
    coalesce((up.data->>'streak')::int, 0) as streak,
    (r.user_id = (select uid from me)) as is_self,
    r.rnk::int as rank
  from ranked r
  join public.profiles p on p.user_id = r.user_id
  left join public.user_progress up on up.user_id = r.user_id
  where (select uid from me) is not null
  order by r.rnk asc, p.handle asc nulls last
  limit greatest(p_limit, 1);
$$;

create or replace function public.my_leaderboard_rank(
  p_scope text,
  p_window_days int
) returns table (
  rank int,
  score int,
  total_players int
)
language sql
security definer
set search_path = public
as $$
  with me as (select auth.uid() as uid),
  candidates as (
    select case when f.requester_id = (select uid from me) then f.addressee_id else f.requester_id end as uid
    from public.friendships f
    where p_scope = 'friends'
      and f.status = 'accepted'
      and (select uid from me) in (f.requester_id, f.addressee_id)
    union
    select (select uid from me)
    where p_scope = 'friends' and (select uid from me) is not null
    union
    select p.user_id
    from public.profiles p
    where p_scope = 'global' and p.handle is not null
  ),
  windowed as (
    select a.user_id, sum(a.correct)::int as score
    from public.attempts a
    where p_window_days is not null
      and a.created_at >= now() - make_interval(days => p_window_days)
    group by a.user_id
  ),
  alltime as (
    select up.user_id, coalesce((up.data->>'totalCorrect')::int, 0) as score
    from public.user_progress up
  ),
  base as (
    select
      c.uid as user_id,
      case when p_window_days is null then coalesce(a.score, 0) else coalesce(w.score, 0) end as score
    from candidates c
    left join windowed w on w.user_id = c.uid
    left join alltime  a on a.user_id = c.uid
  ),
  ranked as (
    select b.*,
           rank() over (order by b.score desc) as rnk,
           count(*) over () as total
    from base b
  )
  select r.rnk::int, r.score, r.total::int
  from ranked r
  where r.user_id = (select uid from me);
$$;

grant execute on function public.leaderboard(text, int, int) to authenticated;
grant execute on function public.my_leaderboard_rank(text, int) to authenticated;
