import type { SVGProps } from 'react'

export type IconName =
  | 'chevron'
  | 'check'
  | 'x'
  | 'sparkles'
  | 'target'
  | 'book'
  | 'pen'
  | 'ear'
  | 'shield'
  | 'type'
  | 'question'
  | 'arrow-r'
  | 'shuffle'
  | 'timer'
  | 'feather'
  | 'eye'
  | 'play'
  | 'speaker'
  | 'star'
  | 'star-filled'
  | 'users'
  | 'user-plus'

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...rest,
  }

  switch (name) {
    case 'chevron':
      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <path d="M4 12l5 5L20 6" />
        </svg>
      )
    case 'x':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      )
    case 'sparkles':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
          <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" opacity="0.55" />
        </svg>
      )
    case 'target':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'book':
      return (
        <svg {...common}>
          <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z" />
          <path d="M4 19a2 2 0 012-2h13" />
        </svg>
      )
    case 'pen':
      return (
        <svg {...common}>
          <path d="M4 20l4-1L19 8l-3-3L5 16l-1 4z" />
          <path d="M14 7l3 3" />
        </svg>
      )
    case 'ear':
      return (
        <svg {...common}>
          <path d="M7 9a5 5 0 0110 0c0 2-1 3-2 4s-2 2-2 4a2 2 0 01-4 0c0-1 .5-1.5 1-2" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )
    case 'type':
      return (
        <svg {...common}>
          <path d="M4 7V5h16v2M9 5v14M15 14h6M18 11v6" />
        </svg>
      )
    case 'question':
      return (
        <svg {...common}>
          <path d="M9 9a3 3 0 116 0c0 2-3 2-3 4M12 17h.01" />
        </svg>
      )
    case 'arrow-r':
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )
    case 'shuffle':
      return (
        <svg {...common}>
          <path d="M3 7h4l10 10h4M3 17h4L17 7h4M19 4l3 3-3 3M19 14l3 3-3 3" />
        </svg>
      )
    case 'timer':
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l3 2M9 3h6M12 5V3" />
        </svg>
      )
    case 'feather':
      return (
        <svg {...common}>
          <path d="M20 4c-6 0-11 5-11 11v5h5c6 0 11-5 11-11V4h-5zM4 20l9-9" />
        </svg>
      )
    case 'eye':
      return (
        <svg {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'play':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M7 4l13 8-13 8V4z" />
        </svg>
      )
    case 'speaker':
      return (
        <svg {...common}>
          <path d="M4 9v6h4l5 4V5L8 9H4z" />
          <path d="M16 8a5 5 0 010 8M18.5 5.5a9 9 0 010 13" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common}>
          <path d="M12 3l2.5 5.5 6 .6-4.5 4.1 1.3 5.9L12 16.2 6.7 19.1 8 13.2 3.5 9.1l6-.6z" />
        </svg>
      )
    case 'star-filled':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12 3l2.5 5.5 6 .6-4.5 4.1 1.3 5.9L12 16.2 6.7 19.1 8 13.2 3.5 9.1l6-.6z" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 20c.5-3 3-5 6-5s5.5 2 6 5" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M15 15c3 0 5 1.5 5.5 4" />
        </svg>
      )
    case 'user-plus':
      return (
        <svg {...common}>
          <circle cx="10" cy="8" r="3.5" />
          <path d="M3 20c.5-3 3-5 7-5" />
          <path d="M17 11v6M14 14h6" />
        </svg>
      )
  }
}
