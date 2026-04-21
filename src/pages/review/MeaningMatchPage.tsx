import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { OptionButton, optionState } from '@/components/ui/OptionButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Feedback } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'
import { AyahCard } from '@/components/drill/AyahCard'
import { SURAHS, SURAH_BY_ID } from '@/data/quran'
import { shuffle } from '@/lib/drill'
import { getKnown, recordMixedAttempt } from '@/lib/progress'
import { cn } from '@/lib/cn'

const TARGET_ROUNDS = 10

interface Round {
  surahId: number
  ayahNumber: number
  arabic: string
  translation: string
  options: string[]
}

function trimTranslation(t: string): string {
  const stripped = t.replace(/\s*\[.*?\]\s*/g, ' ').replace(/\s+/g, ' ').trim()
  return stripped
}

function buildRounds(): Round[] {
  const knownIds = new Set(getKnown())
  const pool = (knownIds.size > 0 ? SURAHS.filter((s) => knownIds.has(s.id)) : SURAHS)
    .flatMap((s) =>
      s.ayat.map((a) => ({
        surahId: s.id,
        ayahNumber: a.number,
        arabic: a.text,
        translation: trimTranslation(a.translation),
      })),
    )
    .filter((x) => x.translation.length > 8)

  if (pool.length < 3) return []

  const picks = shuffle(pool).slice(0, Math.min(TARGET_ROUNDS, pool.length))

  return picks.map((p) => {
    const distractorPool = pool
      .filter(
        (x) =>
          x.translation !== p.translation &&
          !(x.surahId === p.surahId && x.ayahNumber === p.ayahNumber),
      )
      .map((x) => x.translation)
    const distractors = shuffle(distractorPool).slice(0, 2)
    return {
      surahId: p.surahId,
      ayahNumber: p.ayahNumber,
      arabic: p.arabic,
      translation: p.translation,
      options: shuffle([p.translation, ...distractors]),
    }
  })
}

export function MeaningMatchPage() {
  const rounds = useMemo(buildRounds, [])
  const [states, setStates] = useState<(string | null)[]>(() =>
    rounds.map(() => null),
  )
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState(false)

  if (rounds.length === 0) return <Navigate to="/home" replace />

  const current = rounds[idx]
  const picked = states[idx]
  const correct = picked === current.translation
  const total = rounds.length
  const surah = SURAH_BY_ID.get(current.surahId)

  const handlePick = (opt: string) => {
    if (picked !== null) return
    setStates((prev) => prev.map((s, i) => (i === idx ? opt : s)))
  }

  const handleAdvance = () => {
    if (idx < total - 1) {
      setIdx(idx + 1)
      return
    }
    const correctCount = rounds.reduce(
      (n, r, i) => n + (states[i] === r.translation ? 1 : 0),
      0,
    )
    recordMixedAttempt(correctCount, total)
    setDone(true)
  }

  const reset = () => {
    setStates(rounds.map(() => null))
    setIdx(0)
    setDone(false)
  }

  const answers: DrillAnswer[] = rounds.map((r, i) => ({
    label: `${SURAH_BY_ID.get(r.surahId)?.nameComplex ?? 'Sūrah'} · ${r.ayahNumber}`,
    correct: states[i] === r.translation,
  }))

  if (done) {
    return (
      <DrillShell
        eyebrow="Meaning match · Results"
        title="Results"
        tone="hero"
        total={total}
        current={total - 1}
      >
        <DrillResults answers={answers} onTryAgain={reset} />
      </DrillShell>
    )
  }

  return (
    <DrillShell
      eyebrow={`Meaning match · ${surah?.nameComplex ?? 'Qurʾān'} · Ayah ${current.ayahNumber}`}
      title="Match the meaning."
      tone="hero"
      total={total}
      current={idx}
    >
      <AyahCard
        ayahNumber={current.ayahNumber}
        audio={{ surahId: current.surahId, ayahNumber: current.ayahNumber }}
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
          {current.arabic}
        </div>
      </AyahCard>

      <div className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hero-deep">
        Which translation matches?
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        {current.options.map((opt) => (
          <OptionButton
            key={opt}
            locked={picked !== null}
            state={optionState(picked, opt, current.translation)}
            onClick={() => handlePick(opt)}
          >
            <span className="text-left text-[13px] italic leading-relaxed">
              "{opt}"
            </span>
          </OptionButton>
        ))}
      </div>

      <div className="mt-6">
        <Feedback
          show={picked !== null}
          correct={correct}
          correctLabel="Right meaning"
          incorrectLabel="Other ayah"
          correctText={`${surah?.nameComplex ?? 'This sūrah'} ${current.ayahNumber}: "${current.translation}"`}
          incorrectText={`This ayah means: "${current.translation}" — the others belong to different ayat.`}
        />
      </div>

      <PrimaryButton
        tone="ink"
        disabled={picked === null}
        onClick={handleAdvance}
        className={cn('mt-8')}
      >
        {picked === null
          ? 'Pick a meaning'
          : idx < total - 1
            ? 'Next ayah'
            : 'See results'}
        {picked !== null && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DrillShell>
  )
}
