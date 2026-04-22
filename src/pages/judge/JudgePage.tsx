import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Icon } from '@/components/ui/Icon'
import { SURAH_BY_ID } from '@/data/quran'
import { recordAttempt } from '@/lib/progress'
import { cn } from '@/lib/cn'

type Mark = 'missed' | 'shaky' | 'solid'

const MARK_META: Record<Mark, { label: string; tone: string; deep: string; score: number }> = {
  missed: { label: 'Missed', tone: 'var(--color-incorrect)', deep: 'var(--color-incorrect)', score: 0 },
  shaky: { label: 'Shaky', tone: 'var(--color-medium)', deep: 'var(--color-medium-deep)', score: 0.5 },
  solid: { label: 'Solid', tone: 'var(--color-correct)', deep: 'var(--color-correct)', score: 1 },
}

export function JudgePage() {
  const { surahId: sid } = useParams<{ surahId: string }>()
  const surahId = Number(sid)
  const surah = SURAH_BY_ID.get(surahId)

  const ayat = useMemo(() => surah?.ayat ?? [], [surah])
  const [marks, setMarks] = useState<Record<number, Mark>>({})
  const [showText, setShowText] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  if (!surah) return <Navigate to="/home" replace />

  const total = ayat.length
  const judged = Object.keys(marks).length
  const tally = {
    missed: ayat.filter((a) => marks[a.number] === 'missed').length,
    shaky: ayat.filter((a) => marks[a.number] === 'shaky').length,
    solid: ayat.filter((a) => marks[a.number] === 'solid').length,
  }

  const mark = (ayahNumber: number, m: Mark) => {
    setMarks((prev) => ({ ...prev, [ayahNumber]: m }))
  }

  const endSession = () => {
    if (judged === 0) return
    const score = ayat.reduce(
      (s, a) => s + (marks[a.number] ? MARK_META[marks[a.number]].score : 0),
      0,
    )
    const correct = Math.round(score)
    recordAttempt({ tier: 'medium', surahId, correct, total: judged })
    setSubmitted(true)
  }

  const reset = () => {
    setMarks({})
    setSubmitted(false)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MushafGrid />

      <header className="relative mx-auto flex max-w-3xl items-center justify-between px-6 pt-6 sm:pt-8">
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <Icon name="x" size={14} />
          Exit
        </Link>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
          Judge · {surah.nameComplex}
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-3xl px-6 pb-28 pt-8">
        <h1 className="text-balance text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
          Judge mode
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          One reads, one judges. Tap a mark per ayah as the reciter recites. Mushaf text is optional — hide it for blind judging.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft">
            <input
              type="checkbox"
              checked={showText}
              onChange={(e) => setShowText(e.target.checked)}
            />
            Show mushaf
          </label>
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted">
            {judged} / {total} judged
          </div>
          {judged > 0 && (
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em]">
              <span style={{ color: MARK_META.solid.deep }}>{tally.solid} solid</span>
              <span className="text-ink-muted">·</span>
              <span style={{ color: MARK_META.shaky.deep }}>{tally.shaky} shaky</span>
              <span className="text-ink-muted">·</span>
              <span style={{ color: MARK_META.missed.deep }}>{tally.missed} missed</span>
            </div>
          )}
        </div>

        {submitted ? (
          <div className="mt-8 rounded-xl border border-hairline bg-card p-6 shadow-soft-sm">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
              Session recorded
            </div>
            <p className="mt-2 text-[14px] text-ink">
              {tally.solid} solid · {tally.shaky} shaky · {tally.missed} missed across {judged} ayah{judged === 1 ? '' : 's'}.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-card px-3 py-1.5 text-[12px] font-bold text-ink-soft transition-colors hover:bg-bg-sunk"
              >
                <Icon name="shuffle" size={12} />
                Judge again
              </button>
              <Link
                to="/home"
                className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-card px-3 py-1.5 text-[12px] font-bold text-ink-soft transition-colors hover:bg-bg-sunk"
              >
                Back home
                <Icon name="arrow-r" size={12} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-3">
              {ayat.map((a) => {
                const m = marks[a.number]
                return (
                  <div
                    key={a.number}
                    className={cn(
                      'rounded-xl border bg-card p-4 shadow-soft-sm transition-colors',
                    )}
                    style={{
                      borderColor: m ? MARK_META[m].tone : 'var(--color-hairline)',
                      background: m
                        ? `color-mix(in oklch, ${MARK_META[m].tone} 8%, var(--color-card))`
                        : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                        Ayah {a.number}
                      </span>
                      {m && (
                        <span
                          className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
                          style={{ color: MARK_META[m].deep }}
                        >
                          {MARK_META[m].label}
                        </span>
                      )}
                    </div>
                    {showText && (
                      <div
                        dir="rtl"
                        className="mt-3 text-center text-ink"
                        style={{
                          fontFamily: 'var(--font-arabic-ayah)',
                          fontSize: 'clamp(20px, 4.5vw, 26px)',
                          lineHeight: 2,
                        }}
                      >
                        {a.text}
                      </div>
                    )}
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {(['missed', 'shaky', 'solid'] as const).map((opt) => {
                        const active = m === opt
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => mark(a.number, opt)}
                            className="rounded-md border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors"
                            style={{
                              borderColor: active
                                ? MARK_META[opt].tone
                                : 'var(--color-hairline)',
                              background: active
                                ? `color-mix(in oklch, ${MARK_META[opt].tone} 18%, transparent)`
                                : 'var(--color-card)',
                              color: active
                                ? MARK_META[opt].deep
                                : 'var(--color-ink-soft)',
                            }}
                          >
                            {MARK_META[opt].label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={endSession}
                disabled={judged === 0}
                className="inline-flex items-center gap-1.5 rounded-[14px] border border-hero/40 bg-hero-soft px-5 py-3 text-[14px] font-bold text-hero-deep shadow-soft-sm transition-colors hover:bg-hero/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="check" size={14} />
                End session · record
              </button>
              {judged > 0 && (
                <button
                  type="button"
                  onClick={() => setMarks({})}
                  className="inline-flex items-center gap-1.5 rounded-[14px] border border-hairline bg-card px-5 py-3 text-[14px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk"
                >
                  <Icon name="x" size={14} />
                  Clear marks
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
