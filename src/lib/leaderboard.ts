import { supabase } from './supabase'

export interface LeaderboardRow {
  user_id: string
  handle: string | null
  display_name: string | null
  avatar_url: string | null
  total_correct: number
  total_attempts: number
  streak: number
  score: number
  is_self: boolean
}

export async function fetchFriendLeaderboard(): Promise<LeaderboardRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('friend_leaderboard')
  if (error) throw error
  return (data ?? []) as LeaderboardRow[]
}
