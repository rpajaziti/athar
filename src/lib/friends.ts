import { supabase } from './supabase'

export interface PublicProfile {
  user_id: string
  handle: string | null
  display_name: string | null
  avatar_url: string | null
}

export interface FriendshipRow {
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
}

export interface FriendEntry {
  other: PublicProfile
  row: FriendshipRow
  direction: 'incoming' | 'outgoing' | 'mutual'
}

export async function getMyProfile(): Promise<PublicProfile | null> {
  if (!supabase) return null
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id
  if (!uid) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, handle, display_name, avatar_url')
    .eq('user_id', uid)
    .maybeSingle()
  if (error) throw error
  return (data as PublicProfile | null) ?? null
}

export async function setHandle(handle: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id
  if (!uid) throw new Error('Not signed in')
  const normalized = handle.trim().toLowerCase()
  if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
    throw new Error('Handle must be 3–20 chars, lowercase letters, digits, or underscore.')
  }
  const { error } = await supabase
    .from('profiles')
    .update({ handle: normalized })
    .eq('user_id', uid)
  if (error) {
    if (error.code === '23505') throw new Error('That handle is taken.')
    throw error
  }
}

export async function searchUsers(query: string): Promise<PublicProfile[]> {
  if (!supabase) return []
  const q = query.trim()
  if (q.length < 2) return []
  const { data, error } = await supabase.rpc('search_users', { q })
  if (error) throw error
  return (data ?? []) as PublicProfile[]
}

export async function listFriendships(): Promise<{
  accepted: FriendEntry[]
  incoming: FriendEntry[]
  outgoing: FriendEntry[]
}> {
  if (!supabase) return { accepted: [], incoming: [], outgoing: [] }
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id
  if (!uid) return { accepted: [], incoming: [], outgoing: [] }

  const { data: rows, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`)
  if (error) throw error
  const friendships = (rows ?? []) as FriendshipRow[]

  const otherIds = Array.from(
    new Set(friendships.map((r) => (r.requester_id === uid ? r.addressee_id : r.requester_id))),
  )
  let profiles: PublicProfile[] = []
  if (otherIds.length > 0) {
    const { data: ps, error: pErr } = await supabase
      .from('profiles')
      .select('user_id, handle, display_name, avatar_url')
      .in('user_id', otherIds)
    if (pErr) throw pErr
    profiles = (ps ?? []) as PublicProfile[]
  }
  const pById = new Map(profiles.map((p) => [p.user_id, p]))

  const accepted: FriendEntry[] = []
  const incoming: FriendEntry[] = []
  const outgoing: FriendEntry[] = []

  for (const r of friendships) {
    const otherId = r.requester_id === uid ? r.addressee_id : r.requester_id
    const other = pById.get(otherId) ?? {
      user_id: otherId,
      handle: null,
      display_name: null,
      avatar_url: null,
    }
    const entry: FriendEntry = {
      other,
      row: r,
      direction: r.requester_id === uid ? 'outgoing' : 'incoming',
    }
    if (r.status === 'accepted') {
      entry.direction = 'mutual'
      accepted.push(entry)
    } else if (r.status === 'pending') {
      if (r.requester_id === uid) outgoing.push(entry)
      else incoming.push(entry)
    }
  }

  accepted.sort((a, b) => (a.other.handle ?? '').localeCompare(b.other.handle ?? ''))
  return { accepted, incoming, outgoing }
}

export async function sendFriendRequest(targetUserId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id
  if (!uid) throw new Error('Not signed in')
  if (uid === targetUserId) throw new Error("You can't friend yourself.")
  const { error } = await supabase.from('friendships').insert({
    requester_id: uid,
    addressee_id: targetUserId,
    status: 'pending',
  })
  if (error) {
    if (error.code === '23505') throw new Error('Friend request already exists.')
    throw error
  }
}

export async function acceptFriendRequest(requesterId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id
  if (!uid) throw new Error('Not signed in')
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('requester_id', requesterId)
    .eq('addressee_id', uid)
  if (error) throw error
}

export async function removeFriendship(otherUserId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id
  if (!uid) throw new Error('Not signed in')
  const { error } = await supabase
    .from('friendships')
    .delete()
    .or(
      `and(requester_id.eq.${uid},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${uid})`,
    )
  if (error) throw error
}
