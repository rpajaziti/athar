-- Athar · Supabase Phase 2b: friend leaderboard

-- Returns the caller + all their accepted friends, ranked by score.
-- Score = totalCorrect + streak * 10 (simple, all-time). Source data
-- comes from public.user_progress.data JSONB.
create or replace function public.friend_leaderboard()
returns table (
  user_id uuid,
  handle citext,
  display_name text,
  avatar_url text,
  total_correct int,
  total_attempts int,
  streak int,
  score int,
  is_self boolean
)
language sql
security definer
set search_path = public
as $$
  with me as (
    select auth.uid() as uid
  ),
  friend_ids as (
    select case when f.requester_id = (select uid from me)
                then f.addressee_id
                else f.requester_id
           end as other_id
    from public.friendships f
    where f.status = 'accepted'
      and ((select uid from me) in (f.requester_id, f.addressee_id))
  ),
  ids as (
    select (select uid from me) as uid
    union
    select other_id from friend_ids
  )
  select
    p.user_id,
    p.handle,
    p.display_name,
    p.avatar_url,
    coalesce((up.data->>'totalCorrect')::int, 0)   as total_correct,
    coalesce((up.data->>'totalAttempts')::int, 0)  as total_attempts,
    coalesce((up.data->>'streak')::int, 0)         as streak,
    coalesce((up.data->>'totalCorrect')::int, 0)
      + coalesce((up.data->>'streak')::int, 0) * 10 as score,
    (p.user_id = (select uid from me))              as is_self
  from ids i
  join public.profiles p on p.user_id = i.uid
  left join public.user_progress up on up.user_id = i.uid
  where (select uid from me) is not null
  order by score desc, total_correct desc, p.handle asc;
$$;

grant execute on function public.friend_leaderboard() to authenticated;
