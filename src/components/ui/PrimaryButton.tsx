import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  tone: 'ink' | 'hero'
  className?: string
}

export function PrimaryButton({ children, onClick, disabled, tone, className }: Props) {
  const bg = disabled
    ? 'var(--color-hairline)'
    : tone === 'hero'
      ? 'var(--color-hero)'
      : 'var(--color-ink)'
  const color = disabled ? 'var(--color-ink-muted)' : '#fff'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        'inline-flex w-full items-center justify-center gap-2 rounded-[14px] px-6 py-4 text-[15px] font-bold transition-transform active:translate-y-[1px] disabled:cursor-default sm:w-auto sm:px-8 ' +
        (className ?? '')
      }
      style={{
        background: bg,
        color,
        boxShadow: disabled
          ? 'none'
          : 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -3px 0 rgba(0,0,0,0.15), 0 1px 2px rgba(20,30,50,0.04), 0 2px 6px rgba(20,30,50,0.03)',
      }}
    >
      {children}
    </button>
  )
}
