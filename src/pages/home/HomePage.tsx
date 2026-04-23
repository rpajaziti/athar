import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Wordmark } from '@/components/ui/Wordmark'
import { Icon } from '@/components/ui/Icon'
import { SURAHS, SURAH_BY_ID } from '@/data/quran'
import {
  getProgress,
  getWeakSlots,
  pickTodaysDrill,
  type Tier,
} from '@/lib/progress'
import { useAuth } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { cn } from '@/lib/cn'

const TIER_META: Record<Exclude<Tier, 'foundations'>, { label: string; tone: string }> = {
  easy: { label: 'E', tone: 'easy' },
  medium: { label: 'M', tone: 'medium' },
  hard: { label: 'H', tone: 'hard' },
  expert: { label: 'X', tone: 'ink' },
}

const TIER_LABEL: Record<Exclude<Tier, 'foundations'>, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
}

function surahJuz(id: number): number {
  if (id === 1) return 1
  if (id >= 78 && id <= 114) return 30
  if (id >= 67) return 29
  if (id >= 58) return 28
  if (id >= 51) return 27
  if (id >= 46) return 26
  return 1
}

const JUZ_NAMES: Record<number, string> = {
  1: 'Juzʾ 1 · Alif-Lām-Mīm',
  26: 'Juzʾ 26 · Ḥā-Mīm',
  27: 'Juzʾ 27 · Qāla fa-mā khaṭbukum',
  28: 'Juzʾ 28 · Qad samiʿa',
  29: 'Juzʾ 29 · Tabāraka',
  30: 'Juzʾ 30 · ʿAmma',
}

interface ReviewTile {
  to: string
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  primary?: boolean
}

export function HomePage() {
  const progress = getProgress()
  const todays = pickTodaysDrill()
  const weakCount = getWeakSlots().length
  const todaysSurah = todays ? SURAH_BY_ID.get(todays.surahId) : null
  const { user, signOut } = useAuth()

  const juzGroups = useMemo(() => {
    const groups = new Map<number, typeof SURAHS>()
    for (const s of SURAHS) {
      const j = surahJuz(s.id)
      const arr = groups.get(j) ?? []
      arr.push(s)
      groups.set(j, arr)
    }
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0])
  }, [])

  const defaultOpenJuz = todays ? surahJuz(todays.surahId) : juzGroups[0]?.[0] ?? 30
  const [openJuz, setOpenJuz] = useState<Set<number>>(
    () => new Set([defaultOpenJuz]),
  )
  const toggleJuz = (j: number) =>
    setOpenJuz((prev) => {
      const next = new Set(prev)
      if (next.has(j)) next.delete(j)
      else next.add(j)
      return next
    })

  const drillTiles: ReviewTile[] = [
    { to: '/review/mixed', icon: 'arrow-r', label: 'Mixed review', primary: true },
    { to: '/review/mixed?timed=60', icon: 'timer', label: '60s sprint' },
  ]
  const musabaqahTiles: ReviewTile[] = [
    { to: '/review/which-surah', icon: 'question', label: 'Which sūrah?' },
    { to: '/review/meaning', icon: 'book', label: 'Meaning match' },
    { to: '/review/next', icon: 'arrow-r', label: 'What comes next' },
    { to: '/review/next?dir=prev', icon: 'chevron', label: 'What came before' },
    { to: '/review/locate', icon: 'target', label: 'Locate phrase' },
    { to: '/review/connect', icon: 'feather', label: 'Connect sūrahs' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MushafGrid />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 pt-3 sm:px-6 sm:pt-5">
        <Wordmark />
        <div className="flex items-center gap-2 sm:gap-3">
          {progress.streak > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-hero/40 bg-hero-soft px-2.5 py-1 text-[11px] font-bold text-hero-deep sm:px-3 sm:text-[12px]">
              <Icon name="target" size={12} />
              {progress.streak}d
            </div>
          )}
          <Link
            to="/bookmarks"
            aria-label="Starred"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            <Icon name="star" size={16} />
            <span className="hidden sm:inline">Starred</span>
          </Link>
          <Link
            to="/examples"
            aria-label="Examples"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            <Icon name="eye" size={16} />
            <span className="hidden sm:inline">Examples</span>
          </Link>
          <Link
            to="/settings"
            aria-label="Settings"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            <Icon name="shield" size={16} />
            <span className="hidden sm:inline">Settings</span>
          </Link>
          {isSupabaseConfigured && user && (
            <>
              <Link
                to="/friends"
                aria-label="Friends"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
              >
                <Icon name="users" size={16} />
                <span className="hidden sm:inline">Friends</span>
              </Link>
              <Link
                to="/leaderboard"
                aria-label="Leaderboard"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
              >
                <Icon name="star" size={16} />
                <span className="hidden sm:inline">Ranks</span>
              </Link>
            </>
          )}
          {isSupabaseConfigured &&
            (user ? (
              <button
                type="button"
                onClick={() => signOut()}
                title={user.email ?? 'Signed in'}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-card px-2.5 py-1 text-[11px] font-bold text-ink-soft shadow-soft-sm transition-colors hover:border-hero hover:text-hero-deep sm:px-3 sm:text-[12px]"
              >
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-hero text-[10px] font-extrabold text-white"
                  aria-hidden
                >
                  {(user.user_metadata?.full_name || user.email || '?')
                    .charAt(0)
                    .toUpperCase()}
                </span>
                <span className="hidden sm:inline">Sign out</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[11px] font-bold text-bg shadow-soft-sm transition-opacity hover:opacity-90 sm:px-3.5 sm:text-[12px]"
              >
                Sign in
                <Icon name="arrow-r" size={12} />
              </Link>
            ))}
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-5 pt-6 pb-20 sm:px-6 sm:pt-8">
        {todays && todaysSurah && (
          <section className="mb-8 rounded-2xl border border-hero/40 bg-hero-soft p-5 shadow-soft-sm sm:mb-12 sm:p-6">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
              Today's drill · Weakest spot
            </div>
            <h2 className="mt-2 text-balance text-[20px] font-extrabold tracking-tight text-ink sm:mt-3 sm:text-[28px]">
              {todaysSurah.nameComplex}{' '}
              <span
                dir="rtl"
                className="text-ink-soft"
                style={{ fontFamily: 'var(--font-arabic-ui)' }}
              >
                {todaysSurah.nameArabic}
              </span>
              <span className="ml-2 text-ink-muted"> · {TIER_LABEL[todays.tier]}</span>
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft sm:text-[14px]">
              Your best on this tier is{' '}
              <span className="font-bold text-hero-deep">{todays.bestScore}%</span>
              . Close the gap — one round.
            </p>
            <Link
              to={`/drill/${todays.surahId}/${todays.tier}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-[14px] bg-ink px-5 py-3 text-[14px] font-bold text-bg shadow-soft-sm transition-colors hover:opacity-90"
            >
              Run {TIER_LABEL[todays.tier]}
              <Icon name="arrow-r" size={14} />
            </Link>
          </section>
        )}

        <section>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
            Foundations · Letter drill
          </div>
          <h2 className="mt-2 text-balance text-[20px] font-extrabold tracking-tight text-ink sm:text-[24px]">
            Warm up on the confusables.
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
            <Link
              to="/drill/foundations"
              className="inline-flex items-center justify-center gap-1.5 rounded-[14px] border border-hairline bg-card px-4 py-3 text-[13px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk sm:text-[14px]"
            >
              Foundations
              <Icon name="arrow-r" size={14} />
            </Link>
            <Link
              to="/drill/write"
              className="inline-flex items-center justify-center gap-1.5 rounded-[14px] border border-hairline bg-card px-4 py-3 text-[13px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk sm:text-[14px]"
            >
              <Icon name="pen" size={14} />
              Draw letter
            </Link>
          </div>
        </section>

        <section className="mt-10 sm:mt-14">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
                Review · Across sūrahs
              </div>
              <h2 className="mt-2 text-balance text-[20px] font-extrabold tracking-tight text-ink sm:text-[24px]">
                Test what you know.
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft sm:text-[14px]">
                {progress.known.length === 0
                  ? 'Mark the sūrahs you know. Reviews shuffle rounds across them — no sūrah as a crutch.'
                  : `Tracking ${progress.known.length} sūrah${progress.known.length === 1 ? '' : 's'}.`}
              </p>
            </div>
            {progress.known.length > 0 && (
              <Link
                to="/review/pick"
                aria-label="Edit selection"
                title="Edit selection"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-hairline bg-card px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft shadow-soft-sm transition-colors hover:border-hero hover:text-hero-deep"
              >
                <Icon name="pen" size={12} />
                Edit
              </Link>
            )}
          </div>

          {progress.known.length === 0 ? (
            <Link
              to="/review/pick"
              className="mt-4 inline-flex items-center gap-1.5 rounded-[14px] bg-ink px-5 py-3 text-[13px] font-bold text-bg shadow-soft-sm transition-colors hover:opacity-90 sm:text-[14px]"
            >
              Pick what you know
              <Icon name="arrow-r" size={14} />
            </Link>
          ) : (
            <>
              <div className="mt-5">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                  Drill what you know
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-3">
                  {drillTiles.map((tile) => (
                    <ReviewTileLink key={tile.to} tile={tile} />
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                  Musābaqah · Competition drills
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-3">
                  {musabaqahTiles.map((tile) => (
                    <ReviewTileLink key={tile.to} tile={tile} />
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {weakCount > 0 && (
          <section className="mt-10 sm:mt-14">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
              Weak-spot review · Targeted
            </div>
            <h2 className="mt-2 text-balance text-[20px] font-extrabold tracking-tight text-ink sm:text-[24px]">
              {weakCount} soft {weakCount === 1 ? 'spot' : 'spots'} to close.
            </h2>
            <Link
              to="/review/weak"
              className="mt-3 inline-flex items-center gap-1.5 rounded-[14px] border border-hero/40 bg-hero-soft px-5 py-3 text-[13px] font-bold text-hero-deep shadow-soft-sm transition-colors hover:bg-hero/10 sm:text-[14px]"
            >
              Start weak-spot review
              <Icon name="arrow-r" size={14} />
            </Link>
          </section>
        )}

        <section className="mt-10 sm:mt-14">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
            Surah drills
          </div>
          <h2 className="mt-2 text-balance text-[20px] font-extrabold tracking-tight text-ink sm:text-[24px]">
            Pick a sūrah.
          </h2>

          <div className="mt-5 grid gap-3">
            {juzGroups.map(([juz, list]) => {
              const isOpen = openJuz.has(juz)
              return (
                <JuzSection
                  key={juz}
                  juz={juz}
                  list={list}
                  open={isOpen}
                  onToggle={() => toggleJuz(juz)}
                  mastery={progress.surahs}
                />
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

function JuzSection({
  juz,
  list,
  open,
  onToggle,
  mastery,
}: {
  juz: number
  list: typeof SURAHS
  open: boolean
  onToggle: () => void
  mastery: ReturnType<typeof getProgress>['surahs']
}) {
  return (
    <div className="rounded-xl border border-hairline bg-card shadow-soft-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-sunk"
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
            {JUZ_NAMES[juz] ?? `Juzʾ ${juz}`}
          </div>
          <div className="text-[11px] text-ink-muted">
            {list.length} sūrah{list.length === 1 ? '' : 's'}
          </div>
        </div>
        <Icon
          name="chevron"
          size={16}
          className={cn(
            'shrink-0 transition-transform duration-200',
            open ? 'rotate-90' : '',
          )}
        />
      </button>

      {open && (
        <div className="border-t border-hairline px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            <Link
              to={`/listen/juz/${juz}`}
              className="inline-flex items-center gap-1 rounded-full border border-hairline bg-card px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted transition-colors hover:border-hero hover:text-hero-deep"
            >
              <Icon name="play" size={10} />
              Listen juzʾ
            </Link>
            <Link
              to={`/review/juz/${juz}/endings`}
              className="inline-flex items-center gap-1 rounded-full border border-hairline bg-card px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted transition-colors hover:border-medium hover:text-medium-deep"
            >
              <Icon name="timer" size={10} />
              Endings sprint
            </Link>
            <Link
              to={`/review/mixed?juz=${juz}&timed=300`}
              className="inline-flex items-center gap-1 rounded-full border border-hairline bg-card px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted transition-colors hover:border-hero hover:text-hero-deep"
            >
              <Icon name="target" size={10} />
              Marathon
            </Link>
          </div>
          <ul className="mt-3 grid gap-2">
            {list.map((s) => (
              <SurahRow key={s.id} surah={s} mastery={mastery[String(s.id)] ?? {}} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ReviewTileLink({ tile }: { tile: ReviewTile }) {
  return (
    <Link
      to={tile.to}
      className={cn(
        'flex min-h-[52px] items-center gap-2 rounded-[14px] border px-3 py-2.5 text-[13px] font-bold shadow-soft-sm transition-colors sm:text-[14px]',
        tile.primary
          ? 'border-hero/40 bg-hero-soft text-hero-deep hover:bg-hero/10'
          : 'border-hairline bg-card text-ink hover:bg-bg-sunk',
      )}
    >
      <Icon name={tile.icon} size={14} />
      <span className="truncate">{tile.label}</span>
    </Link>
  )
}

function SurahRow({
  surah: s,
  mastery,
}: {
  surah: (typeof SURAHS)[number]
  mastery: ReturnType<typeof getProgress>['surahs'][string]
}) {
  const tiersDone = (['easy', 'medium', 'hard', 'expert'] as const).filter(
    (t) => mastery[t],
  )

  return (
    <li>
      <Link
        to={`/surah/${s.id}`}
        className="flex items-center gap-3 rounded-lg border border-hairline bg-card px-3 py-3 transition-colors hover:bg-bg-sunk"
      >
        <span className="font-mono text-[11px] font-bold text-ink-muted">
          {String(s.id).padStart(3, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-[14px] font-bold text-ink">
              {s.nameComplex}
            </span>
            <span
              dir="rtl"
              className="text-[15px] text-ink-soft"
              style={{ fontFamily: 'var(--font-arabic-ui)' }}
            >
              {s.nameArabic}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-[10px] text-ink-muted">
              {s.versesCount} āyāt
            </span>
            {tiersDone.map((t) => {
              const rec = mastery[t]!
              const { label, tone } = TIER_META[t]
              return (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded border px-1 py-0.5 font-mono text-[9px] font-bold"
                  style={{
                    borderColor: `var(--color-${tone})`,
                    color: `var(--color-${tone}-deep, var(--color-${tone}))`,
                    background: `color-mix(in oklch, var(--color-${tone}) 8%, transparent)`,
                  }}
                >
                  {label}·{rec.bestScore}
                </span>
              )
            })}
          </div>
        </div>
        <Icon name="chevron" size={14} className="shrink-0 text-ink-muted" />
      </Link>
    </li>
  )
}
