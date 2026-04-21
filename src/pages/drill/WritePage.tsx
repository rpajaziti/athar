import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Icon } from '@/components/ui/Icon'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { DrillResults, type DrillAnswer } from '@/components/drill/DrillResults'
import { LETTER_CONFUSABLES } from '@/data/confusables'
import { shuffle } from '@/lib/drill'
import { cn } from '@/lib/cn'

const TARGET_ROUNDS = 5

interface Round {
  letter: string
  latin: string
  note: string
}

function buildRounds(): Round[] {
  const pool: Round[] = []
  for (const c of LETTER_CONFUSABLES) {
    const parts = c.latin.split(' · ')
    c.letters.forEach((letter, i) => {
      pool.push({
        letter,
        latin: parts[i] ?? c.latin,
        note: c.note,
      })
    })
  }
  return shuffle(pool).slice(0, TARGET_ROUNDS)
}

export function WritePage() {
  const [rounds] = useState(buildRounds)
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<'draw' | 'reveal'>('draw')
  const [judged, setJudged] = useState<(boolean | null)[]>(() =>
    rounds.map(() => null),
  )
  const [done, setDone] = useState(false)
  const [showGhost, setShowGhost] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawing = useRef(false)

  const current = rounds[idx]

  useEffect(() => {
    clearCanvas()
    setPhase('draw')
  }, [idx])

  const clearCanvas = () => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
  }

  const getPos = (e: PointerEvent | React.PointerEvent) => {
    const c = canvasRef.current
    if (!c) return { x: 0, y: 0 }
    const rect = c.getBoundingClientRect()
    const scaleX = c.width / rect.width
    const scaleY = c.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (phase !== 'draw') return
    const c = canvasRef.current
    if (!c) return
    c.setPointerCapture(e.pointerId)
    drawing.current = true
    const ctx = c.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || phase !== 'draw') return
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = 'oklch(0.32 0.05 35)'
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const handlePointerUp = () => {
    drawing.current = false
  }

  const handleReveal = () => setPhase('reveal')

  const handleJudge = (ok: boolean) => {
    setJudged((prev) => prev.map((v, i) => (i === idx ? ok : v)))
    if (idx < rounds.length - 1) {
      setIdx(idx + 1)
    } else {
      setDone(true)
    }
  }

  const reset = () => {
    setIdx(0)
    setPhase('draw')
    setJudged(rounds.map(() => null))
    setDone(false)
  }

  if (done) {
    const answers: DrillAnswer[] = rounds.map((r, i) => ({
      label: `${r.letter} · ${r.latin}`,
      correct: judged[i] === true,
    }))
    return (
      <div className="relative min-h-screen overflow-hidden">
        <MushafGrid />
        <header className="relative mx-auto flex max-w-2xl items-center justify-between px-6 pt-6 sm:pt-8">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted"
          >
            <Icon name="x" size={14} />
            Exit
          </Link>
        </header>
        <main className="relative mx-auto w-full max-w-2xl px-6 pb-16 pt-8">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-hero-deep">
            Write · Results
          </div>
          <h1 className="mt-2 text-balance text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
            How did you draw?
          </h1>
          <div className="mt-8">
            <DrillResults answers={answers} onTryAgain={reset} />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MushafGrid />

      <header className="relative mx-auto flex max-w-2xl items-center justify-between px-6 pt-6 sm:pt-8">
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <Icon name="x" size={14} />
          Exit
        </Link>
        <div className="flex items-center gap-1.5">
          {rounds.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === idx ? 'w-8' : 'w-4',
              )}
              style={{
                background: i <= idx ? 'var(--color-hero)' : 'var(--color-hairline)',
              }}
            />
          ))}
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-2xl px-6 pb-16 pt-8">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-hero-deep">
          Write · Round {idx + 1} of {rounds.length}
        </div>
        <h1 className="mt-2 text-balance text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
          Draw the letter <span className="text-hero-deep">{current.latin}</span>.
        </h1>
        <p className="mt-2 text-[13px] text-ink-soft">
          From memory. Turn off the ghost trace to test yourself harder, then reveal and self-judge.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <label className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft">
            <input
              type="checkbox"
              checked={showGhost}
              onChange={(e) => setShowGhost(e.target.checked)}
            />
            Ghost trace
          </label>
          <button
            type="button"
            onClick={clearCanvas}
            disabled={phase === 'reveal'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink transition-colors hover:bg-bg-sunk disabled:opacity-50"
          >
            Clear
          </button>
        </div>

        <div className="relative mt-5 overflow-hidden rounded-xl border border-hairline bg-card shadow-soft-sm">
          {showGhost && phase === 'draw' && (
            <div
              aria-hidden
              dir="rtl"
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-ink-muted/25"
              style={{
                fontFamily: 'var(--font-arabic-ayah)',
                fontSize: 'clamp(160px, 40vw, 260px)',
                lineHeight: 1,
              }}
            >
              {current.letter}
            </div>
          )}
          {phase === 'reveal' && (
            <div
              aria-hidden
              dir="rtl"
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-hero-deep"
              style={{
                fontFamily: 'var(--font-arabic-ayah)',
                fontSize: 'clamp(160px, 40vw, 260px)',
                lineHeight: 1,
              }}
            >
              {current.letter}
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={800}
            height={420}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={cn(
              'block h-[320px] w-full touch-none sm:h-[420px]',
              phase === 'draw' ? 'cursor-crosshair' : 'cursor-default',
            )}
          />
        </div>

        <div className="mt-3 text-center text-[12px] italic text-ink-muted">
          "{current.note}"
        </div>

        {phase === 'draw' ? (
          <PrimaryButton tone="hero" onClick={handleReveal} className="mt-6">
            Reveal the muṣḥaf form
            <Icon name="arrow-r" size={16} />
          </PrimaryButton>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleJudge(false)}
              className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-incorrect px-5 py-3 text-[14px] font-bold text-incorrect transition-colors hover:bg-incorrect-soft"
              style={{
                background: 'color-mix(in oklch, var(--color-incorrect) 6%, transparent)',
              }}
            >
              <Icon name="x" size={16} />
              Off
            </button>
            <button
              type="button"
              onClick={() => handleJudge(true)}
              className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-correct px-5 py-3 text-[14px] font-bold text-correct transition-colors hover:bg-correct-soft"
              style={{
                background: 'color-mix(in oklch, var(--color-correct) 8%, transparent)',
              }}
            >
              <Icon name="check" size={16} />
              Matched
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
