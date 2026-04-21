import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type OptionState = 'idle' | 'picked-correct' | 'picked-wrong' | 'reveal-correct'

export function optionState(
  picked: string | null,
  opt: string,
  target: string,
): OptionState {
  if (picked === null) return 'idle'
  if (picked === opt) return opt === target ? 'picked-correct' : 'picked-wrong'
  if (opt === target) return 'reveal-correct'
  return 'idle'
}

interface Props {
  children: ReactNode
  state: OptionState
  locked: boolean
  onClick: () => void
  arabic?: boolean
  square?: boolean
  full?: boolean
}

export function OptionButton({
  children,
  state,
  locked,
  onClick,
  arabic,
  square,
  full,
}: Props) {
  const border =
    state === 'picked-correct' || state === 'reveal-correct'
      ? 'var(--color-correct)'
      : state === 'picked-wrong'
        ? 'var(--color-incorrect)'
        : 'var(--color-hairline)'
  const bg =
    state === 'picked-correct'
      ? 'color-mix(in oklch, var(--color-correct) 18%, transparent)'
      : state === 'picked-wrong'
        ? 'color-mix(in oklch, var(--color-incorrect) 14%, transparent)'
        : state === 'reveal-correct'
          ? 'color-mix(in oklch, var(--color-correct) 10%, transparent)'
          : 'var(--color-card)'

  return (
    <button
      type="button"
      disabled={locked}
      onClick={onClick}
      className={cn(
        'rounded-md text-ink shadow-soft-sm transition-colors disabled:cursor-default',
        square ? 'flex aspect-square items-center justify-center' : 'px-3 py-4',
        full && 'col-span-2',
      )}
      style={{
        background: bg,
        border: `1.5px solid ${border}`,
        fontFamily: arabic ? 'var(--font-arabic-ayah)' : 'var(--font-sans)',
        fontSize: arabic
          ? square
            ? 'clamp(26px, 5vw, 32px)'
            : 'clamp(20px, 4.5vw, 26px)'
          : 15,
      }}
    >
      {children}
    </button>
  )
}
