import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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

type Direction = 'next' | 'prev'

interface AyahRef {
  surahId: number
  surahName: string
  surahArabic: string
  ayahNumber: number
  text: string
  translation: string
}

interface Round {
  direction: Direction
  prompt: AyahRef
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
        translation: a.translation,
      })
    }
  }
  return out
}

function keyOf(a: AyahRef): string {
  return `${a.surahId}:${a.ayahNumber}`
}

function buildRounds(direction: Direction): Round[] {
  const corpus = flatCorpus()

  const candidates: { prompt: AyahRef; target: AyahRef }[] = []
  const bySurah = new Map<number, AyahRef[]>()
  for (const a of corpus) {
    const list = bySurah.get(a.surahId) ?? []
    list.push(a)
    bySurah.set(a.surahId, list)
  }

  for (const [, list] of bySurah) {
    for (let i = 0; i < list.length; i++) {
      if (direction === 'next' && i < list.length - 1) {
        candidates.push({ prompt: list[i], target: list[i + 1] })
      }
      if (direction === 'prev' && i > 0) {
        candidates.push({ prompt: list[i], target: list[i - 1] })
      }
    }
  }

  const picks = shuffle(candidates).slice(
    0,
    Math.min(TARGET_ROUNDS, candidates.length),
  )

  return picks.map(({ prompt, target }) => {
    const targetKey = keyOf(target)
    const promptKey = keyOf(prompt)
    const distractorPool = corpus.filter(
      (a) => keyOf(a) !== targetKey && keyOf(a) !== promptKey,
    )
    const sameSurah = distractorPool.filter((a) => a.surahId === prompt.surahId)
    const otherSurah = distractorPool.filter((a) => a.surahId !== prompt.surahId)
    const distractors = [
      ...shuffle(sameSurah).slice(0, 2),
      ...shuffle(otherSurah).slice(0, 1),
    ].slice(0, 2)
    const options = shuffle([target, ...distractors])
    return { direction, prompt, target, options }
  })
}

export function NextAyahPage() {
  const [params, setParams] = useSearchParams()
  const direction: Direction = params.get('dir') === 'prev' ? 'prev' : 'next'

  const rounds = useMemo(() => buildRounds(direction), [direction])

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
    const k = keyOf(opt)
    setStates((prev) => prev.map((s, i) => (i === idx ? k : s)))
  }

  const handleAdvance = () => {
    if (idx < total - 1) {
      setIdx(idx + 1)
      return
    }
    const perSurah = new Map<number, { correct: number; total: number }>()
    rounds.forEach((r, i) => {
      const rec = perSurah.get(r.prompt.surahId) ?? { correct: 0, total: 0 }
      rec.total += 1
      if (states[i] === keyOf(r.target)) rec.correct += 1
      perSurah.set(r.prompt.surahId, rec)
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

  const switchDirection = (d: Direction) => {
    if (d === direction) return
    const next = new URLSearchParams(params)
    next.set('dir', d)
    setParams(next, { replace: true })
    setStates([])
    setIdx(0)
    setDone(false)
  }

  const directionLabel = direction === 'next' ? 'What comes next?' : 'What came before?'
  const directionEyebrow = direction === 'next' ? 'Musābaqah · Next ayah' : 'Musābaqah · Previous ayah'

  if (!current) {
    return (
      <DrillShell
        eyebrow={directionEyebrow}
        title={directionLabel}
        tone="hero"
        total={1}
        current={0}
      >
        <div className="rounded-xl border border-dashed border-hairline bg-card p-8 text-center text-[13px] text-ink-soft">
          Not enough corpus for this drill yet.
        </div>
      </DrillShell>
    )
  }

  const answers: DrillAnswer[] = rounds.map((r, i) => ({
    label: `${r.prompt.surahName} · ${r.prompt.ayahNumber} → ${r.target.ayahNumber}`,
    correct: states[i] === keyOf(r.target),
  }))

  if (done) {
    return (
      <DrillShell
        eyebrow={`${directionEyebrow} · Results`}
        title={directionLabel}
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
      eyebrow={`${directionEyebrow} · ${current.prompt.surahName}`}
      title={directionLabel}
      arabicTitle={current.prompt.surahArabic}
      tone="hero"
      total={total}
      current={idx}
    >
      <div className="mb-4 inline-flex gap-1 rounded-full border border-hairline bg-card p-1">
        {(['next', 'prev'] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => switchDirection(d)}
            className={cn(
              'rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-colors',
              direction === d
                ? 'bg-hero-soft text-hero-deep'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {d === 'next' ? 'Next' : 'Previous'}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-hairline bg-card p-5 shadow-soft-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
            {current.prompt.surahName} · ayah {current.prompt.ayahNumber}
          </span>
          <span
            dir="rtl"
            className="text-[12px] text-ink-soft"
            style={{ fontFamily: 'var(--font-arabic-ui)' }}
          >
            {current.prompt.surahArabic}
          </span>
        </div>
        <div
          dir="rtl"
          className="mt-3 text-center text-ink"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(22px, 5vw, 30px)',
            lineHeight: 2,
          }}
        >
          {current.prompt.text}
        </div>
        <div className="mt-2 text-center text-[12px] italic text-ink-muted">
          "{current.prompt.translation}"
        </div>
      </div>

      <div className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hero-deep">
        {direction === 'next'
          ? 'Pick the ayah that immediately follows'
          : 'Pick the ayah that immediately precedes'}
      </div>
      <div className="mt-3 grid gap-3">
        {current.options.map((opt) => {
          const k = keyOf(opt)
          return (
            <OptionButton
              key={k}
              arabic
              full
              locked={picked !== null}
              state={optionState(picked, k, targetKey)}
              onClick={() => handlePick(opt)}
            >
              <div className="flex w-full flex-col gap-1">
                <div
                  dir="rtl"
                  className="text-[18px] leading-loose"
                  style={{ fontFamily: 'var(--font-arabic-ayah)' }}
                >
                  {opt.text}
                </div>
                {picked !== null && (
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink-muted">
                    {opt.surahName} · ayah {opt.ayahNumber}
                  </div>
                )}
              </div>
            </OptionButton>
          )
        })}
      </div>

      <div className="mt-6">
        <Feedback
          show={picked !== null}
          correct={correct}
          correctLabel={direction === 'next' ? 'Chain held' : 'Recall held'}
          incorrectLabel="Different ayah"
          correctText={`${current.prompt.surahName} · ayah ${current.prompt.ayahNumber} ${direction === 'next' ? 'leads into' : 'follows'} ayah ${current.target.ayahNumber}.`}
          incorrectText={`The ${direction === 'next' ? 'following' : 'preceding'} ayah is ${current.target.ayahNumber} in ${current.prompt.surahName}.`}
        />
      </div>

      <PrimaryButton
        tone="ink"
        disabled={picked === null}
        onClick={handleAdvance}
        className={cn('mt-8')}
      >
        {picked === null
          ? 'Pick an ayah'
          : idx < total - 1
            ? 'Next round'
            : 'See results'}
        {picked !== null && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DrillShell>
  )
}
