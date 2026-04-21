import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { AyahCard, Blank } from '@/components/drill/AyahCard'
import { OptionButton, optionState } from '@/components/ui/OptionButton'
import { Feedback } from '@/components/ui/Feedback'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Icon } from '@/components/ui/Icon'
import {
  ReorderPanel,
  isReorderCorrect,
  isReorderFilled,
  type ReorderState,
} from '@/components/drill/ReorderPanel'
import { SURAH_BY_ID } from '@/data/quran'
import { shuffle } from '@/lib/drill'
import { recordAttempt } from '@/lib/progress'

type EasyRound =
  | {
      kind: 'blank'
      ayahNumber: number
      translation: string
      words: string[]
      blankIndex: number
      target: string
    }
  | {
      kind: 'reorder'
      ayahNumber: number
      translation: string
      correctWords: string[]
      initialBank: string[]
    }

type RoundState =
  | { kind: 'blank'; picked: string | null }
  | { kind: 'reorder'; reorder: ReorderState }

function buildRounds(surahId: number): EasyRound[] | null {
  const surah = SURAH_BY_ID.get(surahId)
  if (!surah) return null

  return surah.ayat.map((ayah) => {
    const words = ayah.words.map((w) => w.text)
    const eligibleForReorder =
      words.length >= 3 && words.length <= 5 && ayah.number % 3 === 1

    if (eligibleForReorder) {
      let bank = shuffle(words)
      if (words.length > 1 && bank.every((w, i) => w === words[i])) {
        bank = [bank[1], bank[0], ...bank.slice(2)]
      }
      return {
        kind: 'reorder',
        ayahNumber: ayah.number,
        translation: ayah.translation,
        correctWords: words,
        initialBank: bank,
      }
    }

    const candidateIndexes = words
      .map((w, i) => ({ len: w.length, i }))
      .sort((a, b) => b.len - a.len)
    const blankIndex = candidateIndexes[0]?.i ?? 0
    return {
      kind: 'blank',
      ayahNumber: ayah.number,
      translation: ayah.translation,
      words,
      blankIndex,
      target: words[blankIndex],
    }
  })
}

function initialState(round: EasyRound): RoundState {
  if (round.kind === 'blank') return { kind: 'blank', picked: null }
  return {
    kind: 'reorder',
    reorder: {
      bank: [...round.initialBank],
      slots: Array.from({ length: round.correctWords.length }, () => null),
    },
  }
}

export function EasyPage() {
  const params = useParams<{ surahId: string }>()
  const surahId = Number(params.surahId)
  const surah = SURAH_BY_ID.get(surahId)
  const rounds = useMemo(() => buildRounds(surahId), [surahId])

  if (!surah || !rounds) return <Navigate to="/home" replace />

  return <EasyDrill surahId={surahId} rounds={rounds} />
}

function EasyDrill({ surahId, rounds }: { surahId: number; rounds: EasyRound[] }) {
  const surah = SURAH_BY_ID.get(surahId)!
  const total = rounds.length

  const blankBank = useMemo(
    () => shuffle(rounds.flatMap((r) => (r.kind === 'blank' ? [r.target] : []))),
    [rounds],
  )

  const [roundStates, setRoundStates] = useState<RoundState[]>(() =>
    rounds.map(initialState),
  )
  const [submissions, setSubmissions] = useState<(boolean | null)[]>(() =>
    Array.from({ length: total }, () => null),
  )
  const [currentIdx, setCurrentIdx] = useState(0)
  const [done, setDone] = useState(false)

  const current = rounds[currentIdx]
  const state = roundStates[currentIdx]
  const submitted = submissions[currentIdx]
  const isSubmitted = submitted !== null

  const correctForRound = (r: EasyRound, s: RoundState): boolean => {
    if (r.kind === 'blank' && s.kind === 'blank') return s.picked === r.target
    if (r.kind === 'reorder' && s.kind === 'reorder')
      return isReorderCorrect(s.reorder, r.correctWords)
    return false
  }

  const filledForRound = (r: EasyRound, s: RoundState): boolean => {
    if (r.kind === 'blank' && s.kind === 'blank') return s.picked !== null
    if (r.kind === 'reorder' && s.kind === 'reorder') return isReorderFilled(s.reorder)
    return false
  }

  const filled = filledForRound(current, state)
  const correct = filled && correctForRound(current, state)

  const answers = useMemo<DrillAnswer[]>(
    () =>
      rounds.map((r, i) => ({
        label:
          r.kind === 'blank' ? r.target : r.correctWords.join(' '),
        correct: submissions[i] === true,
      })),
    [rounds, submissions],
  )

  const updateRound = (idx: number, updater: (s: RoundState) => RoundState) => {
    setRoundStates((prev) =>
      prev.map((s, i) => (i === idx ? updater(s) : s)),
    )
  }

  const handlePickBlank = (opt: string) => {
    if (isSubmitted) return
    if (state.kind !== 'blank') return
    if (state.picked !== null) return
    const nextState: RoundState = { kind: 'blank', picked: opt }
    updateRound(currentIdx, () => nextState)
    const submitAt = [...submissions]
    submitAt[currentIdx] = opt === (current as Extract<EasyRound, { kind: 'blank' }>).target
    setSubmissions(submitAt)
  }

  const handleReorderChange = (next: ReorderState) => {
    updateRound(currentIdx, () => ({ kind: 'reorder', reorder: next }))
  }

  const handleReorderClear = () => {
    if (isSubmitted) return
    if (current.kind !== 'reorder') return
    updateRound(currentIdx, () => initialState(current))
  }

  const handleReorderSubmit = () => {
    if (isSubmitted || !filled) return
    const next = [...submissions]
    next[currentIdx] = correct
    setSubmissions(next)
  }

  const handleAdvance = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1)
      return
    }
    const correctCount = submissions.filter((s) => s === true).length
    recordAttempt({ tier: 'easy', surahId, correct: correctCount, total })
    setDone(true)
  }

  const reset = () => {
    setRoundStates(rounds.map(initialState))
    setSubmissions(Array.from({ length: total }, () => null))
    setCurrentIdx(0)
    setDone(false)
  }

  if (done) {
    return (
      <DrillShell
        eyebrow={`Easy · ${surah.nameComplex}`}
        title="Results"
        arabicTitle={surah.nameArabic}
        tone="easy"
        total={total}
        current={total - 1}
      >
        <DrillResults answers={answers} onTryAgain={reset} />
      </DrillShell>
    )
  }

  const title = current.kind === 'reorder' ? 'Place the words.' : 'Fill the blank.'

  return (
    <DrillShell
      eyebrow={`Easy · Ayah ${current.ayahNumber} of ${surah.versesCount}`}
      title={title}
      arabicTitle={surah.nameArabic}
      tone="easy"
      total={total}
      current={currentIdx}
    >
      {current.kind === 'blank' && state.kind === 'blank' ? (
        <BlankRound
          round={current}
          picked={state.picked}
          correct={correct}
          bank={blankBank}
          onPick={handlePickBlank}
          currentIdx={currentIdx}
          total={total}
          onAdvance={handleAdvance}
        />
      ) : current.kind === 'reorder' && state.kind === 'reorder' ? (
        <ReorderRound
          round={current}
          state={state.reorder}
          submitted={isSubmitted}
          correct={correct}
          filled={filled}
          onChange={handleReorderChange}
          onClear={handleReorderClear}
          onSubmit={handleReorderSubmit}
          onAdvance={handleAdvance}
          currentIdx={currentIdx}
          total={total}
        />
      ) : null}
    </DrillShell>
  )
}

interface BlankProps {
  round: Extract<EasyRound, { kind: 'blank' }>
  picked: string | null
  correct: boolean
  bank: string[]
  onPick: (opt: string) => void
  currentIdx: number
  total: number
  onAdvance: () => void
}

function BlankRound({
  round,
  picked,
  correct,
  bank,
  onPick,
  currentIdx,
  total,
  onAdvance,
}: BlankProps) {
  return (
    <>
      <AyahCard translation={round.translation}>
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-ink"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(22px, 5vw, 30px)',
            lineHeight: 2,
          }}
        >
          {round.words.map((w, i) => {
            if (i !== round.blankIndex) return <span key={i}>{w}</span>
            const state =
              picked === null ? 'idle' : correct ? 'correct' : 'wrong'
            return (
              <Blank key={i} state={state}>
                {picked ?? undefined}
              </Blank>
            )
          })}
        </div>
      </AyahCard>

      <div className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-easy-deep">
        Bank · Tap the word that fits
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {bank.map((opt) => (
          <OptionButton
            key={opt}
            arabic
            locked={picked !== null}
            state={optionState(picked, opt, round.target)}
            onClick={() => onPick(opt)}
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
          correctText="Flow mode trusts the bank — every word here is correct. You just rebuilt the placement."
          incorrectText={`The word that fits ayah ${round.ayahNumber} is ${round.target}. All four words in the bank are correct — the drill is the placement.`}
        />
      </div>

      <PrimaryButton
        tone="ink"
        disabled={picked === null}
        onClick={onAdvance}
        className="mt-8"
      >
        {picked === null
          ? 'Pick a word to continue'
          : currentIdx < total - 1
            ? 'Next ayah'
            : 'See results'}
        {picked !== null && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </>
  )
}

interface ReorderProps {
  round: Extract<EasyRound, { kind: 'reorder' }>
  state: ReorderState
  submitted: boolean
  correct: boolean
  filled: boolean
  onChange: (s: ReorderState) => void
  onClear: () => void
  onSubmit: () => void
  onAdvance: () => void
  currentIdx: number
  total: number
}

function ReorderRound({
  round,
  state,
  submitted,
  correct,
  filled,
  onChange,
  onClear,
  onSubmit,
  onAdvance,
  currentIdx,
  total,
}: ReorderProps) {
  const missing = state.slots.filter((s) => s === null).length

  return (
    <>
      <ReorderPanel
        correctWords={round.correctWords}
        state={state}
        onChange={onChange}
        submitted={submitted}
        translation={round.translation}
        onClear={onClear}
      />

      <div className="mt-6">
        <Feedback
          show={submitted}
          correct={correct}
          correctLabel="Correct order"
          incorrectLabel="Order slipped"
          correctText="The sequence matches the muṣḥaf. Physical placement reinforces the memory."
          incorrectText={`Correct order: ${round.correctWords.join(' · ')}. Mismatched slots are marked red.`}
        />
      </div>

      {!submitted ? (
        <PrimaryButton
          tone="ink"
          disabled={!filled}
          onClick={onSubmit}
          className="mt-8"
        >
          {filled ? 'Check order' : `Place ${missing} more`}
          {filled && <Icon name="arrow-r" size={16} />}
        </PrimaryButton>
      ) : (
        <PrimaryButton tone="ink" onClick={onAdvance} className="mt-8">
          {currentIdx < total - 1 ? 'Next ayah' : 'See results'}
          <Icon name="arrow-r" size={16} />
        </PrimaryButton>
      )}
    </>
  )
}
