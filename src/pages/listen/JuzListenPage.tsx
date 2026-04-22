import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Icon } from '@/components/ui/Icon'
import { SURAHS } from '@/data/quran'
import { ayahAudioUrl, type Reciter } from '@/lib/audio'
import { getReciter, setReciter as saveReciter } from '@/lib/progress'
import { cn } from '@/lib/cn'

interface JuzEntry {
  surahId: number
  surahName: string
  surahArabic: string
  ayahNumber: number
  arabic: string
  translation: string
}

function surahJuz(id: number): number {
  if (id === 1) return 1
  if (id >= 78 && id <= 114) return 30
  if (id >= 67) return 29
  if (id >= 58) return 28
  if (id >= 51) return 27
  if (id >= 46) return 26
  return 1
}

function buildJuzSequence(juz: number): JuzEntry[] {
  const surahs = SURAHS.filter((s) => surahJuz(s.id) === juz)
  const out: JuzEntry[] = []
  for (const s of surahs) {
    for (const a of s.ayat) {
      out.push({
        surahId: s.id,
        surahName: s.nameComplex,
        surahArabic: s.nameArabic,
        ayahNumber: a.number,
        arabic: a.text,
        translation: a.translation,
      })
    }
  }
  return out
}

export function JuzListenPage() {
  const { juz: j } = useParams<{ juz: string }>()
  const juzNum = Number(j)
  const sequence = useMemo(() => buildJuzSequence(juzNum), [juzNum])

  const [reciter, setReciter] = useState<Reciter>(() => getReciter() as Reciter)
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showText, setShowText] = useState(true)
  const [showTranslation, setShowTranslation] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const activeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!playing) return
    const el = audioRef.current
    if (!el) return
    el.currentTime = 0
    el.play().catch(() => setPlaying(false))
  }, [idx, reciter, playing])

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [idx])

  if (sequence.length === 0) return <Navigate to="/home" replace />

  const current = sequence[idx]

  const handleEnded = () => {
    if (idx < sequence.length - 1) setIdx(idx + 1)
    else setPlaying(false)
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

  const jumpTo = (i: number) => {
    setIdx(i)
    setPlaying(true)
  }

  const restart = () => {
    setIdx(0)
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
          Listen · Juzʾ {juzNum}
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-3xl px-6 pb-28 pt-8">
        <h1 className="text-balance text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
          Juzʾ {juzNum} — continuous
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          {sequence.length} āyāt across{' '}
          {new Set(sequence.map((x) => x.surahId)).size} sūrah
          {new Set(sequence.map((x) => x.surahId)).size === 1 ? '' : 's'}. Plays uninterrupted.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex items-center gap-2 rounded-full border border-hero/40 bg-hero-soft px-5 py-2.5 text-[14px] font-bold text-hero-deep shadow-soft-sm transition-colors hover:bg-hero/10"
          >
            <Icon name="play" size={14} />
            {playing ? 'Pause' : idx === 0 ? 'Play juzʾ' : `Resume · ayah ${idx + 1} of ${sequence.length}`}
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
            <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} />
            Show text
          </label>
          <label className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft">
            <input type="checkbox" checked={showTranslation} onChange={(e) => setShowTranslation(e.target.checked)} />
            Translation
          </label>
        </div>

        <audio
          ref={audioRef}
          src={ayahAudioUrl(current.surahId, current.ayahNumber, reciter)}
          preload="auto"
          onEnded={handleEnded}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
        />

        <div className="mt-8 grid gap-2">
          {sequence.map((e, i) => {
            const isActive = i === idx
            const isSurahStart = i === 0 || sequence[i - 1].surahId !== e.surahId
            return (
              <div key={`${e.surahId}-${e.ayahNumber}`}>
                {isSurahStart && (
                  <div className="mt-6 mb-2 flex items-center gap-3">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                      {String(e.surahId).padStart(3, '0')} · {e.surahName}
                    </div>
                    <div
                      dir="rtl"
                      className="text-[14px] text-ink-soft"
                      style={{ fontFamily: 'var(--font-arabic-ui)' }}
                    >
                      {e.surahArabic}
                    </div>
                    <div className="h-px flex-1 bg-hairline" />
                  </div>
                )}
                <div
                  ref={isActive ? activeRef : null}
                  className={cn(
                    'rounded-xl border bg-card p-4 shadow-soft-sm transition-all',
                    isActive
                      ? 'border-hero bg-hero-soft/40'
                      : 'border-hairline hover:border-hero/30',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => jumpTo(i)}
                      className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-hero-deep"
                    >
                      <Icon name="play" size={10} />
                      Ayah {e.ayahNumber}
                    </button>
                    {isActive && playing && (
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hero-deep">
                        ● Playing
                      </span>
                    )}
                  </div>
                  {showText && (
                    <div
                      dir="rtl"
                      className="mt-2 text-center text-ink"
                      style={{
                        fontFamily: 'var(--font-arabic-ayah)',
                        fontSize: 'clamp(18px, 4vw, 24px)',
                        lineHeight: 2,
                      }}
                    >
                      {e.arabic}
                    </div>
                  )}
                  {showTranslation && (
                    <div className="mt-2 text-center text-[12px] italic text-ink-muted">
                      "{e.translation}"
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
