import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { OptionButton, optionState } from '@/components/ui/OptionButton'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Feedback } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'
import { SURAHS, SURAH_BY_ID } from '@/data/quran'
import { shuffle } from '@/lib/drill'
import { recordAttempt } from '@/lib/progress'
import { cn } from '@/lib/cn'

const TARGET_ROUNDS = 8

interface SurahOpener {
  surahId: number
  surahName: string
  surahArabic: string
  openerAyahNumber: number
  openerText: string
  translation: string
}

interface LastAyahRef {
  surahId: number
  surahName: string
  surahArabic: string
  ayahNumber: number
  text: string
  translation: string
}

interface Round {
  from: LastAyahRef
  target: SurahOpener
  options: SurahOpener[]
}

function openerOf(surahId: number): SurahOpener | null {
  const s = SURAH_BY_ID.get(surahId)
  if (!s || s.ayat.length === 0) return null
  const a = s.ayat[0]
  return {
    surahId: s.id,
    surahName: s.nameComplex,
    surahArabic: s.nameArabic,
    openerAyahNumber: a.number,
    openerText: a.text,
    translation: a.translation,
  }
}

function lastOf(surahId: number): LastAyahRef | null {
  const s = SURAH_BY_ID.get(surahId)
  if (!s || s.ayat.length === 0) return null
  const a = s.ayat[s.ayat.length - 1]
  return {
    surahId: s.id,
    surahName: s.nameComplex,
    surahArabic: s.nameArabic,
    ayahNumber: a.number,
    text: a.text,
    translation: a.translation,
  }
}

function buildRounds(): Round[] {
  const seededIds = new Set(SURAHS.map((s) => s.id))
  const pairs: { from: LastAyahRef; target: SurahOpener }[] = []
  for (const s of SURAHS) {
    const nextId = s.id + 1
    if (!seededIds.has(nextId)) continue
    const from = lastOf(s.id)
    const target = openerOf(nextId)
    if (from && target) pairs.push({ from, target })
  }
  if (pairs.length === 0) return []

  const allOpeners = SURAHS.map((s) => openerOf(s.id)).filter(
    (o): o is SurahOpener => o !== null,
  )

  const picks = shuffle(pairs).slice(0, Math.min(TARGET_ROUNDS, pairs.length))

  return picks.map(({ from, target }) => {
    const pool = allOpeners.filter((o) => o.surahId !== target.surahId)
    const distractors = shuffle(pool).slice(0, 3)
    const options = shuffle([target, ...distractors])
    return { from, target, options }
  })
}

export function ConnectPage() {
  const rounds = useMemo(() => buildRounds(), [])

  const [states, setStates] = useState<(number | null)[]>(() =>
    rounds.map(() => null),
  )
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState(false)

  if (rounds.length === 0) return <Navigate to="/home" replace />

  const current = rounds[idx]
  const picked = states[idx]
  const total = rounds.length
  const targetId = current.target.surahId
  const correct = picked === targetId

  const handlePick = (opt: SurahOpener) => {
    if (picked !== null) return
    setStates((prev) => prev.map((s, i) => (i === idx ? opt.surahId : s)))
  }

  const handleAdvance = () => {
    if (idx < total - 1) {
      setIdx(idx + 1)
      return
    }
    const perSurah = new Map<number, { correct: number; total: number }>()
    rounds.forEach((r, i) => {
      const rec = perSurah.get(r.from.surahId) ?? { correct: 0, total: 0 }
      rec.total += 1
      if (states[i] === r.target.surahId) rec.correct += 1
      perSurah.set(r.from.surahId, rec)
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
    label: `${r.from.surahName} → ${r.target.surahName}`,
    correct: states[i] === r.target.surahId,
  }))

  const pickedOpt =
    picked !== null ? current.options.find((o) => o.surahId === picked) : null

  if (done) {
    return (
      <DrillShell
        eyebrow="Musābaqah · Connect · Results"
        title="Connect the ayat"
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
      eyebrow={`Musābaqah · Connect · ${current.from.surahName} → ?`}
      title="Which sūrah follows?"
      arabicTitle={current.from.surahArabic}
      tone="hero"
      total={total}
      current={idx}
    >
      <div className="rounded-xl border border-hairline bg-card p-5 shadow-soft-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
            End of {current.from.surahName} · ayah {current.from.ayahNumber}
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
          {current.from.text}
        </div>
        <div className="mt-2 text-center text-[12px] italic text-ink-muted">
          "{current.from.translation}"
        </div>
      </div>

      <div className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hero-deep">
        Pick the opener of the next sūrah
      </div>
      <div className="mt-3 grid gap-3">
        {current.options.map((opt) => (
          <OptionButton
            key={opt.surahId}
            full
            locked={picked !== null}
            state={optionState(
              picked !== null ? String(picked) : null,
              String(opt.surahId),
              String(targetId),
            )}
            onClick={() => handlePick(opt)}
          >
            <div className="flex w-full flex-col gap-1">
              <div
                dir="rtl"
                className="text-[18px] leading-loose text-ink"
                style={{ fontFamily: 'var(--font-arabic-ayah)' }}
              >
                {opt.openerText}
              </div>
              {picked !== null && (
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink-muted">
                  {opt.surahName} · ayah {opt.openerAyahNumber}
                </div>
              )}
            </div>
          </OptionButton>
        ))}
      </div>

      <div className="mt-6">
        <Feedback
          show={picked !== null}
          correct={correct}
          correctLabel="Connected"
          incorrectLabel="Different opener"
          correctText={`${current.from.surahName} is followed by ${current.target.surahName}.`}
          incorrectText={`${current.from.surahName} is followed by ${current.target.surahName}, not ${pickedOpt?.surahName ?? '?'}.`}
        />
      </div>

      <PrimaryButton
        tone="ink"
        disabled={picked === null}
        onClick={handleAdvance}
        className={cn('mt-8')}
      >
        {picked === null
          ? 'Pick the opener'
          : idx < total - 1
            ? 'Next pair'
            : 'See results'}
        {picked !== null && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DrillShell>
  )
}
