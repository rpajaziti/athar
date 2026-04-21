import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { AyahCard } from '@/components/drill/AyahCard'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { Icon } from '@/components/ui/Icon'
import { Feedback } from '@/components/ui/Feedback'
import { SURAH_BY_ID } from '@/data/quran'
import { shuffle } from '@/lib/drill'
import { recordMixedAttempt } from '@/lib/progress'
import { cn } from '@/lib/cn'

const ROUNDS_PER_SESSION = 5

interface Round {
  ayahNumber: number
  translation: string
  words: string[]
  pool: { text: string; origIdx: number }[]
}

interface RoundState {
  placed: number[]
  submitted: boolean | null
}

function buildRounds(surahId: number): Round[] | null {
  const surah = SURAH_BY_ID.get(surahId)
  if (!surah) return null
  const candidates = surah.ayat.filter((a) => a.words.length >= 3 && a.words.length <= 8)
  if (candidates.length === 0) return null
  const picks = shuffle(candidates).slice(
    0,
    Math.min(ROUNDS_PER_SESSION, candidates.length),
  )
  return picks.map((ayah) => {
    const words = ayah.words.map((w) => w.text)
    const pool = shuffle(words.map((text, origIdx) => ({ text, origIdx })))
    return {
      ayahNumber: ayah.number,
      translation: ayah.translation,
      words,
      pool,
    }
  })
}

export function WordOrderPage() {
  const { surahId: sid } = useParams<{ surahId: string }>()
  const surahId = Number(sid)
  const surah = SURAH_BY_ID.get(surahId)
  const rounds = useMemo(() => buildRounds(surahId), [surahId])

  if (!surah || !rounds || rounds.length === 0) {
    return <Navigate to="/home" replace />
  }

  return <WordOrderDrill surah={surah.nameComplex} arabicTitle={surah.nameArabic} rounds={rounds} />
}

function WordOrderDrill({
  surah,
  arabicTitle,
  rounds,
}: {
  surah: string
  arabicTitle: string
  rounds: Round[]
}) {
  const total = rounds.length
  const [states, setStates] = useState<RoundState[]>(() =>
    rounds.map(() => ({ placed: [], submitted: null })),
  )
  const [currentIdx, setCurrentIdx] = useState(0)
  const [done, setDone] = useState(false)

  const current = rounds[currentIdx]
  const state = states[currentIdx]
  const expectedLen = current.words.length

  const update = (next: RoundState) => {
    setStates((prev) => prev.map((s, i) => (i === currentIdx ? next : s)))
  }

  const handleTap = (poolIdx: number) => {
    if (state.submitted !== null) return
    if (state.placed.includes(poolIdx)) return
    update({ placed: [...state.placed, poolIdx], submitted: null })
  }

  const handleBackspace = () => {
    if (state.submitted !== null) return
    if (state.placed.length === 0) return
    update({ placed: state.placed.slice(0, -1), submitted: null })
  }

  const handleClear = () => {
    if (state.submitted !== null) return
    update({ placed: [], submitted: null })
  }

  const handleCheck = () => {
    if (state.submitted !== null) return
    if (state.placed.length !== expectedLen) return
    const builtWords = state.placed.map((i) => current.pool[i].text)
    const correct = builtWords.every((w, i) => w === current.words[i])
    update({ placed: state.placed, submitted: correct })
  }

  const handleAdvance = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1)
      return
    }
    const correctCount = states.reduce(
      (n, s) => n + (s.submitted === true ? 1 : 0),
      0,
    )
    recordMixedAttempt(correctCount, total)
    setDone(true)
  }

  const reset = () => {
    setStates(rounds.map(() => ({ placed: [], submitted: null })))
    setCurrentIdx(0)
    setDone(false)
  }

  if (done) {
    const correctCount = states.reduce(
      (n, s) => n + (s.submitted === true ? 1 : 0),
      0,
    )
    return (
      <DrillShell
        eyebrow={`Word order · ${surah} · Results`}
        title={`${correctCount} / ${total} clean`}
        arabicTitle={arabicTitle}
        tone="hero"
        total={total}
        current={total - 1}
      >
        <ul className="grid gap-2">
          {rounds.map((r, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-hairline bg-card p-3 text-[13px]"
            >
              <span className="font-mono text-ink-muted">Ayah {r.ayahNumber}</span>
              <span
                className={cn(
                  'font-bold',
                  states[i].submitted === true ? 'text-correct' : 'text-incorrect',
                )}
              >
                {states[i].submitted === true ? 'Correct' : 'Missed'}
              </span>
            </li>
          ))}
        </ul>
        <PrimaryButton tone="ink" onClick={reset} className="mt-6">
          Try new round
          <Icon name="arrow-r" size={16} />
        </PrimaryButton>
      </DrillShell>
    )
  }

  const builtPreview = state.placed.map((i) => current.pool[i].text).join(' ')

  return (
    <DrillShell
      eyebrow={`Word order · ${surah} · Ayah ${current.ayahNumber} of ${total}`}
      title="Sequence the words."
      arabicTitle={arabicTitle}
      tone="hero"
      total={total}
      current={currentIdx}
    >
      <AyahCard translation={current.translation}>
        <div
          dir="rtl"
          className="min-h-[3em] rounded-lg border px-3 py-3 text-ink"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(22px, 5vw, 30px)',
            lineHeight: 2,
            background:
              state.submitted === true
                ? 'color-mix(in oklch, var(--color-correct) 10%, transparent)'
                : state.submitted === false
                  ? 'color-mix(in oklch, var(--color-incorrect) 10%, transparent)'
                  : 'var(--color-bg-sunk)',
            borderColor:
              state.submitted === true
                ? 'var(--color-correct)'
                : state.submitted === false
                  ? 'var(--color-incorrect)'
                  : 'var(--color-hairline)',
            borderStyle: state.placed.length === 0 ? 'dashed' : 'solid',
            borderWidth: '1.5px',
          }}
        >
          {builtPreview || (
            <span
              className="text-ink-muted"
              style={{ fontFamily: 'var(--font-arabic-ui)', fontSize: 14 }}
              dir="ltr"
            >
              Tap words below to build the ayah
            </span>
          )}
        </div>
      </AyahCard>

      <div className="mt-6 flex items-center justify-between">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hero-deep">
          Pool · Tap in recitation order
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleBackspace}
            disabled={state.submitted !== null || state.placed.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink transition-colors hover:bg-bg-sunk disabled:opacity-50"
          >
            <Icon name="x" size={12} />
            Undo
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={state.submitted !== null || state.placed.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink transition-colors hover:bg-bg-sunk disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {current.pool.map((p, i) => {
          const used = state.placed.includes(i)
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleTap(i)}
              disabled={used || state.submitted !== null}
              dir="rtl"
              className={cn(
                'rounded-lg border bg-card px-3 py-2 text-ink shadow-soft-sm transition-colors',
                used
                  ? 'border-hairline opacity-30'
                  : 'border-hairline hover:border-hero hover:bg-hero-soft',
              )}
              style={{
                fontFamily: 'var(--font-arabic-ayah)',
                fontSize: 'clamp(20px, 4.5vw, 24px)',
              }}
            >
              {p.text}
            </button>
          )
        })}
      </div>

      {state.submitted !== null && (
        <div className="mt-6">
          <Feedback
            show
            correct={state.submitted}
            correctLabel="Ordered"
            incorrectLabel="Out of order"
            correctText={`Ayah ${current.ayahNumber} reads: ${current.words.join(' ')}`}
            incorrectText={`You built: ${builtPreview}. The ayah reads: ${current.words.join(' ')}`}
          />
        </div>
      )}

      {state.submitted === null ? (
        <PrimaryButton
          tone="ink"
          disabled={state.placed.length !== expectedLen}
          onClick={handleCheck}
          className="mt-8"
        >
          {state.placed.length < expectedLen
            ? `Place ${expectedLen - state.placed.length} more · ${state.placed.length}/${expectedLen}`
            : 'Check ayah'}
          {state.placed.length === expectedLen && <Icon name="arrow-r" size={16} />}
        </PrimaryButton>
      ) : (
        <PrimaryButton tone="ink" onClick={handleAdvance} className="mt-8">
          {currentIdx < total - 1 ? 'Next ayah' : 'See results'}
          <Icon name="arrow-r" size={16} />
        </PrimaryButton>
      )}
    </DrillShell>
  )
}
