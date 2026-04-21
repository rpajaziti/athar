import { useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { AyahCard } from '@/components/drill/AyahCard'
import { cn } from '@/lib/cn'

export interface ReorderState {
  bank: string[]
  slots: (string | null)[]
}

type DragSource = { kind: 'bank'; word: string } | { kind: 'slot'; index: number }

interface DragState {
  source: DragSource
  word: string
  offsetX: number
  offsetY: number
  width: number
  height: number
}

interface Props {
  correctWords: string[]
  state: ReorderState
  onChange: (next: ReorderState) => void
  submitted: boolean
  translation?: string
  onClear?: () => void
}

export function ReorderPanel({
  correctWords,
  state,
  onChange,
  submitted,
  translation,
  onClear,
}: Props) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [hoverTarget, setHoverTarget] = useState<string | null>(null)

  useEffect(() => {
    if (!drag) return
    const onMove = (e: PointerEvent) => {
      setPointer({ x: e.clientX, y: e.clientY })
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const zone = el?.closest('[data-dropzone]') as HTMLElement | null
      setHoverTarget(zone?.dataset.dropzone ?? null)
    }
    const onUp = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const zone = el?.closest('[data-dropzone]') as HTMLElement | null
      const target = zone?.dataset.dropzone ?? null
      if (target) resolveDrop(drag.source, target)
      setDrag(null)
      setHoverTarget(null)
    }
    const onCancel = () => {
      setDrag(null)
      setHoverTarget(null)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointercancel', onCancel)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onCancel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag])

  const startDrag =
    (source: DragSource, word: string) => (e: ReactPointerEvent) => {
      if (submitted) return
      if (e.button !== undefined && e.button !== 0) return
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      setPointer({ x: e.clientX, y: e.clientY })
      setDrag({
        source,
        word,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        width: rect.width,
        height: rect.height,
      })
    }

  const resolveDrop = (source: DragSource, target: string) => {
    const s: ReorderState = { bank: [...state.bank], slots: [...state.slots] }

    const pull = (src: DragSource): string | null => {
      if (src.kind === 'bank') {
        const idx = s.bank.indexOf(src.word)
        if (idx === -1) return null
        return s.bank.splice(idx, 1)[0]
      }
      const w = s.slots[src.index]
      s.slots[src.index] = null
      return w
    }

    const word = pull(source)
    if (word === null) return

    if (target === 'bank') {
      s.bank.push(word)
    } else if (target.startsWith('slot:')) {
      const slotIdx = Number(target.slice(5))
      const existing = s.slots[slotIdx]
      s.slots[slotIdx] = word
      if (existing !== null) {
        if (source.kind === 'slot') {
          s.slots[source.index] = existing
        } else {
          s.bank.push(existing)
        }
      }
    }
    onChange(s)
  }

  return (
    <>
      <AyahCard translation={submitted ? translation : undefined}>
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-2"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(20px, 4.5vw, 28px)',
            lineHeight: 1.8,
          }}
        >
          {correctWords.map((correctWord, slotIdx) => {
            const placed = state.slots[slotIdx]
            const slotCorrect = submitted && placed === correctWord
            const slotWrong = submitted && placed !== null && !slotCorrect
            const isHovered = hoverTarget === `slot:${slotIdx}`
            const isDraggingFromHere =
              drag?.source.kind === 'slot' && drag.source.index === slotIdx

            return (
              <div
                key={slotIdx}
                data-dropzone={`slot:${slotIdx}`}
                className={cn(
                  'rounded-md px-3 py-1 transition-colors select-none',
                  placed !== null && !submitted && 'cursor-grab active:cursor-grabbing',
                )}
                style={{
                  minWidth: 80,
                  minHeight: '1.6em',
                  touchAction: 'none',
                  background: slotCorrect
                    ? 'color-mix(in oklch, var(--color-correct) 14%, transparent)'
                    : slotWrong
                      ? 'color-mix(in oklch, var(--color-incorrect) 12%, transparent)'
                      : isHovered && drag
                        ? 'color-mix(in oklch, var(--color-easy) 24%, transparent)'
                        : placed !== null
                          ? 'color-mix(in oklch, var(--color-easy) 10%, transparent)'
                          : 'transparent',
                  border: `2px ${placed === null ? 'dashed' : 'solid'} ${
                    slotCorrect
                      ? 'var(--color-correct)'
                      : slotWrong
                        ? 'var(--color-incorrect)'
                        : isHovered && drag
                          ? 'var(--color-easy)'
                          : placed !== null
                            ? 'var(--color-easy)'
                            : 'var(--color-hairline)'
                  }`,
                  opacity: isDraggingFromHere ? 0.3 : 1,
                }}
                onPointerDown={
                  placed !== null && !submitted
                    ? startDrag({ kind: 'slot', index: slotIdx }, placed)
                    : undefined
                }
              >
                {placed ?? '\u00A0'}
              </div>
            )
          })}
        </div>
      </AyahCard>

      <div className="mt-6 flex items-center justify-between">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-easy-deep">
          Reorder · Drag to any slot
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            disabled={submitted || state.bank.length === correctWords.length}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink transition-colors hover:bg-bg-sunk disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>

      <div
        data-dropzone="bank"
        className={cn(
          'mt-3 flex min-h-[80px] flex-wrap justify-center gap-2 rounded-xl border-2 border-dashed p-3 transition-colors',
          hoverTarget === 'bank' && drag
            ? 'border-easy bg-easy-soft'
            : 'border-hairline',
        )}
      >
        {state.bank.length === 0 && (
          <div className="self-center font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            Bank empty
          </div>
        )}
        {state.bank.map((w, i) => {
          const isDraggingFromHere =
            drag?.source.kind === 'bank' && drag.word === w
          return (
            <div
              key={`${w}-${i}`}
              dir="rtl"
              onPointerDown={!submitted ? startDrag({ kind: 'bank', word: w }, w) : undefined}
              className={cn(
                'select-none rounded-lg border bg-card px-4 py-3 text-ink shadow-soft-sm transition-colors',
                !submitted
                  ? 'cursor-grab border-hairline hover:border-easy hover:bg-easy-soft active:cursor-grabbing'
                  : 'border-hairline opacity-60',
              )}
              style={{
                fontFamily: 'var(--font-arabic-ayah)',
                fontSize: 'clamp(18px, 4vw, 22px)',
                touchAction: 'none',
                opacity: isDraggingFromHere ? 0.3 : undefined,
              }}
            >
              {w}
            </div>
          )
        })}
      </div>

      {drag && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border-2 bg-card px-4 py-3 text-ink shadow-soft-lg"
          dir="rtl"
          style={{
            left: pointer.x - drag.offsetX,
            top: pointer.y - drag.offsetY,
            width: drag.width,
            minHeight: drag.height,
            borderColor: 'var(--color-easy)',
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(18px, 4vw, 22px)',
            transform: 'rotate(-1.5deg) scale(1.04)',
          }}
        >
          {drag.word}
        </div>
      )}
    </>
  )
}

export function isReorderCorrect(state: ReorderState, correctWords: string[]): boolean {
  if (state.slots.length !== correctWords.length) return false
  return state.slots.every((w, i) => w === correctWords[i])
}

export function isReorderFilled(state: ReorderState): boolean {
  return state.slots.every((s) => s !== null)
}
