import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { PrimaryButton } from '@/components/ui/PrimaryButton'

export interface DrillAnswer {
  label: string
  correct: boolean
}

interface Props {
  answers: DrillAnswer[]
  onTryAgain: () => void
  homeHref?: string
}

export function DrillResults({ answers, onTryAgain, homeHref = '/home' }: Props) {
  const total = answers.length
  const correct = answers.filter((a) => a.correct).length
  const score = Math.round((correct / total) * 100)
  const pass = score >= 80

  return (
    <div>
      <div className="text-center">
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2"
          style={{
            background: pass
              ? 'color-mix(in oklch, var(--color-correct) 12%, transparent)'
              : 'color-mix(in oklch, var(--color-warn) 12%, transparent)',
            borderColor: pass ? 'var(--color-correct)' : 'var(--color-warn)',
            color: pass ? 'var(--color-correct)' : 'var(--color-warn)',
          }}
        >
          <Icon name={pass ? 'check' : 'target'} size={36} strokeWidth={2.5} />
        </div>
        <div
          className="mt-6 font-mono text-[11px] font-bold uppercase tracking-[0.22em]"
          style={{ color: pass ? 'var(--color-correct)' : 'var(--color-warn)' }}
        >
          {pass ? 'Precise' : 'Keep going'}
        </div>
        <div className="mt-2 text-balance text-[32px] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[40px]">
          {correct} of {total} correct
        </div>
        <p className="mt-3 text-balance text-[14px] leading-relaxed text-ink-soft">
          {pass
            ? 'Every miss becomes a weak-spot card you\u2019ll see tomorrow.'
            : 'Ḍabṭ is built one letter at a time. Run the drill again — the misses will stick.'}
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-hairline bg-card p-4 shadow-soft-sm">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Breakdown
        </div>
        <ul className="mt-3 space-y-2">
          {answers.map((a, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-[13px]"
              style={{
                borderColor: a.correct
                  ? 'color-mix(in oklch, var(--color-correct) 30%, transparent)'
                  : 'color-mix(in oklch, var(--color-incorrect) 30%, transparent)',
                background: a.correct
                  ? 'color-mix(in oklch, var(--color-correct) 6%, transparent)'
                  : 'color-mix(in oklch, var(--color-incorrect) 6%, transparent)',
              }}
            >
              <span className="font-mono text-[11px] font-bold tracking-wide text-ink-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                dir="rtl"
                className="flex-1 text-right text-[16px] font-medium text-ink"
                style={{ fontFamily: 'var(--font-arabic-ui)' }}
              >
                {a.label}
              </span>
              <Icon
                name={a.correct ? 'check' : 'x'}
                size={16}
                className={a.correct ? 'text-correct' : 'text-incorrect'}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <PrimaryButton tone="hero" onClick={onTryAgain}>
          Try again
          <Icon name="arrow-r" size={16} />
        </PrimaryButton>
        <Link
          to={homeHref}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-hairline bg-card px-6 py-4 text-[15px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk sm:w-auto sm:px-8"
        >
          <Icon name="chevron" size={14} style={{ transform: 'rotate(180deg)' }} />
          Back home
        </Link>
      </div>
    </div>
  )
}
