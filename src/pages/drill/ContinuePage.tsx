import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { AyahCard } from '@/components/drill/AyahCard'
import { OptionButton, optionState } from '@/components/ui/OptionButton'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { Feedback } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'
import { SURAH_BY_ID } from '@/data/quran'
import { shuffle } from '@/lib/drill'
import { recordAttempt } from '@/lib/progress'
import { cn } from '@/lib/cn'

const EDGE_WORDS = 3

interface Link {
  fromAyah: number
  toAyah: number
  target: string
  options: string[]
}

function sliceFirst(words: string[]): string {
  return words.slice(0, Math.min(EDGE_WORDS, words.length)).join(' ')
}

function buildLinks(surahId: number): Link[] | null {
  const surah = SURAH_BY_ID.get(surahId)
  if (!surah || surah.ayat.length < 2) return null

  const openers = surah.ayat.map((a) => sliceFirst(a.words.map((w) => w.text)))
  const links: Link[] = []
  for (let i = 0; i < surah.ayat.length - 1; i++) {
    const target = openers[i + 1]
    const distractorPool = openers
      .map((o, idx) => ({ o, idx }))
      .filter(
        (x) =>
          x.idx !== i + 1 && x.o !== target && x.o !== openers[i],
      )
      .map((x) => x.o)
    const distractors = shuffle(distractorPool).slice(0, 2)
    links.push({
      fromAyah: surah.ayat[i].number,
      toAyah: surah.ayat[i + 1].number,
      target,
      options: shuffle([target, ...distractors]),
    })
  }
  return links
}

export function ContinuePage() {
  const { surahId: sid } = useParams<{ surahId: string }>()
  const surahId = Number(sid)
  const surah = SURAH_BY_ID.get(surahId)
  const links = useMemo(() => buildLinks(surahId), [surahId])

  const [idx, setIdx] = useState(0)
  const [picks, setPicks] = useState<(string | null)[]>(() =>
    links ? links.map(() => null) : [],
  )
  const [done, setDone] = useState(false)

  if (!surah || !links || links.length === 0) {
    return <Navigate to="/home" replace />
  }

  const current = links[idx]
  const picked = picks[idx]
  const correct = picked === current.target
  const total = links.length

  const handlePick = (opt: string) => {
    if (picked !== null) return
    setPicks((prev) => prev.map((s, i) => (i === idx ? opt : s)))
  }

  const handleAdvance = () => {
    if (idx < total - 1) {
      setIdx(idx + 1)
      return
    }
    const correctCount = links.reduce(
      (n, l, i) => n + (picks[i] === l.target ? 1 : 0),
      0,
    )
    recordAttempt({
      tier: 'hard',
      surahId,
      correct: correctCount,
      total,
    })
    setDone(true)
  }

  const reset = () => {
    setPicks(links.map(() => null))
    setIdx(0)
    setDone(false)
  }

  if (done) {
    const answers: DrillAnswer[] = links.map((l, i) => ({
      label: `${l.fromAyah} → ${l.toAyah} · ${l.target}`,
      correct: picks[i] === l.target,
    }))
    return (
      <DrillShell
        eyebrow={`Continue · ${surah.nameComplex} · Results`}
        title="Did the chain hold?"
        arabicTitle={surah.nameArabic}
        tone="hero"
        total={total}
        current={total - 1}
      >
        <DrillResults answers={answers} onTryAgain={reset} />
      </DrillShell>
    )
  }

  const priorAyat = surah.ayat.filter((a) => a.number <= current.fromAyah)

  return (
    <DrillShell
      eyebrow={`Continue · ${surah.nameComplex} · ${current.fromAyah} → ${current.toAyah}`}
      title="What opens the next ayah?"
      arabicTitle={surah.nameArabic}
      tone="hero"
      total={total}
      current={idx}
    >
      <div className="mb-4 grid gap-2">
        {priorAyat.map((a, i) => (
          <div
            key={a.number}
            className={cn(
              'rounded-xl border px-4 py-3',
              i === priorAyat.length - 1
                ? 'border-hero bg-hero-soft/30'
                : 'border-hairline bg-bg-sunk/60',
            )}
          >
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
              Ayah {a.number}
            </div>
            <div
              dir="rtl"
              className="mt-1 text-ink"
              style={{
                fontFamily: 'var(--font-arabic-ayah)',
                fontSize:
                  i === priorAyat.length - 1
                    ? 'clamp(20px, 4.2vw, 24px)'
                    : 'clamp(16px, 3.4vw, 20px)',
                lineHeight: 1.9,
                color:
                  i === priorAyat.length - 1
                    ? undefined
                    : 'var(--color-ink-soft)',
              }}
            >
              {a.text}
            </div>
          </div>
        ))}
      </div>

      <AyahCard audio={{ surahId, ayahNumber: current.toAyah }}>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hero-deep">
          Ayah {current.toAyah} · opens with
        </div>
        <div
          dir="rtl"
          className="mt-2 text-ink"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(22px, 5vw, 30px)',
            lineHeight: 2,
          }}
        >
          {picked !== null ? (
            <>
              <span
                style={{
                  color: correct
                    ? 'var(--color-correct)'
                    : 'var(--color-incorrect)',
                  borderBottom: `2px solid ${correct ? 'var(--color-correct)' : 'var(--color-incorrect)'}`,
                  paddingBottom: 2,
                }}
              >
                {picked}
              </span>
              <span className="text-ink-muted"> …</span>
            </>
          ) : (
            <>
              <span
                className="inline-block align-middle"
                style={{
                  minWidth: 140,
                  height: '1.2em',
                  borderBottom: '2.5px dashed var(--color-hero)',
                  margin: '0 6px',
                }}
              />
              <span className="text-ink-muted">…</span>
            </>
          )}
        </div>
      </AyahCard>

      <div className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hero-deep">
        Which opens ayah {current.toAyah}?
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
          correctLabel="Chain held"
          incorrectLabel="Chain slipped"
          correctText={`Ayah ${current.toAyah} opens with ${current.target}.`}
          incorrectText={`Ayah ${current.toAyah} opens with ${current.target}, not ${picked}.`}
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
            ? 'Continue chain'
            : 'See results'}
        {picked !== null && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DrillShell>
  )
}
