import { useEffect, useMemo, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Icon } from '@/components/ui/Icon'
import {
  ConstructionRound,
  DistractorRound,
  ProofreadRound,
  TransitionRound,
  isProofreadCorrect,
  type AnyRound,
  type ConstructionRoundData,
  type DistractorRoundData,
  type ProofreadRoundData,
  type TransitionRoundData,
} from '@/components/drill/rounds'
import { SURAH_BY_ID } from '@/data/quran'
import { distractorsFor, type DistractorSet } from '@/data/distractors'
import { shuffle } from '@/lib/drill'
import { stripHarakat } from '@/lib/arabic'
import { cn } from '@/lib/cn'
import {
  getKnown,
  getRasmOnly,
  getReviewTiers,
  recordMixedAttempt,
  type ReviewTier,
} from '@/lib/progress'
import type { Surah } from '@/data/types'

const TARGET_ROUNDS = 12
const EDGE_WORDS = 3
const MAX_TRANSITION_DISTRACTORS = 2

function sliceLast(words: string[]): string {
  return words.slice(-Math.min(EDGE_WORDS, words.length)).join(' ')
}

function sliceFirst(words: string[]): string {
  return words.slice(0, Math.min(EDGE_WORDS, words.length)).join(' ')
}

function buildDistractor(surah: Surah, d: DistractorSet): DistractorRoundData {
  const ayah = surah.ayat.find((a) => a.number === d.ayahNumber)!
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

function buildProofreadGroup(
  surah: Surah,
  group: DistractorSet[],
  clean: boolean,
): ProofreadRoundData {
  const ayah = surah.ayat.find((a) => a.number === group[0].ayahNumber)!
  const correctWords = ayah.words.map((w) => w.text)
  if (clean) {
    return {
      kind: 'proofread',
      surahId: surah.id,
      ayahNumber: ayah.number,
      translation: ayah.translation,
      displayWords: correctWords,
      correctWords,
      corruptedIndexes: [],
      notes: [],
    }
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
  return {
    kind: 'proofread',
    surahId: surah.id,
    ayahNumber: ayah.number,
    translation: ayah.translation,
    displayWords,
    correctWords,
    corruptedIndexes,
    notes,
  }
}

function splitGraphemes(word: string): string[] {
  const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  return Array.from(seg.segment(word), (s) => s.segment)
}

function buildConstruction(surah: Surah, d: DistractorSet): ConstructionRoundData {
  const ayah = surah.ayat.find((a) => a.number === d.ayahNumber)!
  const graphemes = splitGraphemes(d.target)
  const distractorLetters = d.options
    .filter((o) => o !== d.target)
    .flatMap(splitGraphemes)
  const extras = distractorLetters.slice(
    0,
    Math.max(1, Math.floor(graphemes.length / 2)),
  )
  const pool = shuffle([...graphemes, ...extras])
  return {
    kind: 'construction',
    surahId: surah.id,
    ayahNumber: ayah.number,
    translation: ayah.translation,
    words: ayah.words.map((w) => w.text),
    blankIndex: d.wordIndex,
    target: d.target,
    graphemes,
    pool,
    note: d.note,
  }
}

function buildTransition(surah: Surah, fromAyah: number): TransitionRoundData | null {
  const from = surah.ayat.find((a) => a.number === fromAyah)
  const to = surah.ayat.find((a) => a.number === fromAyah + 1)
  if (!from || !to) return null
  const firstByAyah = surah.ayat.map((a) =>
    sliceFirst(a.words.map((w) => w.text)),
  )
  const target = sliceFirst(to.words.map((w) => w.text))
  const pool = firstByAyah.filter(
    (s, i) => surah.ayat[i].number !== to.number && s !== target,
  )
  const distractors = shuffle(pool).slice(0, MAX_TRANSITION_DISTRACTORS)
  return {
    kind: 'transition',
    surahId: surah.id,
    fromAyah: from.number,
    toAyah: to.number,
    lastWords: sliceLast(from.words.map((w) => w.text)),
    target,
    options: shuffle([target, ...distractors]),
  }
}

function rasmRound(r: AnyRound): AnyRound {
  if (r.kind === 'distractor') {
    return { ...r, words: r.words.map(stripHarakat) }
  }
  if (r.kind === 'transition') {
    return { ...r, lastWords: stripHarakat(r.lastWords) }
  }
  if (r.kind === 'proofread') {
    return {
      ...r,
      displayWords: r.displayWords.map(stripHarakat),
      correctWords: r.correctWords.map(stripHarakat),
    }
  }
  return { ...r, words: r.words.map(stripHarakat) }
}

function buildPool(knownIds: number[], tiers: ReviewTier[]): AnyRound[] {
  const tierSet = new Set(tiers)
  const rounds: AnyRound[] = []
  for (const id of knownIds) {
    const surah = SURAH_BY_ID.get(id)
    if (!surah) continue
    const sets = distractorsFor(id)
    if (sets.length === 0) continue

    if (tierSet.has('easy') || tierSet.has('medium')) {
      for (const d of sets) rounds.push(buildDistractor(surah, d))
    }

    if (tierSet.has('hard')) {
      const byAyah = new Map<number, DistractorSet[]>()
      for (const d of sets) {
        const arr = byAyah.get(d.ayahNumber) ?? []
        arr.push(d)
        byAyah.set(d.ayahNumber, arr)
      }
      let i = 0
      for (const [, group] of byAyah) {
        rounds.push(buildProofreadGroup(surah, group, i % 3 === 0))
        i += 1
      }
    }

    if (tierSet.has('expert')) {
      for (const d of sets) rounds.push(buildConstruction(surah, d))
    }

    if (tierSet.has('medium')) {
      for (const d of sets) {
        const t = buildTransition(surah, d.ayahNumber)
        if (t) rounds.push(t)
      }
    }
  }
  return rounds
}

interface PickState {
  kind: 'pick'
  picked: string | null
  submitted: boolean
}

interface ProofState {
  kind: 'flag'
  flagged: number[]
  cleanMarked: boolean
  submitted: boolean
}

interface BuildState {
  kind: 'build'
  build: number[]
  submitted: boolean | null
}

type RoundState = PickState | ProofState | BuildState

function initialState(round: AnyRound): RoundState {
  if (round.kind === 'distractor' || round.kind === 'transition')
    return { kind: 'pick', picked: null, submitted: false }
  if (round.kind === 'proofread')
    return { kind: 'flag', flagged: [], cleanMarked: false, submitted: false }
  return { kind: 'build', build: [], submitted: null }
}

function isRoundDone(round: AnyRound, state: RoundState): boolean {
  if (round.kind === 'distractor' || round.kind === 'transition')
    return state.kind === 'pick' && state.picked !== null
  if (round.kind === 'proofread')
    return state.kind === 'flag' && state.submitted
  return state.kind === 'build' && state.submitted !== null
}

function isRoundCorrect(round: AnyRound, state: RoundState): boolean {
  if ((round.kind === 'distractor' || round.kind === 'transition') && state.kind === 'pick')
    return state.picked === round.target
  if (round.kind === 'proofread' && state.kind === 'flag')
    return (
      state.submitted &&
      isProofreadCorrect(state.flagged, state.cleanMarked, round)
    )
  if (round.kind === 'construction' && state.kind === 'build')
    return state.submitted === true
  return false
}

function answerLabel(round: AnyRound): string {
  if (round.kind === 'distractor') return round.target
  if (round.kind === 'transition') return `${round.fromAyah}→${round.toAyah} · ${round.target}`
  if (round.kind === 'proofread') {
    return round.corruptedIndexes.length > 0
      ? round.corruptedIndexes.map((i) => round.correctWords[i]).join(' · ')
      : 'clean'
  }
  return round.target
}

export function MixedReviewPage() {
  const [params] = useSearchParams()
  const timedSeconds = (() => {
    const raw = params.get('timed')
    if (!raw) return null
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? Math.min(n, 300) : null
  })()
  const known = useMemo(() => getKnown(), [])
  const tiers = useMemo(() => getReviewTiers(), [])
  const rasmOnly = useMemo(() => getRasmOnly(), [])
  const rounds = useMemo(() => {
    if (known.length === 0) return []
    const raw = shuffle(buildPool(known, tiers))
    const cap = timedSeconds ? Math.max(TARGET_ROUNDS, 30) : TARGET_ROUNDS
    const sliced = raw.slice(0, Math.min(cap, raw.length))
    return rasmOnly ? sliced.map(rasmRound) : sliced
  }, [known, tiers, rasmOnly, timedSeconds])

  if (known.length === 0) return <Navigate to="/review/pick" replace />
  if (rounds.length === 0) return <Navigate to="/home" replace />

  return <MixedDrill rounds={rounds} rasmOnly={rasmOnly} timedSeconds={timedSeconds} />
}

function MixedDrill({
  rounds,
  rasmOnly,
  timedSeconds,
}: {
  rounds: AnyRound[]
  rasmOnly: boolean
  timedSeconds: number | null
}) {
  const total = rounds.length
  const [states, setStates] = useState<RoundState[]>(() => rounds.map(initialState))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [done, setDone] = useState(false)
  const [remaining, setRemaining] = useState<number>(timedSeconds ?? 0)

  useEffect(() => {
    if (!timedSeconds || done) return
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [timedSeconds, done])

  useEffect(() => {
    if (timedSeconds && remaining === 0 && !done) {
      const correctCount = rounds.reduce(
        (n, r, i) => n + (isRoundCorrect(r, states[i]) ? 1 : 0),
        0,
      )
      recordMixedAttempt(correctCount, total)
      setDone(true)
    }
  }, [remaining, timedSeconds, done, rounds, states, total])

  const current = rounds[currentIdx]
  const state = states[currentIdx]
  const surah = SURAH_BY_ID.get(current.surahId)
  const roundDone = isRoundDone(current, state)

  const answers = useMemo<DrillAnswer[]>(
    () =>
      rounds.map((r, i) => ({
        label: `${SURAH_BY_ID.get(r.surahId)?.nameComplex ?? '?'} · ${answerLabel(r)}`,
        correct: isRoundCorrect(r, states[i]),
      })),
    [rounds, states],
  )

  const update = (idx: number, next: RoundState) => {
    setStates((prev) => prev.map((s, i) => (i === idx ? next : s)))
  }

  const handlePick = (opt: string) => {
    if (state.kind !== 'pick' || state.picked !== null) return
    update(currentIdx, { kind: 'pick', picked: opt, submitted: true })
  }

  const handleToggleFlag = (i: number) => {
    if (state.kind !== 'flag' || state.submitted) return
    const has = state.flagged.includes(i)
    update(currentIdx, {
      kind: 'flag',
      flagged: has ? state.flagged.filter((x) => x !== i) : [...state.flagged, i],
      cleanMarked: false,
      submitted: false,
    })
  }

  const handleToggleClean = () => {
    if (state.kind !== 'flag' || state.submitted) return
    update(currentIdx, {
      kind: 'flag',
      flagged: [],
      cleanMarked: !state.cleanMarked,
      submitted: false,
    })
  }

  const handleCheckProofread = () => {
    if (state.kind !== 'flag' || state.submitted) return
    if (state.flagged.length === 0 && !state.cleanMarked) return
    update(currentIdx, { ...state, submitted: true })
  }

  const handleAddLetter = (poolIdx: number) => {
    if (state.kind !== 'build' || state.submitted !== null) return
    if (state.build.includes(poolIdx)) return
    update(currentIdx, {
      kind: 'build',
      build: [...state.build, poolIdx],
      submitted: null,
    })
  }

  const handleBackspace = () => {
    if (state.kind !== 'build' || state.submitted !== null) return
    if (state.build.length === 0) return
    update(currentIdx, {
      kind: 'build',
      build: state.build.slice(0, -1),
      submitted: null,
    })
  }

  const handleClear = () => {
    if (state.kind !== 'build' || state.submitted !== null) return
    update(currentIdx, { kind: 'build', build: [], submitted: null })
  }

  const handleSubmitBuild = () => {
    if (current.kind !== 'construction') return
    if (state.kind !== 'build' || state.submitted !== null) return
    if (state.build.length === 0) return
    const assembled = state.build.map((i) => current.pool[i]).join('')
    update(currentIdx, {
      kind: 'build',
      build: state.build,
      submitted: assembled === current.target,
    })
  }

  const handleAdvance = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1)
      return
    }
    const correctCount = rounds.reduce(
      (n, r, i) => n + (isRoundCorrect(r, states[i]) ? 1 : 0),
      0,
    )
    recordMixedAttempt(correctCount, total)
    setDone(true)
  }

  const reset = () => {
    setStates(rounds.map(initialState))
    setCurrentIdx(0)
    setDone(false)
  }

  if (done) {
    return (
      <DrillShell
        eyebrow="Mixed review · Results"
        title="Results"
        tone="hero"
        total={total}
        current={total - 1}
      >
        <DrillResults answers={answers} onTryAgain={reset} />
      </DrillShell>
    )
  }

  const kindLabel = {
    distractor: 'Which fits?',
    transition: 'What comes next?',
    proofread: 'Proofread.',
    construction: 'Build the word.',
  }[current.kind]

  const rasmTag = rasmOnly ? ' · Rasm' : ''
  const sprintTag = timedSeconds ? ' · Sprint' : ''
  const eyebrow =
    current.kind === 'transition'
      ? `Mixed${sprintTag}${rasmTag} · ${surah?.nameComplex ?? ''} · ${current.fromAyah}→${current.toAyah}`
      : `Mixed${sprintTag}${rasmTag} · ${surah?.nameComplex ?? ''} · Ayah ${
          (current as Exclude<AnyRound, TransitionRoundData>).ayahNumber
        }`

  const pct = timedSeconds ? (remaining / timedSeconds) * 100 : 0
  const urgent = timedSeconds ? remaining <= Math.max(5, timedSeconds * 0.15) : false

  return (
    <DrillShell
      eyebrow={eyebrow}
      title={kindLabel}
      arabicTitle={surah?.nameArabic}
      tone="hero"
      total={total}
      current={currentIdx}
    >
      {timedSeconds && (
        <div className="-mt-2 mb-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hairline/60">
            <div
              className="h-full transition-[width] duration-500 ease-linear"
              style={{
                width: `${pct}%`,
                background: urgent ? 'var(--color-incorrect)' : 'var(--color-hero)',
              }}
            />
          </div>
          <div
            className={cn(
              'font-mono text-[12px] font-bold tabular-nums',
              urgent ? 'text-incorrect' : 'text-hero-deep',
            )}
          >
            {String(Math.floor(remaining / 60)).padStart(1, '0')}:
            {String(remaining % 60).padStart(2, '0')}
          </div>
        </div>
      )}

      {current.kind === 'distractor' && state.kind === 'pick' && (
        <DistractorRound
          round={current}
          picked={state.picked}
          correct={state.picked === current.target}
          onPick={handlePick}
          accent="var(--color-hero)"
          accentToneClass="text-hero-deep"
        />
      )}
      {current.kind === 'transition' && state.kind === 'pick' && (
        <TransitionRound
          round={current}
          picked={state.picked}
          correct={state.picked === current.target}
          onPick={handlePick}
          accentToneClass="text-hero-deep"
        />
      )}
      {current.kind === 'proofread' && state.kind === 'flag' && (
        <ProofreadRound
          round={current}
          flagged={state.flagged}
          cleanMarked={state.cleanMarked}
          submitted={state.submitted}
          onToggleFlag={handleToggleFlag}
          onToggleClean={handleToggleClean}
          accentToneClass="text-hero-deep"
        />
      )}
      {current.kind === 'construction' && state.kind === 'build' && (
        <ConstructionRound
          round={current}
          build={state.build}
          submitted={state.submitted}
          onAddLetter={handleAddLetter}
          onBackspace={handleBackspace}
          onClear={handleClear}
          accentToneClass="text-hero-deep"
        />
      )}

      {current.kind === 'proofread' && state.kind === 'flag' && !state.submitted ? (
        <PrimaryButton
          tone="ink"
          disabled={state.flagged.length === 0 && !state.cleanMarked}
          onClick={handleCheckProofread}
          className="mt-8"
        >
          {state.flagged.length === 0 && !state.cleanMarked
            ? 'Pick suspects or mark clean'
            : `Check${state.cleanMarked ? '' : ` · ${state.flagged.length} flagged`}`}
          {(state.flagged.length > 0 || state.cleanMarked) && <Icon name="arrow-r" size={16} />}
        </PrimaryButton>
      ) : current.kind === 'construction' && state.kind === 'build' && state.submitted === null ? (
        <PrimaryButton
          tone="ink"
          disabled={state.build.length === 0}
          onClick={handleSubmitBuild}
          className="mt-8"
        >
          {state.build.length === 0 ? 'Tap letters to build' : 'Check word'}
          {state.build.length > 0 && <Icon name="arrow-r" size={16} />}
        </PrimaryButton>
      ) : (
        <PrimaryButton
          tone="ink"
          disabled={!roundDone}
          onClick={handleAdvance}
          className="mt-8"
        >
          {!roundDone
            ? 'Make a call to continue'
            : currentIdx < total - 1
              ? 'Next round'
              : 'See results'}
          {roundDone && <Icon name="arrow-r" size={16} />}
        </PrimaryButton>
      )}
    </DrillShell>
  )
}
