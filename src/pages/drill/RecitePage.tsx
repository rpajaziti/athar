import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { AyahCard } from '@/components/drill/AyahCard'
import { Icon } from '@/components/ui/Icon'
import { SURAH_BY_ID } from '@/data/quran'
import { stripHarakat } from '@/lib/arabic'
import { recordMixedAttempt } from '@/lib/progress'
import { cn } from '@/lib/cn'

type Mode = 'preview' | 'reveal'
type Judge = 'solid' | 'shaky' | 'missed'

const JUDGE_COLOR: Record<Judge, string> = {
  solid: 'var(--color-correct)',
  shaky: 'var(--color-medium)',
  missed: 'var(--color-incorrect)',
}

const JUDGE_LABEL: Record<Judge, string> = {
  solid: 'Solid',
  shaky: 'Shaky',
  missed: 'Missed',
}

export function RecitePage() {
  const { surahId: sid } = useParams<{ surahId: string }>()
  const surahId = Number(sid)
  const surah = SURAH_BY_ID.get(surahId)

  const [idx, setIdx] = useState(0)
  const [mode, setMode] = useState<Mode>('preview')
  const [rasm, setRasm] = useState(false)
  const [judgments, setJudgments] = useState<Record<number, Judge>>({})
  const [done, setDone] = useState(false)

  const total = surah?.ayat.length ?? 0
  const current = useMemo(() => surah?.ayat[idx], [surah, idx])

  if (!surah || !current) return <Navigate to="/home" replace />

  const handleReveal = () => setMode('reveal')

  const handleJudge = (j: Judge) => {
    const next = { ...judgments, [current.number]: j }
    setJudgments(next)
    if (idx < total - 1) {
      setIdx(idx + 1)
      setMode('preview')
      return
    }
    const solidCount = Object.values(next).filter((v) => v === 'solid').length
    recordMixedAttempt(solidCount, total)
    setDone(true)
  }

  const reset = () => {
    setIdx(0)
    setMode('preview')
    setJudgments({})
    setDone(false)
  }

  if (done) {
    const answers: DrillAnswer[] = surah.ayat.map((a) => ({
      label: `Ayah ${a.number} · ${JUDGE_LABEL[judgments[a.number] ?? 'missed']}`,
      correct: judgments[a.number] === 'solid',
    }))
    return (
      <DrillShell
        eyebrow={`Murājaʿah · ${surah.nameComplex} · Results`}
        title="How'd it feel?"
        arabicTitle={surah.nameArabic}
        tone="hero"
        total={total}
        current={total - 1}
      >
        <DrillResults answers={answers} onTryAgain={reset} />
      </DrillShell>
    )
  }

  const prev = idx > 0 ? surah.ayat[idx - 1] : null
  const text = rasm ? stripHarakat(current.text) : current.text

  return (
    <DrillShell
      eyebrow={`Murājaʿah · ${surah.nameComplex} · Ayah ${current.number}`}
      title={
        mode === 'preview'
          ? idx === 0
            ? 'Open with ayah 1 from memory.'
            : 'What comes next?'
          : 'Judge yourself.'
      }
      arabicTitle={surah.nameArabic}
      tone="hero"
      total={total}
      current={idx}
    >
      <div className="mb-4 flex items-center justify-end">
        <label className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft">
          <input
            type="checkbox"
            checked={rasm}
            onChange={(e) => setRasm(e.target.checked)}
          />
          Rasm only
        </label>
      </div>

      {prev && (
        <div className="mb-4 rounded-xl border border-hairline bg-bg-sunk/60 p-4">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
            Just recited · Ayah {prev.number}
          </div>
          <div
            dir="rtl"
            className="mt-2 text-ink-soft"
            style={{
              fontFamily: 'var(--font-arabic-ayah)',
              fontSize: 'clamp(18px, 3.8vw, 22px)',
              lineHeight: 1.9,
            }}
          >
            {rasm ? stripHarakat(prev.text) : prev.text}
          </div>
        </div>
      )}

      {mode === 'preview' ? (
        <AyahCard audio={{ surahId: surah.id, ayahNumber: current.number }}>
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
              Ayah {current.number} · {current.words.length} words
            </div>
            <div className="text-[13px] text-ink-soft">
              {idx === 0
                ? 'Recite the first ayah to yourself.'
                : 'Recite the next ayah from memory — then reveal.'}
            </div>
          </div>
        </AyahCard>
      ) : (
        <AyahCard
          translation={current.translation}
          audio={{ surahId: surah.id, ayahNumber: current.number }}
        >
          <div
            dir="rtl"
            className="text-center text-ink"
            style={{
              fontFamily: 'var(--font-arabic-ayah)',
              fontSize: 'clamp(22px, 5vw, 30px)',
              lineHeight: 2,
            }}
          >
            {text}
          </div>
        </AyahCard>
      )}

      {mode === 'preview' ? (
        <PrimaryButton tone="hero" onClick={handleReveal} className="mt-8">
          Reveal ayah {current.number}
          <Icon name="eye" size={16} />
        </PrimaryButton>
      ) : (
        <div className="mt-8">
          <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hero-deep">
            Self-check · How did it feel?
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['missed', 'shaky', 'solid'] as const).map((j) => (
              <button
                key={j}
                type="button"
                onClick={() => handleJudge(j)}
                className={cn(
                  'inline-flex flex-col items-center justify-center gap-1 rounded-[14px] border px-4 py-3 text-[13px] font-bold transition-colors',
                )}
                style={{
                  borderColor: JUDGE_COLOR[j],
                  color: JUDGE_COLOR[j],
                  background: `color-mix(in oklch, ${JUDGE_COLOR[j]} 6%, transparent)`,
                }}
              >
                <span className="font-extrabold">{JUDGE_LABEL[j]}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-70">
                  {j === 'solid' ? 'Got it' : j === 'shaky' ? 'Needed hint' : 'Blank'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </DrillShell>
  )
}
