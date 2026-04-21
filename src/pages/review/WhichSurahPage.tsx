import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { AyahCard } from '@/components/drill/AyahCard'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { OptionButton, optionState } from '@/components/ui/OptionButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Icon } from '@/components/ui/Icon'
import { Feedback } from '@/components/ui/Feedback'
import { SURAHS, SURAH_BY_ID } from '@/data/quran'
import { shuffle } from '@/lib/drill'
import { getKnown, recordMixedAttempt } from '@/lib/progress'

const TARGET_ROUNDS = 6
const CHOICES = 3

interface Round {
  ayahText: string
  translation: string
  ayahNumber: number
  surahName: string
  surahId: number
  options: { id: number; label: string }[]
}

function buildRounds(pool: number[]): Round[] {
  if (pool.length < 2) return []
  const rounds: Round[] = []
  const ids = [...pool]
  shuffle(ids)
  for (const id of ids) {
    const surah = SURAH_BY_ID.get(id)
    if (!surah) continue
    const ayah = surah.ayat[Math.floor(Math.random() * surah.ayat.length)]
    const distractorPool = pool.filter((x) => x !== id)
    const distractors = shuffle(distractorPool)
      .slice(0, CHOICES - 1)
      .map((did) => ({ id: did, label: SURAH_BY_ID.get(did)!.nameComplex }))
    const options = shuffle([
      { id: surah.id, label: surah.nameComplex },
      ...distractors,
    ])
    rounds.push({
      ayahText: ayah.text,
      translation: ayah.translation,
      ayahNumber: ayah.number,
      surahName: surah.nameComplex,
      surahId: surah.id,
      options,
    })
    if (rounds.length >= TARGET_ROUNDS) break
  }
  return rounds
}

export function WhichSurahPage() {
  const pool = useMemo(() => {
    const known = getKnown()
    if (known.length >= 2) return known
    return SURAHS.map((s) => s.id)
  }, [])
  const rounds = useMemo(() => buildRounds(pool), [pool])

  if (rounds.length === 0) return <Navigate to="/home" replace />

  return <WhichSurahDrill rounds={rounds} />
}

interface RoundState {
  pickedId: number | null
}

function WhichSurahDrill({ rounds }: { rounds: Round[] }) {
  const total = rounds.length
  const [states, setStates] = useState<RoundState[]>(() =>
    rounds.map(() => ({ pickedId: null })),
  )
  const [currentIdx, setCurrentIdx] = useState(0)
  const [done, setDone] = useState(false)

  const current = rounds[currentIdx]
  const state = states[currentIdx]
  const picked = state.pickedId
  const correct = picked === current.surahId

  const answers = useMemo<DrillAnswer[]>(
    () =>
      rounds.map((r, i) => ({
        label: `Ayah ${r.ayahNumber} → ${r.surahName}`,
        correct: states[i].pickedId === r.surahId,
      })),
    [rounds, states],
  )

  const handlePick = (id: number) => {
    if (picked !== null) return
    setStates((prev) =>
      prev.map((s, i) => (i === currentIdx ? { pickedId: id } : s)),
    )
  }

  const handleAdvance = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1)
      return
    }
    const correctCount = rounds.reduce(
      (n, r, i) => n + (states[i].pickedId === r.surahId ? 1 : 0),
      0,
    )
    recordMixedAttempt(correctCount, total)
    setDone(true)
  }

  const reset = () => {
    setStates(rounds.map(() => ({ pickedId: null })))
    setCurrentIdx(0)
    setDone(false)
  }

  if (done) {
    return (
      <DrillShell
        eyebrow="Which sūrah? · Results"
        title="Results"
        tone="hero"
        total={total}
        current={total - 1}
      >
        <DrillResults answers={answers} onTryAgain={reset} />
      </DrillShell>
    )
  }

  const pickedLabel = current.options.find((o) => o.id === picked)?.label

  return (
    <DrillShell
      eyebrow={`Which sūrah? · Ayah ${current.ayahNumber}`}
      title="Which sūrah is this from?"
      tone="hero"
      total={total}
      current={currentIdx}
    >
      <AyahCard translation={current.translation}>
        <div
          dir="rtl"
          className="text-ink"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(22px, 5vw, 30px)',
            lineHeight: 2,
          }}
        >
          {current.ayahText}
        </div>
      </AyahCard>

      <div className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hero-deep">
        Pick the sūrah
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        {current.options.map((opt) => (
          <OptionButton
            key={opt.id}
            locked={picked !== null}
            state={optionState(
              picked === null ? null : String(picked),
              String(opt.id),
              String(current.surahId),
            )}
            onClick={() => handlePick(opt.id)}
          >
            {opt.label}
          </OptionButton>
        ))}
      </div>

      <div className="mt-6">
        <Feedback
          show={picked !== null}
          correct={correct}
          correctLabel="Located"
          incorrectLabel="Not this one"
          correctText={`Ayah ${current.ayahNumber} of ${current.surahName}.`}
          incorrectText={`Ayah ${current.ayahNumber} of ${current.surahName}, not ${pickedLabel ?? '—'}.`}
        />
      </div>

      <PrimaryButton
        tone="ink"
        disabled={picked === null}
        onClick={handleAdvance}
        className="mt-8"
      >
        {picked === null
          ? 'Pick a sūrah to continue'
          : currentIdx < total - 1
            ? 'Next round'
            : 'See results'}
        {picked !== null && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DrillShell>
  )
}
