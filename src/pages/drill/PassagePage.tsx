import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { OptionButton, optionState } from '@/components/ui/OptionButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Icon } from '@/components/ui/Icon'
import { Feedback } from '@/components/ui/Feedback'
import { SURAH_BY_ID } from '@/data/quran'
import { distractorsFor, type DistractorSet } from '@/data/distractors'
import { shuffle } from '@/lib/drill'
import { recordAttempt } from '@/lib/progress'
import { cn } from '@/lib/cn'
import type { Ayah } from '@/data/types'

const WINDOW_SIZE = 3
const MIN_BLANKS = 2

interface PassageRound {
  ayat: Ayah[]
  blanks: Blank[]
}

interface Blank {
  ayahNumber: number
  wordIndex: number
  target: string
  options: string[]
  note: string
}

function buildPassages(surahId: number): PassageRound[] | null {
  const surah = SURAH_BY_ID.get(surahId)
  if (!surah) return null
  const sets = distractorsFor(surahId)
  if (sets.length < MIN_BLANKS) return null

  const byAyah = new Map<number, DistractorSet[]>()
  for (const d of sets) {
    const arr = byAyah.get(d.ayahNumber) ?? []
    arr.push(d)
    byAyah.set(d.ayahNumber, arr)
  }

  const rounds: PassageRound[] = []
  const usedAnchors = new Set<number>()

  for (let start = 1; start <= surah.ayat.length - WINDOW_SIZE + 1; start++) {
    const windowAyat = surah.ayat.slice(start - 1, start - 1 + WINDOW_SIZE)
    const blanks: Blank[] = []
    for (const ayah of windowAyat) {
      const ds = byAyah.get(ayah.number) ?? []
      for (const d of ds) {
        blanks.push({
          ayahNumber: d.ayahNumber,
          wordIndex: d.wordIndex,
          target: d.target,
          options: shuffle(d.options),
          note: d.note,
        })
      }
    }
    if (blanks.length >= MIN_BLANKS && !usedAnchors.has(start)) {
      usedAnchors.add(start)
      rounds.push({ ayat: windowAyat, blanks })
    }
  }

  if (rounds.length === 0) {
    const eligibleAyat = Array.from(byAyah.keys()).sort((a, b) => a - b)
    if (eligibleAyat.length >= 2) {
      const [a, b] = eligibleAyat
      const startIdx = Math.max(0, a - 1)
      const endIdx = Math.min(surah.ayat.length, b)
      const windowAyat = surah.ayat.slice(startIdx, endIdx)
      const blanks: Blank[] = []
      for (const ayah of windowAyat) {
        for (const d of byAyah.get(ayah.number) ?? []) {
          blanks.push({
            ayahNumber: d.ayahNumber,
            wordIndex: d.wordIndex,
            target: d.target,
            options: shuffle(d.options),
            note: d.note,
          })
        }
      }
      if (blanks.length >= MIN_BLANKS) rounds.push({ ayat: windowAyat, blanks })
    }
  }

  return rounds.length > 0 ? shuffle(rounds) : null
}

export function PassagePage() {
  const { surahId: sid } = useParams<{ surahId: string }>()
  const surahId = Number(sid)
  const surah = SURAH_BY_ID.get(surahId)
  const rounds = useMemo(() => buildPassages(surahId), [surahId])

  if (!surah || !rounds) return <Navigate to="/home" replace />

  return (
    <PassageDrill
      surahId={surahId}
      surahName={surah.nameComplex}
      arabicTitle={surah.nameArabic}
      round={rounds[0]}
    />
  )
}

function PassageDrill({
  surahId,
  surahName,
  arabicTitle,
  round,
}: {
  surahId: number
  surahName: string
  arabicTitle: string
  round: PassageRound
}) {
  const total = round.blanks.length
  const [picks, setPicks] = useState<(string | null)[]>(() =>
    round.blanks.map(() => null),
  )
  const [activeIdx, setActiveIdx] = useState(0)
  const [done, setDone] = useState(false)

  const blank = round.blanks[activeIdx]
  const picked = picks[activeIdx]
  const correct = picked === blank.target

  const answers = useMemo<DrillAnswer[]>(
    () =>
      round.blanks.map((b, i) => ({
        label: `Ayah ${b.ayahNumber} → ${b.target}`,
        correct: picks[i] === b.target,
      })),
    [round.blanks, picks],
  )

  const handlePick = (opt: string) => {
    if (picked !== null) return
    setPicks((prev) => prev.map((p, i) => (i === activeIdx ? opt : p)))
  }

  const handleAdvance = () => {
    if (activeIdx < total - 1) {
      setActiveIdx(activeIdx + 1)
      return
    }
    const correctCount = round.blanks.reduce(
      (n, b, i) => n + (picks[i] === b.target ? 1 : 0),
      0,
    )
    recordAttempt({ tier: 'hard', surahId, correct: correctCount, total })
    setDone(true)
  }

  const reset = () => {
    setPicks(round.blanks.map(() => null))
    setActiveIdx(0)
    setDone(false)
  }

  if (done) {
    return (
      <DrillShell
        eyebrow={`Passage · ${surahName} · Results`}
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

  const firstAyah = round.ayat[0].number
  const lastAyah = round.ayat[round.ayat.length - 1].number
  const ayahRange = firstAyah === lastAyah ? `Ayah ${firstAyah}` : `Ayat ${firstAyah}–${lastAyah}`

  const blankByAyahWord = new Map<string, number>()
  round.blanks.forEach((b, i) => blankByAyahWord.set(`${b.ayahNumber}:${b.wordIndex}`, i))

  return (
    <DrillShell
      eyebrow={`Passage · ${surahName} · ${ayahRange} · Blank ${activeIdx + 1}/${total}`}
      title="Fill the passage."
      arabicTitle={arabicTitle}
      tone="hero"
      total={total}
      current={activeIdx}
    >
      <div className="rounded-xl border border-hairline bg-card p-5 shadow-soft-sm">
        <div
          dir="rtl"
          className="text-ink"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(20px, 4.5vw, 26px)',
            lineHeight: 2.2,
          }}
        >
          {round.ayat.map((ayah, ayahIdx) => (
            <span key={ayah.number}>
              {ayah.words.map((w, wi) => {
                const bIdx = blankByAyahWord.get(`${ayah.number}:${wi}`)
                if (bIdx === undefined) {
                  return (
                    <span key={wi} className="mx-[2px]">
                      {w.text}{' '}
                    </span>
                  )
                }
                const bPick = picks[bIdx]
                const isActive = bIdx === activeIdx
                const bTarget = round.blanks[bIdx].target
                const state: 'idle' | 'correct' | 'wrong' =
                  bPick === null ? 'idle' : bPick === bTarget ? 'correct' : 'wrong'
                return (
                  <span
                    key={wi}
                    className={cn(
                      'mx-[2px] inline-block rounded-md px-2 align-middle',
                      isActive && state === 'idle' && 'ring-2 ring-hero',
                    )}
                    style={{
                      minWidth: state === 'idle' ? 100 : undefined,
                      borderBottom:
                        state === 'idle'
                          ? `2.5px dashed var(--color-hero)`
                          : undefined,
                      background:
                        state === 'correct'
                          ? 'color-mix(in oklch, var(--color-correct) 14%, transparent)'
                          : state === 'wrong'
                            ? 'color-mix(in oklch, var(--color-incorrect) 12%, transparent)'
                            : 'transparent',
                      border:
                        state === 'correct'
                          ? '1.5px solid var(--color-correct)'
                          : state === 'wrong'
                            ? '1.5px solid var(--color-incorrect)'
                            : undefined,
                      color:
                        state === 'wrong' ? 'var(--color-incorrect)' : undefined,
                    }}
                  >
                    {bPick ?? (state === 'idle' ? '\u00A0\u00A0\u00A0\u00A0' : bTarget)}
                  </span>
                )
              })}
              <span
                className="mx-1 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] text-ink-soft"
                style={{ borderColor: 'var(--color-hairline)' }}
              >
                {ayah.number}
              </span>
              {ayahIdx < round.ayat.length - 1 && ' '}
            </span>
          ))}
        </div>
        <div className="mt-4 space-y-1">
          {round.ayat.map((a) => (
            <div key={a.number} className="text-[12px] italic text-ink-muted">
              <span className="font-mono font-bold">{a.number}</span> · "{a.translation}"
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hero-deep">
        Blank {activeIdx + 1} · Ayah {blank.ayahNumber}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {blank.options.map((opt) => (
          <OptionButton
            key={opt}
            arabic
            locked={picked !== null}
            state={optionState(picked, opt, blank.target)}
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
          correctLabel="Held the context"
          incorrectLabel="Context drifted"
          correctText={blank.note}
          incorrectText={`The muṣḥaf form is ${blank.target}. ${blank.note}`}
        />
      </div>

      <PrimaryButton
        tone="ink"
        disabled={picked === null}
        onClick={handleAdvance}
        className="mt-8"
      >
        {picked === null
          ? 'Pick an option'
          : activeIdx < total - 1
            ? 'Next blank'
            : 'See results'}
        {picked !== null && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DrillShell>
  )
}
