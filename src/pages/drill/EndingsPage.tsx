import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { AyahCard, Blank } from '@/components/drill/AyahCard'
import { OptionButton, optionState } from '@/components/ui/OptionButton'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Feedback } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'
import { SURAH_BY_ID } from '@/data/quran'
import { shuffle } from '@/lib/drill'
import { recordAttempt } from '@/lib/progress'
import { cn } from '@/lib/cn'

const TARGET_ROUNDS = 5

interface Round {
  surahId: number
  ayahNumber: number
  translation: string
  words: string[]
  target: string
  options: string[]
}

function buildRounds(surahId: number): Round[] | null {
  const surah = SURAH_BY_ID.get(surahId)
  if (!surah) return null

  const endings = surah.ayat
    .filter((a) => a.words.length >= 2)
    .map((a) => ({
      ayah: a,
      last: a.words[a.words.length - 1].text,
    }))

  if (endings.length < 3) return null

  const picks = shuffle(endings).slice(
    0,
    Math.min(TARGET_ROUNDS, endings.length),
  )

  return picks.map(({ ayah, last }) => {
    const distractorPool = endings
      .filter((e) => e.ayah.number !== ayah.number && e.last !== last)
      .map((e) => e.last)
    const distractors = shuffle(distractorPool).slice(0, 2)
    const options = shuffle([last, ...distractors])
    return {
      surahId,
      ayahNumber: ayah.number,
      translation: ayah.translation,
      words: ayah.words.map((w) => w.text),
      target: last,
      options,
    }
  })
}

export function EndingsPage() {
  const { surahId: sid } = useParams<{ surahId: string }>()
  const surahId = Number(sid)
  const surah = SURAH_BY_ID.get(surahId)
  const rounds = useMemo(() => buildRounds(surahId), [surahId])

  const [states, setStates] = useState<(string | null)[]>(() =>
    rounds ? rounds.map(() => null) : [],
  )
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState(false)

  if (!surah || !rounds || rounds.length === 0) {
    return <Navigate to="/home" replace />
  }

  const current = rounds[idx]
  const picked = states[idx]
  const correct = picked === current.target
  const total = rounds.length

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
      (n, r, i) => n + (states[i] === r.target ? 1 : 0),
      0,
    )
    recordAttempt({
      tier: 'medium',
      surahId,
      correct: correctCount,
      total,
    })
    setDone(true)
  }

  const reset = () => {
    setStates(rounds.map(() => null))
    setIdx(0)
    setDone(false)
  }

  const answers: DrillAnswer[] = rounds.map((r, i) => ({
    label: `Ayah ${r.ayahNumber} → ${r.target}`,
    correct: states[i] === r.target,
  }))

  if (done) {
    return (
      <DrillShell
        eyebrow={`Endings · ${surah.nameComplex} · Results`}
        title="Fāṣila check"
        arabicTitle={surah.nameArabic}
        tone="medium"
        total={total}
        current={total - 1}
      >
        <DrillResults answers={answers} onTryAgain={reset} />
      </DrillShell>
    )
  }

  return (
    <DrillShell
      eyebrow={`Endings · ${surah.nameComplex} · Ayah ${current.ayahNumber}`}
      title="What closes this ayah?"
      arabicTitle={surah.nameArabic}
      tone="medium"
      total={total}
      current={idx}
    >
      <AyahCard
        translation={current.translation}
        ayahNumber={current.ayahNumber}
        audio={{ surahId, ayahNumber: current.ayahNumber }}
      >
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-ink"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(22px, 5vw, 30px)',
            lineHeight: 2,
          }}
        >
          {current.words.map((w, i) => {
            if (i !== current.words.length - 1) return <span key={i}>{w}</span>
            const state =
              picked === null ? 'idle' : correct ? 'correct' : 'wrong'
            return (
              <Blank key={i} state={state} accent="var(--color-medium)">
                {picked ?? undefined}
              </Blank>
            )
          })}
        </div>
      </AyahCard>

      <div className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-medium-deep">
        Which ending matches the rhyme?
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {current.options.map((opt) => (
          <OptionButton
            key={opt}
            arabic
            locked={picked !== null}
            state={optionState(picked, opt, current.target)}
            onClick={() => handlePick(opt)}
          >
            {opt}
          </OptionButton>
        ))}
      </div>

      <div className="mt-6">
        <Feedback
          show={picked !== null}
          correct={correct}
          correctLabel="Fāṣila held"
          incorrectLabel="Different ending"
          correctText={`Ayah ${current.ayahNumber} closes with ${current.target}.`}
          incorrectText={`Ayah ${current.ayahNumber} closes with ${current.target}, not ${picked}. The distractors are endings from other ayat in this sūrah.`}
        />
      </div>

      <PrimaryButton
        tone="ink"
        disabled={picked === null}
        onClick={handleAdvance}
        className={cn('mt-8')}
      >
        {picked === null
          ? 'Pick the ending'
          : idx < total - 1
            ? 'Next ayah'
            : 'See results'}
        {picked !== null && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DrillShell>
  )
}
