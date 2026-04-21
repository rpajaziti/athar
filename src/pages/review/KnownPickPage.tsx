import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Wordmark } from '@/components/ui/Wordmark'
import { Icon } from '@/components/ui/Icon'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SURAHS } from '@/data/quran'
import { hasMediumData } from '@/data/distractors'
import {
  getKnown,
  getRasmOnly,
  getReviewTiers,
  setKnown,
  setRasmOnly,
  setReviewTiers,
  type ReviewTier,
} from '@/lib/progress'
import { cn } from '@/lib/cn'

const JUZ_AMMA_RANGE = { start: 78, end: 114 }

const TIER_OPTIONS: { id: ReviewTier; label: string; hint: string }[] = [
  { id: 'easy', label: 'Easy', hint: 'Distractor swaps' },
  { id: 'medium', label: 'Medium', hint: 'Distractors + ayah transitions' },
  { id: 'hard', label: 'Hard', hint: 'Proofread · catch every swap' },
  { id: 'expert', label: 'Expert', hint: 'Construction · build the word' },
]

export function KnownPickPage() {
  const navigate = useNavigate()
  const available = useMemo(
    () => SURAHS.filter((s) => hasMediumData(s.id)),
    [],
  )

  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(getKnown()),
  )
  const [tiers, setTiers] = useState<Set<ReviewTier>>(
    () => new Set(getReviewTiers()),
  )
  const [rasm, setRasm] = useState<boolean>(() => getRasmOnly())

  const toggle = (id: number) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const toggleTier = (tier: ReviewTier) => {
    const next = new Set(tiers)
    if (next.has(tier)) {
      if (next.size === 1) return
      next.delete(tier)
    } else {
      next.add(tier)
    }
    setTiers(next)
  }

  const selectJuzAmma = () => {
    const next = new Set(selected)
    for (const s of available) {
      if (s.id >= JUZ_AMMA_RANGE.start && s.id <= JUZ_AMMA_RANGE.end) {
        next.add(s.id)
      }
    }
    setSelected(next)
  }

  const clearAll = () => setSelected(new Set())
  const selectAll = () => setSelected(new Set(available.map((s) => s.id)))

  const persistAll = () => {
    setKnown(Array.from(selected))
    setReviewTiers(Array.from(tiers))
    setRasmOnly(rasm)
  }

  const save = () => {
    persistAll()
    navigate('/home')
  }

  const saveAndReview = () => {
    persistAll()
    navigate('/review/mixed')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MushafGrid />

      <header className="relative mx-auto flex max-w-3xl items-center justify-between px-6 pt-6 sm:pt-8">
        <Wordmark />
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted"
        >
          <Icon name="chevron" size={14} style={{ transform: 'rotate(180deg)' }} />
          Home
        </Link>
      </header>

      <main className="relative mx-auto max-w-3xl px-6 pt-10 pb-24">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
          Mixed review · Setup
        </div>
        <h1 className="mt-3 text-balance text-[26px] font-extrabold tracking-tight text-ink sm:text-[32px]">
          Pick what you know.
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Mixed review pulls rounds at random from every sūrah you mark here —
          distractor swaps, proofreads, construction, transitions. Change this
          anytime.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectJuzAmma}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hero/40 bg-hero-soft px-3 py-1.5 text-[12px] font-bold text-hero-deep transition-colors hover:bg-hero/10"
          >
            <Icon name="check" size={12} />
            Juz ʿAmma
          </button>
          <button
            type="button"
            onClick={selectAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink transition-colors hover:bg-bg-sunk"
          >
            All seeded ({available.length})
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink transition-colors hover:bg-bg-sunk"
          >
            <Icon name="x" size={12} />
            Clear
          </button>
        </div>

        <div className="mt-8 rounded-xl border border-hairline bg-card p-4">
          <div className="flex items-baseline justify-between gap-3">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
              Difficulty · Which round types appear
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              {tiers.size} on
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIER_OPTIONS.map((opt) => {
              const on = tiers.has(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleTier(opt.id)}
                  className={cn(
                    'flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors',
                    on
                      ? 'border-hero bg-hero-soft text-hero-deep'
                      : 'border-hairline bg-card text-ink hover:bg-bg-sunk',
                  )}
                >
                  <span className="text-[13px] font-bold">{opt.label}</span>
                  <span
                    className={cn(
                      'text-[11px]',
                      on ? 'text-hero-deep/80' : 'text-ink-muted',
                    )}
                  >
                    {opt.hint}
                  </span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => setRasm(!rasm)}
            className={cn(
              'mt-3 flex w-full items-start justify-between gap-3 rounded-lg border p-3 text-left transition-colors',
              rasm
                ? 'border-hero bg-hero-soft'
                : 'border-hairline bg-card hover:bg-bg-sunk',
            )}
          >
            <div>
              <div
                className={cn(
                  'text-[13px] font-bold',
                  rasm ? 'text-hero-deep' : 'text-ink',
                )}
              >
                Rasm only · Strip ḥarakāt
              </div>
              <div
                className={cn(
                  'mt-0.5 text-[11px]',
                  rasm ? 'text-hero-deep/80' : 'text-ink-muted',
                )}
              >
                Ayah renders without vowel marks — read by the letter skeleton
                alone. Options keep full ḥarakāt.
              </div>
            </div>
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border',
                rasm
                  ? 'border-hero bg-hero text-bg'
                  : 'border-hairline bg-card',
              )}
            >
              {rasm && <Icon name="check" size={14} strokeWidth={3} />}
            </span>
          </button>
        </div>

        <ul className="mt-6 grid gap-2">
          {available.map((s) => {
            const isOn = selected.has(s.id)
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => toggle(s.id)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors',
                    isOn
                      ? 'border-hero bg-hero-soft shadow-soft-sm'
                      : 'border-hairline bg-card hover:bg-bg-sunk',
                  )}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[11px] font-bold text-ink-muted">
                      {String(s.id).padStart(3, '0')}
                    </span>
                    <span className="text-[15px] font-bold text-ink">
                      {s.nameComplex}
                    </span>
                    <span
                      dir="rtl"
                      className="text-[16px] text-ink-soft"
                      style={{ fontFamily: 'var(--font-arabic-ui)' }}
                    >
                      {s.nameArabic}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border',
                      isOn
                        ? 'border-hero bg-hero text-bg'
                        : 'border-hairline bg-card',
                    )}
                  >
                    {isOn && <Icon name="check" size={14} strokeWidth={3} />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <PrimaryButton
            tone="hero"
            disabled={selected.size === 0}
            onClick={saveAndReview}
          >
            {selected.size === 0
              ? 'Pick at least one sūrah'
              : `Save & start review · ${selected.size}`}
            {selected.size > 0 && <Icon name="arrow-r" size={16} />}
          </PrimaryButton>
          <button
            type="button"
            onClick={save}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-hairline bg-card px-6 py-4 text-[15px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk sm:w-auto sm:px-8"
          >
            Save only
          </button>
        </div>
      </main>
    </div>
  )
}
