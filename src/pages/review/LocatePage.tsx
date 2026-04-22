import { useMemo, useState } from 'react'
import { DrillShell } from '@/components/drill/DrillShell'
import { OptionButton, optionState } from '@/components/ui/OptionButton'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Feedback } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'
import { SURAHS } from '@/data/quran'
import { shuffle } from '@/lib/drill'
import { recordAttempt } from '@/lib/progress'
import { cn } from '@/lib/cn'

const TARGET_ROUNDS = 10
const EDGE_TRIM = 1

interface AyahRef {
  surahId: number
  surahName: string
  surahArabic: string
  ayahNumber: number
  text: string
  words: string[]
  translation: string
}

interface Round {
  phrase: string
  target: AyahRef
  options: AyahRef[]
}

function flatCorpus(): AyahRef[] {
  const out: AyahRef[] = []
  for (const s of SURAHS) {
    for (const a of s.ayat) {
      out.push({
        surahId: s.id,
        surahName: s.nameComplex,
        surahArabic: s.nameArabic,
        ayahNumber: a.number,
        text: a.text,
        words: a.words.map((w) => w.text),
        translation: a.translation,
      })
    }
  }
  return out
}

function midPhrase(words: string[]): string {
  if (words.length <= 2) return words.join(' ')
  const trim = Math.min(EDGE_TRIM, Math.floor((words.length - 1) / 2))
  const mid = words.slice(trim, words.length - trim)
  const take = Math.min(mid.length, 4)
  const start = Math.max(0, Math.floor((mid.length - take) / 2))
  return mid.slice(start, start + take).join(' ')
}

function keyOf(a: AyahRef): string {
  return `${a.surahId}:${a.ayahNumber}`
}

function buildRounds(): Round[] {
  const corpus = flatCorpus().filter((a) => a.words.length >= 3)
  const picks = shuffle(corpus).slice(0, Math.min(TARGET_ROUNDS, corpus.length))
  return picks.map((target) => {
    const sameSurah = corpus.filter(
      (a) => a.surahId === target.surahId && a.ayahNumber !== target.ayahNumber,
    )
    const other = corpus.filter((a) => a.surahId !== target.surahId)
    const distractors = [
      ...shuffle(sameSurah).slice(0, 1),
      ...shuffle(other).slice(0, 2),
    ].slice(0, 3)
    const options = shuffle([target, ...distractors])
    return { phrase: midPhrase(target.words), target, options }
  })
}

export function LocatePage() {
  const rounds = useMemo(() => buildRounds(), [])

  const [states, setStates] = useState<(string | null)[]>(() =>
    rounds.map(() => null),
  )
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState(false)

  const current = rounds[idx]
  const picked = states[idx]
  const total = rounds.length
  const targetKey = current ? keyOf(current.target) : ''
  const correct = picked === targetKey

  const handlePick = (opt: AyahRef) => {
    if (picked !== null) return
    setStates((prev) => prev.map((s, i) => (i === idx ? keyOf(opt) : s)))
  }

  const handleAdvance = () => {
    if (idx < total - 1) {
      setIdx(idx + 1)
      return
    }
    const perSurah = new Map<number, { correct: number; total: number }>()
    rounds.forEach((r, i) => {
      const rec = perSurah.get(r.target.surahId) ?? { correct: 0, total: 0 }
      rec.total += 1
      if (states[i] === keyOf(r.target)) rec.correct += 1
      perSurah.set(r.target.surahId, rec)
    })
    for (const [surahId, rec] of perSurah) {
      recordAttempt({
        tier: 'hard',
        surahId,
        correct: rec.correct,
        total: rec.total,
      })
    }
    setDone(true)
  }

  const reset = () => {
    setStates(rounds.map(() => null))
    setIdx(0)
    setDone(false)
  }

  const answers: DrillAnswer[] = rounds.map((r, i) => ({
    label: `${r.target.surahName} · ayah ${r.target.ayahNumber}`,
    correct: states[i] === keyOf(r.target),
  }))

  if (done) {
    return (
      <DrillShell
        eyebrow="Musābaqah · Locate · Results"
        title="Locate the phrase"
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
      eyebrow={`Musābaqah · Locate · Round ${idx + 1} of ${total}`}
      title="Where is this from?"
      tone="hero"
      total={total}
      current={idx}
    >
      <div className="rounded-xl border border-hairline bg-card p-6 shadow-soft-sm">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Identify the sūrah and ayah
        </div>
        <div
          dir="rtl"
          className="mt-3 text-center text-ink"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(24px, 5.5vw, 34px)',
            lineHeight: 2,
          }}
        >
          … {current.phrase} …
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {current.options.map((opt) => {
          const k = keyOf(opt)
          return (
            <OptionButton
              key={k}
              full
              locked={picked !== null}
              state={optionState(picked, k, targetKey)}
              onClick={() => handlePick(opt)}
            >
              <div className="flex w-full items-center justify-between gap-3">
                <div className="text-left">
                  <div className="text-[14px] font-bold text-ink">
                    {opt.surahName}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    Ayah {opt.ayahNumber}
                  </div>
                </div>
                <div
                  dir="rtl"
                  className="text-[16px] text-ink-soft"
                  style={{ fontFamily: 'var(--font-arabic-ui)' }}
                >
                  {opt.surahArabic}
                </div>
              </div>
            </OptionButton>
          )
        })}
      </div>

      <div className="mt-6">
        <Feedback
          show={picked !== null}
          correct={correct}
          correctLabel="Located"
          incorrectLabel="Different ayah"
          correctText={`That phrase is from ${current.target.surahName} · ayah ${current.target.ayahNumber}.`}
          incorrectText={`That phrase is from ${current.target.surahName} · ayah ${current.target.ayahNumber}, not where you picked.`}
        />
      </div>

      <PrimaryButton
        tone="ink"
        disabled={picked === null}
        onClick={handleAdvance}
        className={cn('mt-8')}
      >
        {picked === null
          ? 'Pick a location'
          : idx < total - 1
            ? 'Next phrase'
            : 'See results'}
        {picked !== null && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DrillShell>
  )
}
