import { useEffect, useMemo, useState } from 'react'
import { DrillShell } from '@/components/drill/DrillShell'
import { OptionButton, optionState } from '@/components/ui/OptionButton'
import { Feedback } from '@/components/ui/Feedback'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Icon } from '@/components/ui/Icon'
import { LETTER_CONFUSABLES } from '@/data/confusables'
import { sample, shuffle } from '@/lib/drill'
import { recordAttempt } from '@/lib/progress'
import { speakArabic, speechSupported } from '@/lib/audio'

interface Round {
  target: string
  latin: string
  options: string[]
  note: string
}

const ROUND_COUNT = 5

function makeRounds(): Round[] {
  const picked = sample(LETTER_CONFUSABLES, ROUND_COUNT)
  return picked.map((set) => {
    const target = set.letters[Math.floor(Math.random() * set.letters.length)]
    const latinParts = set.latin.split(' · ')
    const targetIdx = set.letters.indexOf(target)
    const latin = latinParts[targetIdx] ?? set.latin
    return {
      target,
      latin,
      options: shuffle(set.letters),
      note: set.note,
    }
  })
}

export function FoundationsPage() {
  const [rounds, setRounds] = useState<Round[]>(() => makeRounds())
  const [currentIdx, setCurrentIdx] = useState(0)
  const [picks, setPicks] = useState<(string | null)[]>(() =>
    Array.from({ length: ROUND_COUNT }, () => null),
  )
  const [done, setDone] = useState(false)
  const audioOn = speechSupported()

  const current = rounds[currentIdx]
  const picked = picks[currentIdx]
  const correct = picked === current.target

  useEffect(() => {
    if (!audioOn || done) return
    const t = window.setTimeout(() => speakArabic(current.target), 250)
    return () => window.clearTimeout(t)
  }, [currentIdx, current.target, audioOn, done])

  const answers = useMemo<DrillAnswer[]>(
    () =>
      rounds.map((r, i) => ({
        label: `${r.target}  ·  ${r.latin}`,
        correct: picks[i] === r.target,
      })),
    [rounds, picks],
  )

  const handlePick = (opt: string) => {
    if (picked !== null) return
    if (audioOn) speakArabic(opt)
    const next = [...picks]
    next[currentIdx] = opt
    setPicks(next)
  }

  const handleAdvance = () => {
    if (currentIdx < ROUND_COUNT - 1) {
      setCurrentIdx(currentIdx + 1)
      return
    }
    const correctCount = rounds.reduce(
      (n, r, i) => n + (picks[i] === r.target ? 1 : 0),
      0,
    )
    recordAttempt({ tier: 'foundations', correct: correctCount, total: ROUND_COUNT })
    setDone(true)
  }

  const reset = () => {
    setRounds(makeRounds())
    setPicks(Array.from({ length: ROUND_COUNT }, () => null))
    setCurrentIdx(0)
    setDone(false)
  }

  if (done) {
    return (
      <DrillShell
        eyebrow="Foundations · Letter drill"
        title="Results"
        tone="foundations"
        total={ROUND_COUNT}
        current={ROUND_COUNT - 1}
      >
        <DrillResults answers={answers} onTryAgain={reset} />
      </DrillShell>
    )
  }

  return (
    <DrillShell
      eyebrow={`Foundations · Round ${currentIdx + 1} of ${ROUND_COUNT}`}
      title={`Which one is ${current.latin}?`}
      tone="foundations"
      total={ROUND_COUNT}
      current={currentIdx}
    >
      {audioOn && (
        <button
          type="button"
          onClick={() => speakArabic(current.target)}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-2 text-[12px] font-semibold text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
        >
          <Icon name="speaker" size={14} />
          Hear {current.latin}
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {current.options.map((opt) => (
          <OptionButton
            key={opt}
            arabic
            square
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
          correctLabel="Correct"
          incorrectLabel="Not quite"
          correctText={current.note}
          incorrectText={`The ${current.latin} is ${current.target}. ${current.note}`}
        />
      </div>

      <PrimaryButton
        tone="ink"
        disabled={picked === null}
        onClick={handleAdvance}
        className="mt-8"
      >
        {picked === null
          ? 'Pick a letter to continue'
          : currentIdx < ROUND_COUNT - 1
            ? 'Next round'
            : 'See results'}
        {picked !== null && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DrillShell>
  )
}
