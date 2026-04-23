import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  acceptFriendRequest,
  declineFriendRequest,
  errMsg,
  getMyProfile,
  listFriendships,
  removeFriendship,
  searchUsers,
  sendFriendRequest,
  setFriendable,
  setHandle,
  type FriendEntry,
  type PublicProfile,
} from '@/lib/friends'
import { cn } from '@/lib/cn'

type Tab = 'friends' | 'incoming' | 'outgoing'

export function FriendsPage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [accepted, setAccepted] = useState<FriendEntry[]>([])
  const [incoming, setIncoming] = useState<FriendEntry[]>([])
  const [outgoing, setOutgoing] = useState<FriendEntry[]>([])
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState<Tab>('friends')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [p, f] = await Promise.all([getMyProfile(), listFriendships()])
      setProfile(p)
      setAccepted(f.accepted)
      setIncoming(f.incoming)
      setOutgoing(f.outgoing)
      setBlockedIds(f.blockedIds)
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    void load()
  }, [user, load])

  if (authLoading) return null
  if (!isSupabaseConfigured) return <Navigate to="/home" replace />
  if (!user) return <Navigate to="/login" replace />

  const pendingIds = useMemo(() => {
    const ids = new Set<string>()
    for (const e of accepted) ids.add(e.other.user_id)
    for (const e of incoming) ids.add(e.other.user_id)
    for (const e of outgoing) ids.add(e.other.user_id)
    return ids
  }, [accepted, incoming, outgoing])

  const hasHandle = Boolean(profile?.handle)

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MushafGrid />

      <header className="relative mx-auto flex max-w-3xl items-center justify-between px-5 pt-3 sm:px-6 sm:pt-5">
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <Icon name="x" size={14} />
          Back
        </Link>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
          Friends
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-2xl px-5 pb-20 pt-6 sm:px-6 sm:pt-10">
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
          Drill together.
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Pick a handle so friends can find you. Send a request, accept requests, and line up for leaderboards.
        </p>

        {error && (
          <div className="mt-6 rounded-[14px] border border-hard/40 bg-hard-soft px-4 py-3 text-[13px] text-hard-deep">
            {error}
          </div>
        )}

        <HandleSection profile={profile} onSaved={load} />

        {hasHandle && (
          <>
            <FindFriends
              pendingIds={pendingIds}
              blockedIds={blockedIds}
              meId={user.id}
              onRequested={load}
            />

            <section className="mt-10">
              <div className="flex items-center gap-2">
                <TabBtn active={tab === 'friends'} onClick={() => setTab('friends')}>
                  Friends · {accepted.length}
                </TabBtn>
                <TabBtn active={tab === 'incoming'} onClick={() => setTab('incoming')}>
                  Requests · {incoming.length}
                </TabBtn>
                <TabBtn active={tab === 'outgoing'} onClick={() => setTab('outgoing')}>
                  Sent · {outgoing.length}
                </TabBtn>
              </div>

              <div className="mt-4 grid gap-2">
                {loading && (
                  <div className="text-[13px] text-ink-muted">Loading…</div>
                )}
                {!loading && tab === 'friends' && (
                  <FriendList
                    entries={accepted}
                    emptyText="No friends yet. Search above to add someone."
                    action={(e) => (
                      <ActionBtn
                        tone="danger"
                        onClick={async () => {
                          await removeFriendship(e.other.user_id)
                          await load()
                        }}
                      >
                        Remove
                      </ActionBtn>
                    )}
                  />
                )}
                {!loading && tab === 'incoming' && (
                  <FriendList
                    entries={incoming}
                    emptyText="No incoming requests."
                    action={(e) => (
                      <div className="flex gap-2">
                        <ActionBtn
                          tone="primary"
                          onClick={async () => {
                            await acceptFriendRequest(e.other.user_id)
                            await load()
                          }}
                        >
                          Accept
                        </ActionBtn>
                        <ActionBtn
                          tone="ghost"
                          onClick={async () => {
                            await declineFriendRequest(e.other.user_id)
                            await load()
                          }}
                        >
                          Decline
                        </ActionBtn>
                      </div>
                    )}
                  />
                )}
                {!loading && tab === 'outgoing' && (
                  <FriendList
                    entries={outgoing}
                    emptyText="No pending requests sent."
                    action={(e) => (
                      <ActionBtn
                        tone="ghost"
                        onClick={async () => {
                          await removeFriendship(e.other.user_id)
                          await load()
                        }}
                      >
                        Cancel
                      </ActionBtn>
                    )}
                  />
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function HandleSection({
  profile,
  onSaved,
}: {
  profile: PublicProfile | null
  onSaved: () => Promise<void>
}) {
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const current = profile?.handle ?? null

  const save = async () => {
    setErr(null)
    setSaving(true)
    try {
      await setHandle(value)
      setValue('')
      await onSaved()
    } catch (e) {
      setErr(errMsg(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-hairline bg-card p-5 shadow-soft-sm">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
        Your handle
      </div>
      {current ? (
        <>
          <div className="mt-2 flex items-center gap-2">
            <div className="text-[18px] font-bold text-ink">@{current}</div>
            <div className="text-[12px] text-ink-muted">· set</div>
          </div>
          <FriendableToggle profile={profile} onSaved={onSaved} />
        </>
      ) : (
        <>
          <h2 className="mt-2 text-[16px] font-bold text-ink">Pick a handle.</h2>
          <p className="mt-1 text-[12px] text-ink-muted">
            3–20 chars. Lowercase letters, digits, or underscore.
          </p>
          <div className="mt-3 flex gap-2">
            <div className="flex flex-1 items-center rounded-[12px] border border-hairline bg-bg px-3 shadow-soft-sm focus-within:border-hero">
              <span className="text-[14px] font-bold text-ink-muted">@</span>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value.toLowerCase())}
                placeholder="handle"
                className="ml-1 w-full bg-transparent py-2.5 text-[14px] text-ink outline-none"
                maxLength={20}
              />
            </div>
            <button
              type="button"
              onClick={save}
              disabled={saving || value.length < 3}
              className="inline-flex items-center justify-center rounded-[12px] bg-ink px-4 text-[13px] font-bold text-bg shadow-soft-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
          {err && (
            <div className="mt-3 rounded-[10px] border border-hard/40 bg-hard-soft px-3 py-2 text-[12px] text-hard-deep">
              {err}
            </div>
          )}
        </>
      )}
    </section>
  )
}

function FriendableToggle({
  profile,
  onSaved,
}: {
  profile: PublicProfile | null
  onSaved: () => Promise<void>
}) {
  const current = profile?.friendable !== false
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const flip = async () => {
    setErr(null)
    setBusy(true)
    try {
      await setFriendable(!current)
      await onSaved()
    } catch (e) {
      setErr(errMsg(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 flex items-start justify-between gap-3 rounded-[12px] border border-hairline bg-bg px-3 py-2.5">
      <div className="min-w-0">
        <div className="text-[13px] font-bold text-ink">Allow friend requests</div>
        <div className="text-[12px] text-ink-muted">
          {current
            ? "Others can send you requests. You still choose what to accept."
            : 'Others can find you but cannot request to add you.'}
        </div>
        {err && (
          <div className="mt-2 rounded-[10px] border border-hard/40 bg-hard-soft px-2.5 py-1.5 text-[11px] text-hard-deep">
            {err}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={flip}
        disabled={busy}
        aria-pressed={current}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          current ? 'bg-ink' : 'bg-hairline',
          busy && 'opacity-60',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-bg shadow-soft-sm transition-transform',
            current ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}

function FindFriends({
  pendingIds,
  blockedIds,
  meId,
  onRequested,
}: {
  pendingIds: Set<string>
  blockedIds: Set<string>
  meId: string
  onRequested: () => Promise<void>
}) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<PublicProfile[]>([])
  const [searching, setSearching] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = window.setTimeout(async () => {
      setSearching(true)
      setErr(null)
      try {
        const r = await searchUsers(q)
        setResults(r)
      } catch (e) {
        setErr(errMsg(e))
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    }
  }, [q])

  return (
    <section className="mt-6">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
        Find friends
      </div>
      <div className="mt-3 flex items-center rounded-[12px] border border-hairline bg-card px-3 shadow-soft-sm focus-within:border-hero">
        <span className="text-[14px] font-bold text-ink-muted">@</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search by handle or name"
          className="ml-1 w-full bg-transparent py-2.5 text-[14px] text-ink outline-none"
        />
      </div>
      {err && (
        <div className="mt-3 rounded-[10px] border border-hard/40 bg-hard-soft px-3 py-2 text-[12px] text-hard-deep">
          {err}
        </div>
      )}
      {q.trim().length >= 2 && (
        <div className="mt-3 grid gap-2">
          {searching && <div className="text-[13px] text-ink-muted">Searching…</div>}
          {!searching && results.length === 0 && (
            <div className="text-[13px] text-ink-muted">No matches.</div>
          )}
          {results.map((r) => {
            const isSelf = r.user_id === meId
            const alreadyPending = pendingIds.has(r.user_id)
            const blocked = blockedIds.has(r.user_id)
            const notFriendable = r.friendable === false
            const disabled = isSelf || alreadyPending || blocked || notFriendable
            const label = isSelf
              ? 'You'
              : alreadyPending
                ? 'Pending'
                : blocked
                  ? 'Unavailable'
                  : notFriendable
                    ? 'Not accepting'
                    : null
            return (
              <div
                key={r.user_id}
                className="flex items-center justify-between gap-3 rounded-[14px] border border-hairline bg-card px-3 py-2.5 shadow-soft-sm"
              >
                <ProfileBadge p={r} />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={async () => {
                    try {
                      await sendFriendRequest(r.user_id)
                      await onRequested()
                      setQ('')
                    } catch (e) {
                      setErr(errMsg(e))
                    }
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors',
                    disabled
                      ? 'border border-hairline bg-bg-sunk text-ink-muted'
                      : 'bg-ink text-bg hover:opacity-90',
                  )}
                >
                  {label ?? (<><Icon name="user-plus" size={12} /> Add</>)}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function FriendList({
  entries,
  emptyText,
  action,
}: {
  entries: FriendEntry[]
  emptyText: string
  action: (e: FriendEntry) => React.ReactNode
}) {
  if (entries.length === 0) {
    return <div className="text-[13px] text-ink-muted">{emptyText}</div>
  }
  return (
    <>
      {entries.map((e) => (
        <div
          key={`${e.row.requester_id}-${e.row.addressee_id}`}
          className="flex items-center justify-between gap-3 rounded-[14px] border border-hairline bg-card px-3 py-2.5 shadow-soft-sm"
        >
          <ProfileBadge p={e.other} />
          {action(e)}
        </div>
      ))}
    </>
  )
}

function ProfileBadge({ p }: { p: PublicProfile }) {
  const initial = (p.display_name ?? p.handle ?? '?').charAt(0).toUpperCase()
  return (
    <div className="flex min-w-0 items-center gap-3">
      {p.avatar_url ? (
        <img
          src={p.avatar_url}
          alt=""
          className="h-9 w-9 rounded-full border border-hairline object-cover"
        />
      ) : (
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-hero text-[13px] font-extrabold text-white">
          {initial}
        </div>
      )}
      <div className="min-w-0">
        <div className="truncate text-[14px] font-bold text-ink">
          {p.display_name ?? (p.handle ? `@${p.handle}` : 'Unknown')}
        </div>
        {p.handle && p.display_name && (
          <div className="truncate text-[12px] text-ink-muted">@{p.handle}</div>
        )}
      </div>
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors',
        active
          ? 'bg-ink text-bg'
          : 'border border-hairline bg-card text-ink-soft hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

function ActionBtn({
  tone,
  onClick,
  children,
}: {
  tone: 'primary' | 'ghost' | 'danger'
  onClick: () => void | Promise<void>
  children: React.ReactNode
}) {
  const cls =
    tone === 'primary'
      ? 'bg-ink text-bg hover:opacity-90'
      : tone === 'danger'
        ? 'border border-hard/40 text-hard-deep hover:bg-hard-soft'
        : 'border border-hairline text-ink-soft hover:text-ink'
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors',
        cls,
      )}
    >
      {children}
    </button>
  )
}
