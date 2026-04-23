import { supabase } from './supabase'

export type LeaderboardScope = 'friends' | 'global'
export type LeaderboardWindow = 1 | 7 | 30 | null

export interface LeaderboardRow {
  user_id: string
  handle: string | null
  display_name: string | null
  avatar_url: string | null
  score: number
  attempts: number
  accuracy: number | null
  streak: number
  is_self: boolean
  rank: number
}

export interface MyRank {
  rank: number
  score: number
  total_players: number
}

export async function fetchLeaderboard(opts: {
  scope: LeaderboardScope
  window: LeaderboardWindow
  limit?: number
}): Promise<LeaderboardRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('leaderboard', {
    p_scope: opts.scope,
    p_window_days: opts.window,
    p_limit: opts.limit ?? 50,
  })
  if (error) throw error
  return (data ?? []) as LeaderboardRow[]
}

export async function fetchMyLeaderboardRank(opts: {
  scope: LeaderboardScope
  window: LeaderboardWindow
}): Promise<MyRank | null> {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('my_leaderboard_rank', {
    p_scope: opts.scope,
    p_window_days: opts.window,
  })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return (row as MyRank | null) ?? null
}
