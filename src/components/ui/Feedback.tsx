interface Props {
  show: boolean
  correct: boolean
  correctLabel: string
  incorrectLabel: string
  correctText: string
  incorrectText: string
}

export function Feedback({
  show,
  correct,
  correctLabel,
  incorrectLabel,
  correctText,
  incorrectText,
}: Props) {
  if (!show) return null

  return (
    <div
      className="rounded-md border px-4 py-3.5 text-[13px] leading-relaxed text-ink"
      style={{
        background: correct
          ? 'color-mix(in oklch, var(--color-correct) 10%, transparent)'
          : 'color-mix(in oklch, var(--color-incorrect) 8%, transparent)',
        borderColor: correct
          ? 'color-mix(in oklch, var(--color-correct) 40%, transparent)'
          : 'color-mix(in oklch, var(--color-incorrect) 40%, transparent)',
      }}
    >
      <div
        className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{
          color: correct ? 'var(--color-correct)' : 'var(--color-incorrect)',
        }}
      >
        {correct ? correctLabel : incorrectLabel}
      </div>
      <div className="mt-1">{correct ? correctText : incorrectText}</div>
    </div>
  )
}
