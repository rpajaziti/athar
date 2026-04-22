import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { AyahCard, Blank } from '@/components/drill/AyahCard'
import { OptionButton, optionState } from '@/components/ui/OptionButton'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Feedback } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'
import { SURAHS } from '@/data/quran'
import { shuffle } from '@/lib/drill'
import { recordAttempt } from '@/lib/progress'
import { cn } from '@/lib/cn'

const TARGET_ROUNDS = 12

interface Round {
  surahId: number
  surahName: string
  surahArabic: string
  ayahNumber: number
  translation: string
  words: string[]
  target: string
  options: string[]
}

function surahJuz(id: number): number {
  if (id === 1) return 1
  if (id >= 78 && id <= 114) return 30
  if (id >= 67) return 29
  if (id >= 58) return 28
  if (id >= 51) return 27
  if (id >= 46) return 26
  return 1
}

function buildRounds(juz: number): Round[] | null {
  const surahs = SURAHS.filter((s) => surahJuz(s.id) === juz)
  if (surahs.length === 0) return null

  type Entry = {
    surahId: number
    surahName: string
    surahArabic: string
    ayahNumber: number
    translation: string
    words: string[]
    last: string
  }
  const entries: Entry[] = []
  for (const s of surahs) {
    for (const a of s.ayat) {
      if (a.words.length < 2) continue
      entries.push({
        surahId: s.id,
        surahName: s.nameComplex,
        surahArabic: s.nameArabic,
        ayahNumber: a.number,
        translation: a.translation,
        words: a.words.map((w) => w.text),
        last: a.words[a.words.length - 1].text,
      })
    }
  }
  if (entries.length < 3) return null

  const picks = shuffle(entries).slice(0, Math.min(TARGET_ROUNDS, entries.length))

  return picks.map((e) => {
    const pool = entries
      .filter(
        (o) =>
          !(o.surahId === e.surahId && o.ayahNumber === e.ayahNumber) &&
          o.last !== e.last,
      )
      .map((o) => o.last)
    const uniquePool = Array.from(new Set(pool))
    const distractors = shuffle(uniquePool).slice(0, 2)
    const options = shuffle([e.last, ...distractors])
    return {
      surahId: e.surahId,
      surahName: e.surahName,
      surahArabic: e.surahArabic,
      ayahNumber: e.ayahNumber,
      translation: e.translation,
      words: e.words,
      target: e.last,
      options,
    }
  })
}

export function JuzEndingsPage() {
  const { juz: j } = useParams<{ juz: string }>()
  const juz = Number(j)
  const rounds = useMemo(() => buildRounds(juz), [juz])

  const [states, setStates] = useState<(string | null)[]>(() =>
    rounds ? rounds.map(() => null) : [],
  )
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState(false)

  if (!rounds || rounds.length === 0) {
    return <Navigate to="/home" replace />
  }

  const current = rounds[idx]
  const picked = states[idx]
  const correct = picked === current.target
  const total = rounds.length

  const handlePick = (opt: string) => {
    if (picked !== null) return
    setStates((prev) => prev.map((s, i) => (i === idx ? opt : s)))
  }

  const handleAdvance = () => {
    if (idx < total - 1) {
      setIdx(idx + 1)
      return
    }
    const perSurah = new Map<number, { correct: number; total: number }>()
    rounds.forEach((r, i) => {
      const rec = perSurah.get(r.surahId) ?? { correct: 0, total: 0 }
      rec.total += 1
      if (states[i] === r.target) rec.correct += 1
      perSurah.set(r.surahId, rec)
    })
    for (const [surahId, rec] of perSurah) {
      recordAttempt({
        tier: 'medium',
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
    label: `${r.surahName} · ${r.ayahNumber} → ${r.target}`,
    correct: states[i] === r.target,
  }))

  if (done) {
    return (
      <DrillShell
        eyebrow={`Juzʾ ${juz} · Endings sprint · Results`}
        title="Fāṣila sprint"
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
      eyebrow={`Juzʾ ${juz} · ${current.surahName} · Ayah ${current.ayahNumber}`}
      title="What closes this ayah?"
      arabicTitle={current.surahArabic}
      tone="medium"
      total={total}
      current={idx}
    >
      <AyahCard
        translation={current.translation}
        ayahNumber={current.ayahNumber}
        audio={{ surahId: current.surahId, ayahNumber: current.ayahNumber }}
      >
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-ink"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(22px, 5vw, 30px)',
            lineHeight: 2,
          }}
        >
          {current.words.map((w, i) => {
            if (i !== current.words.length - 1) return <span key={i}>{w}</span>
            const state =
              picked === null ? 'idle' : correct ? 'correct' : 'wrong'
            return (
              <Blank key={i} state={state} accent="var(--color-medium)">
                {picked ?? undefined}
              </Blank>
            )
          })}
        </div>
      </AyahCard>

      <div className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-medium-deep">
        Which ending matches the rhyme?
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
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
          correctLabel="Fāṣila held"
          incorrectLabel="Different ending"
          correctText={`${current.surahName} · ayah ${current.ayahNumber} closes with ${current.target}.`}
          incorrectText={`${current.surahName} · ayah ${current.ayahNumber} closes with ${current.target}, not ${picked}. Distractors are endings from other ayat across this juzʾ.`}
        />
      </div>

      <PrimaryButton
        tone="ink"
        disabled={picked === null}
        onClick={handleAdvance}
        className={cn('mt-8')}
      >
        {picked === null
          ? 'Pick the ending'
          : idx < total - 1
            ? 'Next ayah'
            : 'See results'}
        {picked !== null && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DrillShell>
  )
}
