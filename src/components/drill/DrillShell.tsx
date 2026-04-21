import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

interface Props {
  eyebrow: string
  title: string
  arabicTitle?: string
  tone: 'foundations' | 'easy' | 'medium' | 'hero'
  total: number
  current: number
  exitTo?: string
  children: ReactNode
}

const TONE_COLORS: Record<Props['tone'], { dot: string; label: string }> = {
  foundations: {
    dot: 'var(--color-hero)',
    label: 'var(--color-hero-deep)',
  },
  easy: {
    dot: 'var(--color-easy)',
    label: 'var(--color-easy-deep)',
  },
  medium: {
    dot: 'var(--color-medium)',
    label: 'var(--color-medium-deep)',
  },
  hero: {
    dot: 'var(--color-hero)',
    label: 'var(--color-hero-deep)',
  },
}

export function DrillShell({
  eyebrow,
  title,
  arabicTitle,
  tone,
  total,
  current,
  exitTo = '/home',
  children,
}: Props) {
  const palette = TONE_COLORS[tone]

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MushafGrid />

      <header className="relative mx-auto flex max-w-2xl items-center justify-between px-6 pt-6 sm:pt-8">
        <Link
          to={exitTo}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <Icon name="x" size={14} />
          Exit
        </Link>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === current ? 'w-8' : 'w-4',
              )}
              style={{
                background:
                  i <= current ? palette.dot : 'var(--color-hairline)',
              }}
            />
          ))}
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-2xl px-6 pb-16 pt-8">
        <div
          className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: palette.label }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: palette.dot }}
          />
          {eyebrow}
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-4">
          <h1 className="text-balance text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
            {title}
          </h1>
          {arabicTitle && (
            <div
              dir="rtl"
              className="text-[22px] font-medium text-ink-soft"
              style={{ fontFamily: 'var(--font-arabic-ui)' }}
            >
              {arabicTitle}
            </div>
          )}
        </div>

        <div className="mt-8">{children}</div>
      </main>
    </div>
  )
}
