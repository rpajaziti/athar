import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Icon } from '@/components/ui/Icon'
import {
  ProofreadRound,
  isProofreadCorrect,
  type ProofreadRoundData,
} from '@/components/drill/rounds'
import { SURAH_BY_ID } from '@/data/quran'
import { distractorsFor, type DistractorSet } from '@/data/distractors'
import { recordAttempt } from '@/lib/progress'

interface ProofreadState {
  flagged: number[]
  cleanMarked: boolean
  submitted: boolean
}

function initialState(): ProofreadState {
  return { flagged: [], cleanMarked: false, submitted: false }
}

function buildRounds(surahId: number): ProofreadRoundData[] | null {
  const surah = SURAH_BY_ID.get(surahId)
  if (!surah) return null
  const sets = distractorsFor(surahId)
  if (sets.length === 0) return null

  const byAyah = new Map<number, DistractorSet[]>()
  for (const d of sets) {
    const arr = byAyah.get(d.ayahNumber) ?? []
    arr.push(d)
    byAyah.set(d.ayahNumber, arr)
  }

  const rounds: ProofreadRoundData[] = []
  let i = 0
  for (const [ayahNumber, group] of byAyah) {
    const ayah = surah.ayat.find((a) => a.number === ayahNumber)
    if (!ayah) continue
    const correctWords = ayah.words.map((w) => w.text)
    const clean = i % 3 === 0
    i += 1

    if (clean) {
      rounds.push({
        kind: 'proofread',
        surahId,
        ayahNumber,
        translation: ayah.translation,
        displayWords: correctWords,
        correctWords,
        corruptedIndexes: [],
        notes: [],
      })
      continue
    }

    const displayWords = [...correctWords]
    const corruptedIndexes: number[] = []
    const notes: string[] = []
    for (const d of group) {
      const wrong = d.options.find((o) => o !== d.target)
      if (!wrong) continue
      displayWords[d.wordIndex] = wrong
      corruptedIndexes.push(d.wordIndex)
      notes.push(d.note)
    }
    rounds.push({
      kind: 'proofread',
      surahId,
      ayahNumber,
      translation: ayah.translation,
      displayWords,
      correctWords,
      corruptedIndexes,
      notes,
    })
  }
  return rounds
}

export function HardPage() {
  const params = useParams<{ surahId: string }>()
  const surahId = Number(params.surahId)
  const surah = SURAH_BY_ID.get(surahId)
  const rounds = useMemo(() => buildRounds(surahId), [surahId])

  if (!surah || !rounds) return <Navigate to="/home" replace />

  return <HardDrill surahId={surahId} rounds={rounds} />
}

function HardDrill({ surahId, rounds }: { surahId: number; rounds: ProofreadRoundData[] }) {
  const surah = SURAH_BY_ID.get(surahId)!
  const total = rounds.length

  const [states, setStates] = useState<ProofreadState[]>(() =>
    Array.from({ length: total }, initialState),
  )
  const [currentIdx, setCurrentIdx] = useState(0)
  const [done, setDone] = useState(false)

  const current = rounds[currentIdx]
  const state = states[currentIdx]
  const canCheck = !state.submitted && (state.flagged.length > 0 || state.cleanMarked)

  const answers = useMemo<DrillAnswer[]>(
    () =>
      rounds.map((r, i) => ({
        label:
          r.corruptedIndexes.length > 0
            ? r.corruptedIndexes.map((idx) => r.correctWords[idx]).join(' · ')
            : `${r.correctWords.join(' ')} (clean)`,
        correct: isProofreadCorrect(states[i].flagged, states[i].cleanMarked, r),
      })),
    [rounds, states],
  )

  const update = (idx: number, next: ProofreadState) => {
    setStates((prev) => prev.map((s, i) => (i === idx ? next : s)))
  }

  const handleToggleFlag = (i: number) => {
    if (state.submitted) return
    const has = state.flagged.includes(i)
    update(currentIdx, {
      flagged: has ? state.flagged.filter((x) => x !== i) : [...state.flagged, i],
      cleanMarked: false,
      submitted: false,
    })
  }

  const handleToggleClean = () => {
    if (state.submitted) return
    update(currentIdx, {
      flagged: [],
      cleanMarked: !state.cleanMarked,
      submitted: false,
    })
  }

  const handleCheck = () => {
    if (!canCheck) return
    update(currentIdx, { ...state, submitted: true })
  }

  const handleAdvance = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1)
      return
    }
    const correctCount = rounds.reduce(
      (n, r, i) =>
        n + (isProofreadCorrect(states[i].flagged, states[i].cleanMarked, r) ? 1 : 0),
      0,
    )
    recordAttempt({ tier: 'hard', surahId, correct: correctCount, total })
    setDone(true)
  }

  const reset = () => {
    setStates(Array.from({ length: total }, initialState))
    setCurrentIdx(0)
    setDone(false)
  }

  if (done) {
    return (
      <DrillShell
        eyebrow={`Hard · ${surah.nameComplex}`}
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
      eyebrow={`Hard · Ayah ${current.ayahNumber} of ${surah.versesCount}`}
      title="Proofread the ayah."
      arabicTitle={surah.nameArabic}
      tone="medium"
      total={total}
      current={currentIdx}
    >
      <ProofreadRound
        round={current}
        flagged={state.flagged}
        cleanMarked={state.cleanMarked}
        submitted={state.submitted}
        onToggleFlag={handleToggleFlag}
        onToggleClean={handleToggleClean}
      />

      {!state.submitted ? (
        <PrimaryButton
          tone="ink"
          disabled={!canCheck}
          onClick={handleCheck}
          className="mt-8"
        >
          {!canCheck
            ? 'Pick suspects or mark clean'
            : `Check${state.cleanMarked ? '' : ` · ${state.flagged.length} flagged`}`}
          {canCheck && <Icon name="arrow-r" size={16} />}
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
