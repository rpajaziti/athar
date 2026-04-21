import { Link } from 'react-router-dom'

export function Wordmark() {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full border text-hero-deep"
        style={{
          background: 'var(--color-hero-soft)',
          borderColor: 'color-mix(in oklch, var(--color-hero) 35%, transparent)',
          fontFamily: 'var(--font-arabic-ayah)',
          fontSize: 22,
          lineHeight: 1,
          paddingTop: 2,
        }}
      >
        أ
      </span>
      <div className="flex flex-col leading-none">
        <span className="text-[17px] font-extrabold tracking-tight text-ink">Athar</span>
        <span
          className="text-[11px] font-medium tracking-wide text-ink-muted"
          style={{ fontFamily: 'var(--font-arabic-ui)' }}
          dir="rtl"
        >
          أَثَر
        </span>
      </div>
    </Link>
  )
}
