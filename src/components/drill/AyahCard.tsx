import { useRef, useState, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { ayahAudioUrl, type Reciter } from '@/lib/audio'
import { getReciter, isBookmarked, toggleBookmark } from '@/lib/progress'

interface Props {
  children: ReactNode
  translation?: string
  ayahNumber?: number
  audio?: { surahId: number; ayahNumber: number }
}

export function AyahCard({ children, translation, ayahNumber, audio }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [starred, setStarred] = useState(() =>
    audio ? isBookmarked(audio.surahId, audio.ayahNumber) : false,
  )

  const handlePlay = () => {
    if (!audio) return
    if (!audioRef.current) {
      audioRef.current = new Audio(
        ayahAudioUrl(audio.surahId, audio.ayahNumber, getReciter() as Reciter),
      )
      audioRef.current.addEventListener('ended', () => setPlaying(false))
      audioRef.current.addEventListener('pause', () => setPlaying(false))
    }
    audioRef.current.currentTime = 0
    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  return (
    <div className="relative rounded-xl border border-hairline bg-card p-6 shadow-soft-sm">
      {(ayahNumber !== undefined || audio) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {audio ? (
            <button
              type="button"
              onClick={handlePlay}
              aria-label="Play ayah"
              className="inline-flex items-center gap-1 rounded-md border border-hairline bg-card px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted transition-colors hover:border-hero hover:text-hero-deep"
            >
              <Icon name="play" size={10} />
              {playing ? 'Playing' : 'Listen'}
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {audio && (
              <button
                type="button"
                onClick={() => {
                  if (!audio) return
                  const now = toggleBookmark(audio.surahId, audio.ayahNumber)
                  setStarred(now)
                }}
                aria-label={starred ? 'Unbookmark ayah' : 'Bookmark ayah'}
                className="inline-flex items-center gap-1 rounded-md border border-hairline bg-card px-1.5 py-1 text-ink-muted transition-colors hover:border-hero hover:text-hero-deep"
                style={{
                  color: starred ? 'var(--color-hero-deep)' : undefined,
                  borderColor: starred ? 'var(--color-hero)' : undefined,
                  background: starred
                    ? 'color-mix(in oklch, var(--color-hero) 10%, transparent)'
                    : undefined,
                }}
              >
                <Icon name={starred ? 'star-filled' : 'star'} size={12} />
              </button>
            )}
            {ayahNumber !== undefined && (
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                Ayah {ayahNumber}
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full border text-[11px] text-ink-soft"
                  style={{ borderColor: 'var(--color-hairline)' }}
                >
                  {ayahNumber}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="text-center">{children}</div>
      {translation && (
        <div className="mt-4 text-center text-[12px] italic text-ink-muted">
          "{translation}"
        </div>
      )}
    </div>
  )
}

interface BlankProps {
  state: 'idle' | 'correct' | 'wrong'
  children?: ReactNode
  accent?: string
}

export function Blank({ state, children, accent }: BlankProps) {
  if (state === 'idle') {
    return (
      <span
        className="inline-block align-middle"
        style={{
          minWidth: 110,
          height: '1.1em',
          borderBottom: `2.5px dashed ${accent ?? 'var(--color-easy)'}`,
          margin: '0 6px',
        }}
      />
    )
  }
  return (
    <span
      className="rounded-md px-2.5"
      style={{
        background:
          state === 'correct'
            ? 'color-mix(in oklch, var(--color-correct) 16%, transparent)'
            : 'color-mix(in oklch, var(--color-incorrect) 12%, transparent)',
        border: `1.5px solid ${
          state === 'correct' ? 'var(--color-correct)' : 'var(--color-incorrect)'
        }`,
      }}
    >
      {children}
    </span>
  )
}
