import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { fetchFriendLeaderboard, type LeaderboardRow } from '@/lib/leaderboard'
import { cn } from '@/lib/cn'

export function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const data = await fetchFriendLeaderboard()
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
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
          You &amp; your friends
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Score = correct answers + streak × 10 · all-time.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-[13px] text-rose-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 text-center text-[13px] text-ink-muted">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-hairline bg-card p-6 text-center text-[13px] text-ink-muted shadow-soft-sm">
            No one to rank yet. Add friends to see the board fill up.
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
        ) : (
          <ol className="mt-6 space-y-2">
            {rows.map((r, i) => (
              <li
                key={r.user_id}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border p-3 shadow-soft-sm sm:p-4',
                  r.is_self
                    ? 'border-hero/50 bg-hero-soft'
                    : 'border-hairline bg-card',
                )}
              >
                <RankBadge rank={i + 1} />
                <Avatar row={r} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-extrabold text-ink">
                    {r.display_name ?? r.handle ?? 'Anonymous'}
                    {r.is_self && (
                      <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-bg">
                        you
                      </span>
                    )}
                  </div>
                  {r.handle && (
                    <div className="truncate text-[12px] text-ink-muted">@{r.handle}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[18px] font-extrabold tracking-tight text-ink">
                    {r.score.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-end gap-2 text-[11px] text-ink-muted">
                    <span>{r.total_correct} ✓</span>
                    <span>·</span>
                    <span>{r.streak}d</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
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
          : 'bg-card text-ink-muted border border-hairline'
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
