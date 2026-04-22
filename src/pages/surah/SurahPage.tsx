import { Link, Navigate, useParams } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Icon, type IconName } from '@/components/ui/Icon'
import { SURAH_BY_ID } from '@/data/quran'
import { hasMediumData } from '@/data/distractors'
import { getProgress, type Tier } from '@/lib/progress'

type PrecisionTier = Exclude<Tier, 'foundations'>

const TIERS: Array<{
  key: PrecisionTier
  label: string
  tone: 'easy' | 'medium' | 'hard' | 'hero'
  eyebrow: string
  needsMedium: boolean
}> = [
  { key: 'easy', label: 'Easy', tone: 'easy', eyebrow: 'Tier 1', needsMedium: false },
  { key: 'medium', label: 'Medium', tone: 'medium', eyebrow: 'Tier 2', needsMedium: true },
  { key: 'hard', label: 'Hard', tone: 'hard', eyebrow: 'Tier 3', needsMedium: true },
  { key: 'expert', label: 'Expert', tone: 'hero', eyebrow: 'Tier 4', needsMedium: true },
]

interface Challenge {
  to: string
  label: string
  icon: IconName
  description: string
}

export function SurahPage() {
  const { surahId } = useParams<{ surahId: string }>()
  const id = Number(surahId)
  const surah = SURAH_BY_ID.get(id)
  if (!surah) return <Navigate to="/home" replace />

  const mediumReady = hasMediumData(id)
  const mastery = getProgress().surahs[String(id)] ?? {}

  const challenges: Challenge[] = [
    {
      to: `/drill/${id}/wordorder`,
      label: 'Word order',
      icon: 'shuffle',
      description: 'Tap words in recitation order',
    },
    surah.versesCount >= 2 && {
      to: `/drill/${id}/scramble`,
      label: 'Scramble',
      icon: 'sparkles',
      description: 'Sequence a shuffled ayah',
    },
    {
      to: `/drill/${id}/audio`,
      label: 'Audio cue',
      icon: 'ear',
      description: 'Hear, then pick the ayah',
    },
    surah.versesCount >= 3 && {
      to: `/drill/${id}/endings`,
      label: 'Endings',
      icon: 'feather',
      description: 'Match the fāṣila / rhyme-word',
    },
    surah.versesCount >= 2 && {
      to: `/drill/${id}/continue`,
      label: 'Continue',
      icon: 'arrow-r',
      description: 'Chain through every ayah',
    },
    mediumReady && surah.versesCount >= 2 && {
      to: `/drill/${id}/passage`,
      label: 'Passage',
      icon: 'book',
      description: 'Multi-ayah blanks in context',
    },
    {
      to: `/drill/${id}/recite`,
      label: 'Murājaʿah',
      icon: 'star',
      description: 'Reveal, self-judge solid / shaky / missed',
    },
  ].filter(Boolean) as Challenge[]

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MushafGrid />

      <header className="relative mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 pt-3 sm:px-6 sm:pt-5">
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <Icon name="chevron" size={14} className="rotate-180" />
          Home
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to={`/listen/${id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-card px-3 py-1.5 text-[12px] font-bold text-ink-soft shadow-soft-sm transition-colors hover:border-hero hover:text-hero-deep"
          >
            <Icon name="play" size={12} />
            Listen
          </Link>
          <Link
            to={`/judge/${id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-card px-3 py-1.5 text-[12px] font-bold text-ink-soft shadow-soft-sm transition-colors hover:border-hero hover:text-hero-deep"
          >
            <Icon name="eye" size={12} />
            Judge
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-5 pb-20 pt-5 sm:px-6 sm:pt-7">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
          Sūrah · {String(id).padStart(3, '0')}
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <h1 className="text-balance text-[24px] font-extrabold tracking-tight text-ink sm:text-[32px]">
            {surah.nameComplex}
          </h1>
          <div
            dir="rtl"
            className="text-[22px] font-medium text-ink-soft sm:text-[26px]"
            style={{ fontFamily: 'var(--font-arabic-ui)' }}
          >
            {surah.nameArabic}
          </div>
        </div>
        <div className="mt-1 text-[13px] text-ink-muted">{surah.versesCount} āyāt</div>

        <section className="mt-8">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
            Precision · Fill-in-the-blank
          </div>
          <h2 className="mt-2 text-[18px] font-extrabold tracking-tight text-ink sm:text-[22px]">
            Climb the ladder.
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {TIERS.map((t) => {
              const available = !t.needsMedium || mediumReady
              const rec = mastery[t.key]
              const tone = t.tone
              if (!available) {
                return (
                  <div
                    key={t.key}
                    className="flex flex-col gap-1 rounded-[14px] border border-hairline bg-bg-sunk px-3 py-3 opacity-60 sm:px-4"
                  >
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                      {t.eyebrow}
                    </div>
                    <div className="text-[15px] font-extrabold tracking-tight text-ink-muted">
                      {t.label}
                    </div>
                    <div className="text-[11px] text-ink-muted">Locked — needs data</div>
                  </div>
                )
              }
              return (
                <Link
                  key={t.key}
                  to={`/drill/${id}/${t.key}`}
                  className="flex flex-col gap-1 rounded-[14px] border px-3 py-3 shadow-soft-sm transition-transform hover:-translate-y-[1px] sm:px-4"
                  style={{
                    borderColor: `color-mix(in oklch, var(--color-${tone}) 45%, transparent)`,
                    background: `color-mix(in oklch, var(--color-${tone}-soft) 65%, var(--color-card))`,
                  }}
                >
                  <div
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: `var(--color-${tone}-deep)` }}
                  >
                    {t.eyebrow}
                  </div>
                  <div className="text-[15px] font-extrabold tracking-tight text-ink">
                    {t.label}
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    {rec ? `Best ${rec.bestScore}%` : 'Not attempted'}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="mt-10 sm:mt-14">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
            Challenges · Different formats
          </div>
          <h2 className="mt-2 text-[18px] font-extrabold tracking-tight text-ink sm:text-[22px]">
            Test from every angle.
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-3">
            {challenges.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="flex items-start gap-3 rounded-[14px] border border-hairline bg-card px-4 py-3 shadow-soft-sm transition-colors hover:bg-bg-sunk"
              >
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md border border-hairline bg-bg-sunk text-ink-soft">
                  <Icon name={c.icon} size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold text-ink">{c.label}</div>
                  <div className="mt-0.5 text-[12px] leading-snug text-ink-muted">
                    {c.description}
                  </div>
                </div>
                <Icon
                  name="arrow-r"
                  size={14}
                  className="mt-1 shrink-0 text-ink-muted"
                />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
