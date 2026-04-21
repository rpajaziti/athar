interface Props {
  color?: string
  size?: number
}

export function IlluminatedCorners({ color = 'currentColor', size = 38 }: Props) {
  const c = color
  return (
    <>
      <svg
        aria-hidden
        width={size}
        height={size}
        viewBox="0 0 40 40"
        style={{ position: 'absolute', top: 8, left: 8, opacity: 0.7 }}
      >
        <g stroke={c} strokeWidth="1" fill="none">
          <path d="M2 14V4h10" />
          <path d="M6 12V8h4" />
          <circle cx="4" cy="4" r="1.2" fill={c} />
        </g>
      </svg>
      <svg
        aria-hidden
        width={size}
        height={size}
        viewBox="0 0 40 40"
        style={{ position: 'absolute', top: 8, right: 8, opacity: 0.7, transform: 'scaleX(-1)' }}
      >
        <g stroke={c} strokeWidth="1" fill="none">
          <path d="M2 14V4h10" />
          <path d="M6 12V8h4" />
          <circle cx="4" cy="4" r="1.2" fill={c} />
        </g>
      </svg>
      <svg
        aria-hidden
        width={size}
        height={size}
        viewBox="0 0 40 40"
        style={{ position: 'absolute', bottom: 8, left: 8, opacity: 0.7, transform: 'scaleY(-1)' }}
      >
        <g stroke={c} strokeWidth="1" fill="none">
          <path d="M2 14V4h10" />
          <path d="M6 12V8h4" />
          <circle cx="4" cy="4" r="1.2" fill={c} />
        </g>
      </svg>
      <svg
        aria-hidden
        width={size}
        height={size}
        viewBox="0 0 40 40"
        style={{ position: 'absolute', bottom: 8, right: 8, opacity: 0.7, transform: 'scale(-1,-1)' }}
      >
        <g stroke={c} strokeWidth="1" fill="none">
          <path d="M2 14V4h10" />
          <path d="M6 12V8h4" />
          <circle cx="4" cy="4" r="1.2" fill={c} />
        </g>
      </svg>
    </>
  )
}
