import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  fetchLeaderboard,
  fetchMyLeaderboardRank,
  type LeaderboardRow,
  type LeaderboardScope,
  type LeaderboardWindow,
  type MyRank,
} from '@/lib/leaderboard'
import { errMsg, getMyProfile, type PublicProfile } from '@/lib/friends'
import { cn } from '@/lib/cn'

const WINDOWS: { value: LeaderboardWindow; label: string }[] = [
  { value: 1, label: 'Today' },
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: null, label: 'All-time' },
]

const SCOPES: { value: LeaderboardScope; label: string; icon: 'users' | 'star' }[] = [
  { value: 'friends', label: 'Friends', icon: 'users' },
  { value: 'global', label: 'Global', icon: 'star' },
]

export function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [scope, setScope] = useState<LeaderboardScope>('friends')
  const [window, setWindow] = useState<LeaderboardWindow>(null)
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [myRank, setMyRank] = useState<MyRank | null>(null)
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    void getMyProfile().then(setProfile).catch(() => {})
  }, [user])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [list, mine] = await Promise.all([
        fetchLeaderboard({ scope, window }),
        scope === 'global'
          ? fetchMyLeaderboardRank({ scope, window })
          : Promise.resolve(null),
      ])
      setRows(list)
      setMyRank(mine)
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }, [scope, window])

  useEffect(() => {
    if (!user) return
    void load()
  }, [user, load])

  if (authLoading) return null
  if (!isSupabaseConfigured) return <Navigate to="/home" replace />
  if (!user) return <Navigate to="/login" replace />

  const callerInList = rows.some((r) => r.is_self)
  const showMyRankFooter = scope === 'global' && !callerInList && myRank && profile?.handle
  const globalMissingHandle = scope === 'global' && !profile?.handle

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
          Leaderboard
        </div>
        <Link
          to="/friends"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <Icon name="users" size={14} />
          Friends
        </Link>
      </header>

      <main className="relative mx-auto max-w-3xl px-5 pt-6 pb-20 sm:px-6 sm:pt-8">
        <h1 className="text-balance text-[26px] font-extrabold tracking-tight text-ink sm:text-[32px]">
          Leaderboard
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Score = correct answers in window. Ties share rank.
        </p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {SCOPES.map((s) => (
            <ChipBtn
              key={s.value}
              active={scope === s.value}
              onClick={() => setScope(s.value)}
            >
              <Icon name={s.icon} size={13} />
              {s.label}
            </ChipBtn>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {WINDOWS.map((w) => (
            <ChipBtn
              key={String(w.value)}
              active={window === w.value}
              onClick={() => setWindow(w.value)}
            >
              {w.label}
            </ChipBtn>
          ))}
        </div>

        {globalMissingHandle && (
          <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-[13px] text-amber-900 shadow-soft-sm">
            Set a{' '}
            <Link to="/friends" className="font-bold underline">
              handle
            </Link>{' '}
            to appear on the global board.
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-[13px] text-rose-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 text-center text-[13px] text-ink-muted">Loading…</div>
        ) : rows.length === 0 ? (
          <EmptyState scope={scope} window={window} />
        ) : (
          <>
            <ol className="mt-6 space-y-2">
              {rows.map((r) => (
                <Row key={r.user_id} row={r} />
              ))}
            </ol>
            {showMyRankFooter && myRank && (
              <div className="mt-3 rounded-2xl border border-hero/50 bg-hero-soft p-3 text-[13px] shadow-soft-sm sm:p-4">
                <div className="flex items-center gap-3">
                  <RankBadge rank={myRank.rank} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-extrabold text-ink">
                      You · #{myRank.rank} of {myRank.total_players}
                    </div>
                    <div className="text-[12px] text-ink-muted">
                      Keep drilling to climb the board.
                    </div>
                  </div>
                  <div className="text-[18px] font-extrabold tracking-tight text-ink">
                    {myRank.score.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function EmptyState({
  scope,
  window,
}: {
  scope: LeaderboardScope
  window: LeaderboardWindow
}) {
  if (scope === 'friends') {
    return (
      <div className="mt-8 rounded-2xl border border-hairline bg-card p-6 text-center text-[13px] text-ink-muted shadow-soft-sm">
        {window === null ? (
          <>Add friends to see the board fill up.</>
        ) : (
          <>No drills logged in this window yet — by you or your friends.</>
        )}
        <div className="mt-3">
          <Link
            to="/friends"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-bold text-bg shadow-soft-sm hover:opacity-90"
          >
            <Icon name="user-plus" size={14} />
            Find friends
          </Link>
        </div>
      </div>
    )
  }
  return (
    <div className="mt-8 rounded-2xl border border-hairline bg-card p-6 text-center text-[13px] text-ink-muted shadow-soft-sm">
      {window === null
        ? 'No one has set a handle yet.'
        : 'No drills logged in this window yet.'}
    </div>
  )
}

function Row({ row }: { row: LeaderboardRow }) {
  const showAccuracy = row.accuracy !== null && row.attempts >= 5
  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-2xl border p-3 shadow-soft-sm sm:p-4',
        row.is_self ? 'border-hero/50 bg-hero-soft' : 'border-hairline bg-card',
      )}
    >
      <RankBadge rank={row.rank} />
      <Avatar row={row} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-extrabold text-ink">
          {row.display_name ?? row.handle ?? 'Anonymous'}
          {row.is_self && (
            <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-bg">
              you
            </span>
          )}
        </div>
        <div className="truncate text-[12px] text-ink-muted">
          {row.handle ? `@${row.handle}` : '\u00A0'}
        </div>
      </div>
      <div className="text-right">
        <div className="text-[18px] font-extrabold tracking-tight text-ink">
          {row.score.toLocaleString()}
        </div>
        <div className="flex items-center justify-end gap-2 text-[11px] text-ink-muted">
          <span>{row.attempts} drills</span>
          {showAccuracy && (
            <>
              <span>·</span>
              <span>{Number(row.accuracy).toFixed(0)}%</span>
            </>
          )}
          <span>·</span>
          <span>{row.streak}d</span>
        </div>
      </div>
    </li>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const tone =
    rank === 1
      ? 'bg-amber-400 text-amber-950'
      : rank === 2
        ? 'bg-zinc-300 text-zinc-900'
        : rank === 3
          ? 'bg-orange-300 text-orange-950'
          : 'border border-hairline bg-card text-ink-muted'
  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold',
        tone,
      )}
    >
      {rank}
    </span>
  )
}

function Avatar({ row }: { row: LeaderboardRow }) {
  const initial = (row.display_name || row.handle || '?').charAt(0).toUpperCase()
  if (row.avatar_url) {
    return (
      <img
        src={row.avatar_url}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    )
  }
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-hero text-[13px] font-extrabold text-white">
      {initial}
    </span>
  )
}

function ChipBtn({
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
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold shadow-soft-sm transition-colors',
        active
          ? 'bg-ink text-bg'
          : 'border border-hairline bg-card text-ink-soft hover:border-hero hover:text-hero-deep',
      )}
    >
      {children}
    </button>
  )
}
