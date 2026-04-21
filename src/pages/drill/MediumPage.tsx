import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Icon } from '@/components/ui/Icon'
import {
  DistractorRound,
  TransitionRound,
  type DistractorRoundData,
  type TransitionRoundData,
} from '@/components/drill/rounds'
import { SURAH_BY_ID } from '@/data/quran'
import { distractorsFor, type DistractorSet } from '@/data/distractors'
import { shuffle } from '@/lib/drill'
import { recordAttempt } from '@/lib/progress'
import type { Surah } from '@/data/types'

type MediumRound = DistractorRoundData | TransitionRoundData

const EDGE_WORDS = 3
const MAX_TRANSITION_DISTRACTORS = 2

function sliceLast(words: string[]): string {
  return words.slice(-Math.min(EDGE_WORDS, words.length)).join(' ')
}

function sliceFirst(words: string[]): string {
  return words.slice(0, Math.min(EDGE_WORDS, words.length)).join(' ')
}

function buildDistractorRound(surah: Surah, d: DistractorSet): DistractorRoundData {
  const ayah = surah.ayat.find((a) => a.number === d.ayahNumber)
  if (!ayah) throw new Error(`missing ayah ${surah.id}:${d.ayahNumber}`)
  return {
    kind: 'distractor',
    surahId: surah.id,
    ayahNumber: ayah.number,
    translation: ayah.translation,
    words: ayah.words.map((w) => w.text),
    blankIndex: d.wordIndex,
    target: d.target,
    options: shuffle(d.options),
    note: d.note,
  }
}

function buildTransitionRound(surah: Surah, fromAyahNumber: number): TransitionRoundData | null {
  const from = surah.ayat.find((a) => a.number === fromAyahNumber)
  const to = surah.ayat.find((a) => a.number === fromAyahNumber + 1)
  if (!from || !to) return null

  const firstWordsByAyah = surah.ayat.map((a) =>
    sliceFirst(a.words.map((w) => w.text)),
  )
  const target = sliceFirst(to.words.map((w) => w.text))
  const distractorPool = firstWordsByAyah.filter(
    (s, i) => surah.ayat[i].number !== to.number && s !== target,
  )
  const distractors = shuffle(distractorPool).slice(0, MAX_TRANSITION_DISTRACTORS)
  const options = shuffle([target, ...distractors])

  return {
    kind: 'transition',
    surahId: surah.id,
    fromAyah: from.number,
    toAyah: to.number,
    lastWords: sliceLast(from.words.map((w) => w.text)),
    target,
    options,
  }
}

function buildRounds(surahId: number): MediumRound[] | null {
  const surah = SURAH_BY_ID.get(surahId)
  if (!surah) return null
  const sets = distractorsFor(surahId)
  if (sets.length === 0) return null

  const sorted = [...sets].sort((a, b) => a.ayahNumber - b.ayahNumber)
  const rounds: MediumRound[] = []

  sorted.forEach((d, i) => {
    rounds.push(buildDistractorRound(surah, d))
    if ((i + 1) % 2 === 0) {
      const t = buildTransitionRound(surah, d.ayahNumber)
      if (t) rounds.push(t)
    }
  })

  if (
    surah.ayat.length >= 2 &&
    !rounds.some((r) => r.kind === 'transition')
  ) {
    const first = sorted[0]
    const t = buildTransitionRound(surah, first.ayahNumber)
    if (t) rounds.push(t)
  }

  return rounds
}

export function MediumPage() {
  const params = useParams<{ surahId: string }>()
  const surahId = Number(params.surahId)
  const surah = SURAH_BY_ID.get(surahId)
  const rounds = useMemo(() => buildRounds(surahId), [surahId])

  if (!surah || !rounds) return <Navigate to="/home" replace />

  return <MediumDrill surahId={surahId} rounds={rounds} />
}

function MediumDrill({ surahId, rounds }: { surahId: number; rounds: MediumRound[] }) {
  const surah = SURAH_BY_ID.get(surahId)!
  const total = rounds.length

  const [picks, setPicks] = useState<(string | null)[]>(() =>
    Array.from({ length: total }, () => null),
  )
  const [currentIdx, setCurrentIdx] = useState(0)
  const [done, setDone] = useState(false)

  const current = rounds[currentIdx]
  const picked = picks[currentIdx]
  const correct = picked === current.target

  const answers = useMemo<DrillAnswer[]>(
    () =>
      rounds.map((r, i) => ({
        label:
          r.kind === 'distractor'
            ? r.target
            : `${r.fromAyah}→${r.toAyah}  ·  ${r.target}`,
        correct: picks[i] === r.target,
      })),
    [rounds, picks],
  )

  const handlePick = (opt: string) => {
    if (picked !== null) return
    const next = [...picks]
    next[currentIdx] = opt
    setPicks(next)
  }

  const handleAdvance = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1)
      return
    }
    const correctCount = rounds.reduce(
      (n, r, i) => n + (picks[i] === r.target ? 1 : 0),
      0,
    )
    recordAttempt({ tier: 'medium', surahId, correct: correctCount, total })
    setDone(true)
  }

  const reset = () => {
    setPicks(Array.from({ length: total }, () => null))
    setCurrentIdx(0)
    setDone(false)
  }

  if (done) {
    return (
      <DrillShell
        eyebrow={`Medium · ${surah.nameComplex}`}
        title="Results"
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
      eyebrow={
        current.kind === 'distractor'
          ? `Medium · Ayah ${current.ayahNumber} of ${surah.versesCount}`
          : `Medium · Ayah ${current.fromAyah} → ${current.toAyah}`
      }
      title={current.kind === 'distractor' ? 'Which fits?' : 'What comes next?'}
      arabicTitle={surah.nameArabic}
      tone="medium"
      total={total}
      current={currentIdx}
    >
      {current.kind === 'distractor' ? (
        <DistractorRound
          round={current}
          picked={picked}
          correct={correct}
          onPick={handlePick}
        />
      ) : (
        <TransitionRound
          round={current}
          picked={picked}
          correct={correct}
          onPick={handlePick}
        />
      )}

      <PrimaryButton
        tone="ink"
        disabled={picked === null}
        onClick={handleAdvance}
        className="mt-8"
      >
        {picked === null
          ? current.kind === 'distractor'
            ? 'Pick the right form'
            : 'Pick the opening'
          : currentIdx < total - 1
            ? 'Next round'
            : 'See results'}
        {picked !== null && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DrillShell>
  )
}
