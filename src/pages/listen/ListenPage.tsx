import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Icon } from '@/components/ui/Icon'
import { SURAH_BY_ID } from '@/data/quran'
import { ayahAudioUrl, type Reciter } from '@/lib/audio'
import {
  getReciter,
  setReciter as saveReciter,
  isBookmarked,
  toggleBookmark,
} from '@/lib/progress'
import { cn } from '@/lib/cn'

export function ListenPage() {
  const { surahId: sid } = useParams<{ surahId: string }>()
  const surahId = Number(sid)
  const surah = SURAH_BY_ID.get(surahId)

  const [reciter, setReciter] = useState<Reciter>(() => getReciter() as Reciter)
  const [currentAyah, setCurrentAyah] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [showText, setShowText] = useState(true)
  const [showTranslation, setShowTranslation] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const activeRef = useRef<HTMLDivElement | null>(null)
  const [starTick, setStarTick] = useState(0)

  useEffect(() => {
    if (!playing) return
    const el = audioRef.current
    if (!el) return
    el.currentTime = 0
    el.play().catch(() => setPlaying(false))
  }, [currentAyah, reciter, playing])

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentAyah])

  if (!surah) return <Navigate to="/home" replace />

  const total = surah.ayat.length

  const handleEnded = () => {
    if (currentAyah < total) {
      setCurrentAyah(currentAyah + 1)
    } else {
      setPlaying(false)
    }
  }

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      setPlaying(true)
      el.play().catch(() => setPlaying(false))
    }
  }

  const jumpTo = (ayahNumber: number) => {
    setCurrentAyah(ayahNumber)
    setPlaying(true)
  }

  const restart = () => {
    setCurrentAyah(1)
    setPlaying(true)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MushafGrid />

      <header className="relative mx-auto flex max-w-3xl items-center justify-between px-6 pt-6 sm:pt-8">
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <Icon name="x" size={14} />
          Exit
        </Link>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
          Listen · {surah.nameComplex}
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-3xl px-6 pb-28 pt-8">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-balance text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
            {surah.nameComplex}
          </h1>
          <div
            dir="rtl"
            className="text-[22px] font-medium text-ink-soft"
            style={{ fontFamily: 'var(--font-arabic-ui)' }}
          >
            {surah.nameArabic}
          </div>
        </div>
        <p className="mt-1 text-[13px] text-ink-muted">
          {surah.meaning} · {total} āyāt · {surah.revelationPlace === 'makkah' ? 'Makkī' : 'Madanī'}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex items-center gap-2 rounded-full border border-hero/40 bg-hero-soft px-5 py-2.5 text-[14px] font-bold text-hero-deep shadow-soft-sm transition-colors hover:bg-hero/10"
          >
            <Icon name="play" size={14} />
            {playing ? 'Pause' : currentAyah === 1 ? 'Play surah' : `Resume · ayah ${currentAyah}`}
          </button>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-card px-4 py-2 text-[12px] font-bold text-ink-soft transition-colors hover:bg-bg-sunk"
          >
            <Icon name="shuffle" size={12} />
            Restart
          </button>
          <label className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            Reciter
            <select
              value={reciter}
              onChange={(e) => {
                const r = e.target.value as Reciter
                setReciter(r)
                saveReciter(r)
              }}
              className="rounded border border-hairline bg-card px-2 py-0.5 text-[11px] font-bold text-ink"
            >
              <option value="Husary_128kbps">al-Ḥuṣarī</option>
              <option value="Alafasy_128kbps">Mishary</option>
              <option value="Minshawy_Murattal_128kbps">al-Minshāwī</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft">
            <input
              type="checkbox"
              checked={showText}
              onChange={(e) => setShowText(e.target.checked)}
            />
            Show text
          </label>
          <label className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft">
            <input
              type="checkbox"
              checked={showTranslation}
              onChange={(e) => setShowTranslation(e.target.checked)}
            />
            Translation
          </label>
        </div>

        <audio
          ref={audioRef}
          src={ayahAudioUrl(surahId, currentAyah, reciter)}
          preload="auto"
          onEnded={handleEnded}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
        />

        <div className="mt-8 grid gap-3">
          {surah.ayat.map((a) => {
            const isActive = a.number === currentAyah
            const starred = isBookmarked(surahId, a.number)
            void starTick
            return (
              <div
                key={a.number}
                ref={isActive ? activeRef : null}
                className={cn(
                  'rounded-xl border bg-card p-5 shadow-soft-sm transition-all',
                  isActive
                    ? 'border-hero bg-hero-soft/40'
                    : 'border-hairline hover:border-hero/30',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => jumpTo(a.number)}
                    className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-hero-deep"
                  >
                    <Icon name="play" size={10} />
                    Ayah {a.number}
                  </button>
                  <div className="flex items-center gap-2">
                    {isActive && playing && (
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hero-deep">
                        ● Playing
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        toggleBookmark(surahId, a.number)
                        setStarTick((t) => t + 1)
                      }}
                      aria-label={starred ? 'Unbookmark ayah' : 'Bookmark ayah'}
                      className="inline-flex items-center rounded-md border border-hairline bg-card px-1.5 py-1 transition-colors hover:border-hero"
                      style={{
                        color: starred
                          ? 'var(--color-hero-deep)'
                          : 'var(--color-ink-muted)',
                        borderColor: starred ? 'var(--color-hero)' : undefined,
                        background: starred
                          ? 'color-mix(in oklch, var(--color-hero) 10%, transparent)'
                          : undefined,
                      }}
                    >
                      <Icon name={starred ? 'star-filled' : 'star'} size={12} />
                    </button>
                  </div>
                </div>
                {showText && (
                  <div
                    dir="rtl"
                    className="mt-3 text-center text-ink"
                    style={{
                      fontFamily: 'var(--font-arabic-ayah)',
                      fontSize: 'clamp(20px, 4.5vw, 26px)',
                      lineHeight: 2,
                    }}
                  >
                    {a.text}
                  </div>
                )}
                {showTranslation && (
                  <div className="mt-3 text-center text-[12px] italic text-ink-muted">
                    "{a.translation}"
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
