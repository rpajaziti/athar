import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Wordmark } from '@/components/ui/Wordmark'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Icon } from '@/components/ui/Icon'
import {
  ConstructionRound,
  DistractorRound,
  ProofreadRound,
  isProofreadCorrect,
  type AnyRound,
  type ConstructionRoundData,
  type DistractorRoundData,
  type ProofreadRoundData,
} from '@/components/drill/rounds'
import { SURAH_BY_ID } from '@/data/quran'
import { distractorsFor, type DistractorSet } from '@/data/distractors'
import { shuffle } from '@/lib/drill'
import { getProgress, recordMixedAttempt, type Tier } from '@/lib/progress'
import type { Surah } from '@/data/types'

const TARGET_ROUNDS = 10

type WeakTier = Exclude<Tier, 'foundations'>

interface WeakEntry {
  surahId: number
  tier: WeakTier
  weight: number
}

function collectWeakEntries(): WeakEntry[] {
  const data = getProgress()
  const entries: WeakEntry[] = []
  const tiers: WeakTier[] = ['easy', 'medium', 'hard', 'expert']

  for (const [surahIdStr, rec] of Object.entries(data.surahs)) {
    const surahId = Number(surahIdStr)
    for (const tier of tiers) {
      const t = rec[tier]
      if (!t) continue
      if (t.bestScore < 100) {
        entries.push({ surahId, tier, weight: 100 - t.bestScore })
      }
    }
  }

  return entries.sort((a, b) => b.weight - a.weight)
}

function splitGraphemes(word: string): string[] {
  const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  return Array.from(seg.segment(word), (s) => s.segment)
}

function distractorToRound(surah: Surah, d: DistractorSet): DistractorRoundData {
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

function proofreadGroupToRound(
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

function constructionToRound(surah: Surah, d: DistractorSet): ConstructionRoundData {
  const ayah = surah.ayat.find((a) => a.number === d.ayahNumber)!
  const graphemes = splitGraphemes(d.target)
  const extras = d.options
    .filter((o) => o !== d.target)
    .flatMap(splitGraphemes)
    .slice(0, Math.max(1, Math.floor(graphemes.length / 2)))
  return {
    kind: 'construction',
    surahId: surah.id,
    ayahNumber: ayah.number,
    translation: ayah.translation,
    words: ayah.words.map((w) => w.text),
    blankIndex: d.wordIndex,
    target: d.target,
    graphemes,
    pool: shuffle([...graphemes, ...extras]),
    note: d.note,
  }
}

function buildPool(entries: WeakEntry[]): AnyRound[] {
  const rounds: AnyRound[] = []
  for (const entry of entries) {
    const surah = SURAH_BY_ID.get(entry.surahId)
    if (!surah) continue
    const sets = distractorsFor(entry.surahId)
    if (sets.length === 0) continue

    if (entry.tier === 'easy' || entry.tier === 'medium') {
      for (const d of sets) rounds.push(distractorToRound(surah, d))
    } else if (entry.tier === 'hard') {
      const byAyah = new Map<number, DistractorSet[]>()
      for (const d of sets) {
        const arr = byAyah.get(d.ayahNumber) ?? []
        arr.push(d)
        byAyah.set(d.ayahNumber, arr)
      }
      let i = 0
      for (const [, group] of byAyah) {
        rounds.push(proofreadGroupToRound(surah, group, i % 3 === 0))
        i += 1
      }
    } else {
      for (const d of sets) rounds.push(constructionToRound(surah, d))
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
  if (round.kind === 'transition') return `${round.fromAyah}→${round.toAyah}`
  if (round.kind === 'proofread') {
    return round.corruptedIndexes.length > 0
      ? round.corruptedIndexes.map((i) => round.correctWords[i]).join(' · ')
      : 'clean'
  }
  return round.target
}

export function WeakSpotReviewPage() {
  const entries = useMemo(() => collectWeakEntries(), [])
  const rounds = useMemo(() => {
    const pool = shuffle(buildPool(entries))
    return pool.slice(0, Math.min(TARGET_ROUNDS, pool.length))
  }, [entries])

  if (entries.length === 0 || rounds.length === 0) {
    return <EmptyState />
  }

  return <WeakSpotDrill rounds={rounds} />
}

function EmptyState() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <MushafGrid />
      <header className="relative mx-auto flex max-w-2xl items-center justify-between px-6 pt-6 sm:pt-8">
        <Wordmark />
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted"
        >
          <Icon name="chevron" size={14} style={{ transform: 'rotate(180deg)' }} />
          Home
        </Link>
      </header>
      <main className="relative mx-auto max-w-2xl px-6 pt-16 pb-24 text-center">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
          Weak-spot review
        </div>
        <h1 className="mt-3 text-balance text-[28px] font-extrabold tracking-tight text-ink">
          Nothing to surface yet.
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          Weak-spot review pulls from sūrah-tier combinations where your best score
          is below 100%. Run a few drills first — misses feed this queue.
        </p>
        <Link
          to="/home"
          className="mt-6 inline-flex items-center gap-1.5 rounded-[14px] border border-hairline bg-card px-5 py-3 text-[14px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk"
        >
          Back home
          <Icon name="arrow-r" size={14} />
        </Link>
      </main>
    </div>
  )
}

function WeakSpotDrill({ rounds }: { rounds: AnyRound[] }) {
  const total = rounds.length
  const [states, setStates] = useState<RoundState[]>(() => rounds.map(initialState))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [done, setDone] = useState(false)

  const current = rounds[currentIdx]
  const state = states[currentIdx]
  const surah = SURAH_BY_ID.get(current.surahId)
  const roundDone = isRoundDone(current, state)

  const answers = useMemo<DrillAnswer[]>(
    () =>
      rounds.map((r, i) => {
        const sName = SURAH_BY_ID.get(r.surahId)?.nameComplex ?? '?'
        return {
          label: `${sName} · ${answerLabel(r)}`,
          correct: isRoundCorrect(r, states[i]),
        }
      }),
    [rounds, states],
  )

  const update = (idx: number, next: RoundState) =>
    setStates((prev) => prev.map((s, i) => (i === idx ? next : s)))

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
        eyebrow="Weak-spot review · Results"
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

  return (
    <DrillShell
      eyebrow={`Weak spot · ${surah?.nameComplex ?? ''}`}
      title={kindLabel}
      arabicTitle={surah?.nameArabic}
      tone="hero"
      total={total}
      current={currentIdx}
    >
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
