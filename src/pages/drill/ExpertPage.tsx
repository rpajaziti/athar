import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Icon } from '@/components/ui/Icon'
import {
  ConstructionRound,
  type ConstructionRoundData,
} from '@/components/drill/rounds'
import { SURAH_BY_ID } from '@/data/quran'
import { distractorsFor } from '@/data/distractors'
import { shuffle } from '@/lib/drill'
import { recordAttempt } from '@/lib/progress'

function splitGraphemes(word: string): string[] {
  const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  return Array.from(seg.segment(word), (s) => s.segment)
}

function buildRounds(surahId: number): ConstructionRoundData[] | null {
  const surah = SURAH_BY_ID.get(surahId)
  if (!surah) return null
  const sets = distractorsFor(surahId)
  if (sets.length === 0) return null

  return sets.map((d) => {
    const ayah = surah.ayat.find((a) => a.number === d.ayahNumber)
    if (!ayah) throw new Error(`missing ayah ${surahId}:${d.ayahNumber}`)
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
      surahId,
      ayahNumber: ayah.number,
      translation: ayah.translation,
      words: ayah.words.map((w) => w.text),
      blankIndex: d.wordIndex,
      target: d.target,
      graphemes,
      pool,
      note: d.note,
    }
  })
}

export function ExpertPage() {
  const params = useParams<{ surahId: string }>()
  const surahId = Number(params.surahId)
  const surah = SURAH_BY_ID.get(surahId)
  const rounds = useMemo(() => buildRounds(surahId), [surahId])

  if (!surah || !rounds) return <Navigate to="/home" replace />

  return <ExpertDrill surahId={surahId} rounds={rounds} />
}

function ExpertDrill({ surahId, rounds }: { surahId: number; rounds: ConstructionRoundData[] }) {
  const surah = SURAH_BY_ID.get(surahId)!
  const total = rounds.length

  const [builds, setBuilds] = useState<number[][]>(() =>
    Array.from({ length: total }, () => []),
  )
  const [submissions, setSubmissions] = useState<(boolean | null)[]>(() =>
    Array.from({ length: total }, () => null),
  )
  const [currentIdx, setCurrentIdx] = useState(0)
  const [done, setDone] = useState(false)

  const current = rounds[currentIdx]
  const build = builds[currentIdx]
  const submitted = submissions[currentIdx]
  const assembled = build.map((i) => current.pool[i]).join('')
  const isCorrect = assembled === current.target

  const answers = useMemo<DrillAnswer[]>(
    () =>
      rounds.map((r, i) => ({
        label: r.target,
        correct: submissions[i] === true,
      })),
    [rounds, submissions],
  )

  const addLetter = (poolIdx: number) => {
    if (submitted !== null) return
    if (build.includes(poolIdx)) return
    const next = [...builds]
    next[currentIdx] = [...build, poolIdx]
    setBuilds(next)
  }

  const backspace = () => {
    if (submitted !== null) return
    if (build.length === 0) return
    const next = [...builds]
    next[currentIdx] = build.slice(0, -1)
    setBuilds(next)
  }

  const clear = () => {
    if (submitted !== null) return
    const next = [...builds]
    next[currentIdx] = []
    setBuilds(next)
  }

  const submit = () => {
    if (submitted !== null) return
    const next = [...submissions]
    next[currentIdx] = isCorrect
    setSubmissions(next)
  }

  const handleAdvance = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1)
      return
    }
    const correctCount = submissions.filter((s) => s === true).length
    recordAttempt({ tier: 'expert', surahId, correct: correctCount, total })
    setDone(true)
  }

  const reset = () => {
    setBuilds(Array.from({ length: total }, () => []))
    setSubmissions(Array.from({ length: total }, () => null))
    setCurrentIdx(0)
    setDone(false)
  }

  if (done) {
    return (
      <DrillShell
        eyebrow={`Expert · ${surah.nameComplex}`}
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
      eyebrow={`Expert · Ayah ${current.ayahNumber} of ${surah.versesCount}`}
      title="Build the word."
      arabicTitle={surah.nameArabic}
      tone="medium"
      total={total}
      current={currentIdx}
    >
      <ConstructionRound
        round={current}
        build={build}
        submitted={submitted}
        onAddLetter={addLetter}
        onBackspace={backspace}
        onClear={clear}
      />

      {submitted === null ? (
        <PrimaryButton
          tone="ink"
          disabled={build.length === 0}
          onClick={submit}
          className="mt-8"
        >
          {build.length === 0 ? 'Tap letters to build' : 'Check word'}
          {build.length > 0 && <Icon name="arrow-r" size={16} />}
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
