export function MushafGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background: `
          linear-gradient(to bottom, transparent 96px, var(--color-hairline-2) 96px, var(--color-hairline-2) 97px, transparent 97px),
          repeating-linear-gradient(to bottom, transparent 0, transparent 31px, var(--color-hairline-2) 31px, var(--color-hairline-2) 32px)
        `,
        opacity: 0.45,
        maskImage:
          'linear-gradient(to bottom, transparent 0, black 120px, black 82%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0, black 120px, black 82%, transparent 100%)',
      }}
    />
  )
}
