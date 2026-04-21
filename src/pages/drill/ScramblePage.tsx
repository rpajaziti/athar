import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DrillShell } from '@/components/drill/DrillShell'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { Icon } from '@/components/ui/Icon'
import { Feedback } from '@/components/ui/Feedback'
import { SURAH_BY_ID } from '@/data/quran'
import { shuffle } from '@/lib/drill'
import { recordMixedAttempt } from '@/lib/progress'
import { cn } from '@/lib/cn'
import type { Ayah } from '@/data/types'

const WINDOW_SIZE = 5

interface Slot {
  ayah: Ayah
  orderIdx: number
  wrongFlash: boolean
}

export function ScramblePage() {
  const { surahId: sid } = useParams<{ surahId: string }>()
  const surahId = Number(sid)
  const surah = SURAH_BY_ID.get(surahId)

  const picked = useMemo(() => {
    if (!surah) return null
    const n = Math.min(WINDOW_SIZE, surah.ayat.length)
    const maxStart = surah.ayat.length - n
    const start = maxStart > 0 ? Math.floor(Math.random() * (maxStart + 1)) : 0
    return surah.ayat.slice(start, start + n)
  }, [surah])

  if (!surah || !picked || picked.length < 2) {
    return <Navigate to="/home" replace />
  }

  return <ScrambleDrill surah={surah.nameComplex} arabicTitle={surah.nameArabic} ayat={picked} />
}

function ScrambleDrill({
  surah,
  arabicTitle,
  ayat,
}: {
  surah: string
  arabicTitle: string
  ayat: Ayah[]
}) {
  const total = ayat.length
  const [slots, setSlots] = useState<Slot[]>(() =>
    shuffle(ayat).map((a) => ({ ayah: a, orderIdx: -1, wrongFlash: false })),
  )
  const [nextPos, setNextPos] = useState(0)
  const [misses, setMisses] = useState(0)
  const [done, setDone] = useState(false)

  const expected = ayat[nextPos]

  const handleTap = (slotIdx: number) => {
    if (done) return
    const slot = slots[slotIdx]
    if (slot.orderIdx !== -1) return
    if (slot.ayah.number === expected.number) {
      const placed = nextPos
      setSlots((prev) =>
        prev.map((s, i) => (i === slotIdx ? { ...s, orderIdx: placed } : s)),
      )
      const advanced = placed + 1
      setNextPos(advanced)
      if (advanced >= total) {
        const correct = Math.max(0, total - misses)
        recordMixedAttempt(correct, total)
        setDone(true)
      }
    } else {
      setMisses((m) => m + 1)
      setSlots((prev) =>
        prev.map((s, i) => (i === slotIdx ? { ...s, wrongFlash: true } : s)),
      )
      window.setTimeout(() => {
        setSlots((prev) =>
          prev.map((s, i) => (i === slotIdx ? { ...s, wrongFlash: false } : s)),
        )
      }, 500)
    }
  }

  const reset = () => {
    setSlots(shuffle(ayat).map((a) => ({ ayah: a, orderIdx: -1, wrongFlash: false })))
    setNextPos(0)
    setMisses(0)
    setDone(false)
  }

  return (
    <DrillShell
      eyebrow={`Scramble · ${surah}`}
      title={done ? 'Sequenced.' : 'Put the ayat in order.'}
      arabicTitle={arabicTitle}
      tone="hero"
      total={total}
      current={Math.min(nextPos, total - 1)}
    >
      {!done && (
        <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hero-deep">
          Tap next · Position {nextPos + 1} of {total}
          {misses > 0 && (
            <span className="ml-2 text-incorrect">· {misses} miss{misses === 1 ? '' : 'es'}</span>
          )}
        </div>
      )}

      <ul className="grid gap-3">
        {slots.map((s, i) => {
          const placed = s.orderIdx !== -1
          return (
            <li key={s.ayah.number}>
              <button
                type="button"
                onClick={() => handleTap(i)}
                disabled={placed || done}
                className={cn(
                  'w-full rounded-xl border p-4 text-right transition-all',
                  placed
                    ? 'border-correct bg-card shadow-soft-sm'
                    : s.wrongFlash
                      ? 'border-incorrect bg-card shadow-soft-sm'
                      : 'border-hairline bg-card shadow-soft-sm hover:border-hero hover:bg-hero-soft',
                )}
                style={{
                  background: placed
                    ? 'color-mix(in oklch, var(--color-correct) 8%, var(--color-card))'
                    : s.wrongFlash
                      ? 'color-mix(in oklch, var(--color-incorrect) 10%, var(--color-card))'
                      : undefined,
                }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className={cn(
                      'font-mono text-[11px] font-bold',
                      placed ? 'text-correct' : 'text-ink-muted',
                    )}
                  >
                    {placed ? `#${s.orderIdx + 1} placed` : 'Tap if next'}
                  </span>
                  {done && (
                    <span className="font-mono text-[11px] font-bold text-ink-muted">
                      Ayah {s.ayah.number}
                    </span>
                  )}
                </div>
                <div
                  dir="rtl"
                  className="mt-2 text-ink"
                  style={{
                    fontFamily: 'var(--font-arabic-ayah)',
                    fontSize: 'clamp(20px, 4.5vw, 26px)',
                    lineHeight: 2,
                  }}
                >
                  {s.ayah.text}
                </div>
                <div className="mt-2 text-left text-[12px] italic text-ink-muted">
                  "{s.ayah.translation}"
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {done ? (
        <>
          <div className="mt-6">
            <Feedback
              show
              correct={misses === 0}
              correctLabel="Flawless chain"
              incorrectLabel={`${misses} miss${misses === 1 ? '' : 'es'}`}
              correctText="Every ayah in order on the first tap."
              incorrectText="Chain held, but not cleanly. Try again for a flawless pass."
            />
          </div>
          <PrimaryButton tone="ink" onClick={reset} className="mt-6">
            Reshuffle
            <Icon name="arrow-r" size={16} />
          </PrimaryButton>
        </>
      ) : (
        <div className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          Reading order locks each card green · wrong taps flash red
        </div>
      )}
    </DrillShell>
  )
}
