import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { AyahCard } from '@/components/drill/AyahCard'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { OptionButton, optionState } from '@/components/ui/OptionButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Icon } from '@/components/ui/Icon'
import { Feedback } from '@/components/ui/Feedback'
import { SURAH_BY_ID } from '@/data/quran'
import { shuffle } from '@/lib/drill'
import { ayahAudioUrl, type Reciter } from '@/lib/audio'
import { getReciter, setReciter as saveReciter, recordMixedAttempt } from '@/lib/progress'
import { cn } from '@/lib/cn'

const TARGET_ROUNDS = 5
const EDGE_WORDS = 3

interface Round {
  surahId: number
  ayahNumber: number
  translation: string
  url: string
  target: string
  options: string[]
}

function sliceFirst(words: string[]): string {
  return words.slice(0, Math.min(EDGE_WORDS, words.length)).join(' ')
}

function buildRounds(surahId: number, reciter: Reciter): Round[] | null {
  const surah = SURAH_BY_ID.get(surahId)
  if (!surah) return null
  if (surah.ayat.length < 2) return null

  const firstByAyah = surah.ayat.map((a) => ({
    ayah: a,
    opener: sliceFirst(a.words.map((w) => w.text)),
  }))

  const picks = shuffle(surah.ayat).slice(
    0,
    Math.min(TARGET_ROUNDS, surah.ayat.length),
  )

  return picks.map((ayah) => {
    const target = sliceFirst(ayah.words.map((w) => w.text))
    const distractorPool = firstByAyah
      .filter((x) => x.ayah.number !== ayah.number && x.opener !== target)
      .map((x) => x.opener)
    const distractors = shuffle(distractorPool).slice(0, 2)
    return {
      surahId,
      ayahNumber: ayah.number,
      translation: ayah.translation,
      url: ayahAudioUrl(surahId, ayah.number, reciter),
      target,
      options: shuffle([target, ...distractors]),
    }
  })
}

export function AudioCuePage() {
  const { surahId: sid } = useParams<{ surahId: string }>()
  const surahId = Number(sid)
  const surah = SURAH_BY_ID.get(surahId)
  const [reciter, setReciter] = useState<Reciter>(() => getReciter() as Reciter)
  const rounds = useMemo(() => buildRounds(surahId, reciter), [surahId, reciter])

  if (!surah || !rounds || rounds.length === 0) {
    return <Navigate to="/home" replace />
  }

  return (
    <AudioDrill
      surahName={surah.nameComplex}
      arabicTitle={surah.nameArabic}
      rounds={rounds}
      reciter={reciter}
      onReciter={(r) => {
        setReciter(r)
        saveReciter(r)
      }}
    />
  )
}

interface RoundState {
  picked: string | null
}

function AudioDrill({
  surahName,
  arabicTitle,
  rounds,
  reciter,
  onReciter,
}: {
  surahName: string
  arabicTitle: string
  rounds: Round[]
  reciter: Reciter
  onReciter: (r: Reciter) => void
}) {
  const total = rounds.length
  const [states, setStates] = useState<RoundState[]>(() =>
    rounds.map(() => ({ picked: null })),
  )
  const [currentIdx, setCurrentIdx] = useState(0)
  const [done, setDone] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const current = rounds[currentIdx]
  const state = states[currentIdx]
  const picked = state.picked
  const correct = picked === current.target

  useEffect(() => {
    setAudioError(false)
    const el = audioRef.current
    if (!el) return
    el.currentTime = 0
    el.play().catch(() => {
      /* autoplay blocked — user taps button */
    })
  }, [currentIdx, reciter])

  const handlePlay = () => {
    const el = audioRef.current
    if (!el) return
    el.currentTime = 0
    el.play().catch(() => setAudioError(true))
  }

  const handlePick = (opt: string) => {
    if (picked !== null) return
    setStates((prev) => prev.map((s, i) => (i === currentIdx ? { picked: opt } : s)))
  }

  const handleAdvance = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1)
      return
    }
    const correctCount = rounds.reduce(
      (n, r, i) => n + (states[i].picked === r.target ? 1 : 0),
      0,
    )
    recordMixedAttempt(correctCount, total)
    setDone(true)
  }

  const reset = () => {
    setStates(rounds.map(() => ({ picked: null })))
    setCurrentIdx(0)
    setDone(false)
  }

  const answers = useMemo<DrillAnswer[]>(
    () =>
      rounds.map((r, i) => ({
        label: `Ayah ${r.ayahNumber} → ${r.target}`,
        correct: states[i].picked === r.target,
      })),
    [rounds, states],
  )

  if (done) {
    return (
      <DrillShell
        eyebrow={`Audio cue · ${surahName} · Results`}
        title="Results"
        arabicTitle={arabicTitle}
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
      eyebrow={`Audio cue · ${surahName} · Ayah ${current.ayahNumber}`}
      title="Which opener did you hear?"
      arabicTitle={arabicTitle}
      tone="hero"
      total={total}
      current={currentIdx}
    >
      <audio
        ref={audioRef}
        src={current.url}
        preload="auto"
        onError={() => setAudioError(true)}
      />

      <AyahCard translation={picked === null ? '—' : current.translation}>
        <div className="flex flex-col items-center gap-3 py-2">
          <button
            type="button"
            onClick={handlePlay}
            className="inline-flex items-center gap-2 rounded-full border border-hero/40 bg-hero-soft px-5 py-3 text-[14px] font-bold text-hero-deep shadow-soft-sm transition-colors hover:bg-hero/10"
          >
            <Icon name="play" size={14} />
            Replay ayah
          </button>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            Reciter ·
            <select
              value={reciter}
              onChange={(e) => onReciter(e.target.value as Reciter)}
              className="rounded border border-hairline bg-card px-2 py-0.5 text-[11px] font-bold text-ink"
            >
              <option value="Husary_128kbps">al-Ḥuṣarī</option>
              <option value="Alafasy_128kbps">Mishary</option>
              <option value="Minshawy_Murattal_128kbps">al-Minshāwī</option>
            </select>
          </div>
          {audioError && (
            <div className="text-[12px] text-incorrect">
              Audio unavailable — check your connection or pick another reciter.
            </div>
          )}
        </div>
      </AyahCard>

      <div className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hero-deep">
        Which words open this ayah?
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
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
          correctLabel="Heard it"
          incorrectLabel="Not that one"
          correctText={`Ayah ${current.ayahNumber} opens with ${current.target}.`}
          incorrectText={`Ayah ${current.ayahNumber} opens with ${current.target}, not ${picked}.`}
        />
      </div>

      <PrimaryButton
        tone="ink"
        disabled={picked === null}
        onClick={handleAdvance}
        className={cn('mt-8')}
      >
        {picked === null
          ? 'Pick what you heard'
          : currentIdx < total - 1
            ? 'Next ayah'
            : 'See results'}
        {picked !== null && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DrillShell>
  )
}
