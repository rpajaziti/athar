import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Icon } from '@/components/ui/Icon'
import { SURAH_BY_ID } from '@/data/quran'
import { getBookmarks, toggleBookmark, type Bookmark } from '@/lib/progress'

export function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => getBookmarks())

  const remove = (surahId: number, ayahNumber: number) => {
    toggleBookmark(surahId, ayahNumber)
    setBookmarks(getBookmarks())
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
          Back
        </Link>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
          Bookmarks
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-3xl px-6 pb-24 pt-8">
        <h1 className="text-balance text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
          Starred ayat.
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Tap the star on any ayah card to collect it here — your personal weak-spot list, independent of scores.
        </p>

        {bookmarks.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/review/mixed?starred=1"
              className="inline-flex items-center gap-1.5 rounded-[14px] border border-hero/40 bg-hero-soft px-5 py-3 text-[14px] font-bold text-hero-deep shadow-soft-sm transition-colors hover:bg-hero/10"
            >
              <Icon name="star-filled" size={14} />
              Drill starred only
            </Link>
            <Link
              to="/review/mixed?starred=1&timed=60"
              className="inline-flex items-center gap-1.5 rounded-[14px] border border-hairline bg-card px-5 py-3 text-[14px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk"
            >
              <Icon name="timer" size={14} />
              60s starred sprint
            </Link>
          </div>
        )}

        {bookmarks.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-hairline bg-card p-10 text-center">
            <Icon name="star" size={32} className="mx-auto text-ink-muted" />
            <div className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
              No bookmarks yet
            </div>
            <p className="mt-2 text-[13px] text-ink-soft">
              Drill any ayah and tap the star in its card header — it will show up here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-3">
            {bookmarks.map((b) => {
              const surah = SURAH_BY_ID.get(b.surahId)
              const ayah = surah?.ayat.find((a) => a.number === b.ayahNumber)
              if (!surah || !ayah) return null
              return (
                <div
                  key={`${b.surahId}-${b.ayahNumber}`}
                  className="rounded-xl border border-hairline bg-card p-4 shadow-soft-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[11px] font-bold text-ink-muted">
                        {String(surah.id).padStart(3, '0')}
                      </span>
                      <span className="text-[14px] font-bold text-ink">
                        {surah.nameComplex}
                      </span>
                      <span
                        dir="rtl"
                        className="text-[14px] text-ink-soft"
                        style={{ fontFamily: 'var(--font-arabic-ui)' }}
                      >
                        {surah.nameArabic}
                      </span>
                      <span className="font-mono text-[11px] text-ink-muted">
                        · ayah {ayah.number}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(b.surahId, b.ayahNumber)}
                      aria-label="Remove bookmark"
                      className="inline-flex items-center gap-1 rounded-md border border-hero bg-hero-soft px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-hero-deep transition-colors hover:opacity-80"
                    >
                      <Icon name="star-filled" size={10} />
                      Unstar
                    </button>
                  </div>
                  <div
                    dir="rtl"
                    className="mt-3 text-center text-ink"
                    style={{
                      fontFamily: 'var(--font-arabic-ayah)',
                      fontSize: 'clamp(18px, 4vw, 24px)',
                      lineHeight: 2,
                    }}
                  >
                    {ayah.text}
                  </div>
                  <div className="mt-3 text-center text-[12px] italic text-ink-muted">
                    "{ayah.translation}"
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Link
                      to={`/listen/${surah.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink-soft transition-colors hover:border-hero hover:bg-hero-soft hover:text-hero-deep"
                    >
                      <Icon name="play" size={12} />
                      Listen sūrah
                    </Link>
                    <Link
                      to={`/drill/${surah.id}/recite`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink-soft transition-colors hover:border-hero hover:bg-hero-soft hover:text-hero-deep"
                    >
                      <Icon name="feather" size={12} />
                      Murājaʿah
                    </Link>
                    <Link
                      to={`/drill/${surah.id}/easy`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-easy px-3 py-1.5 text-[12px] font-bold text-easy-deep transition-colors hover:bg-easy-soft"
                    >
                      Easy drill
                      <Icon name="arrow-r" size={12} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
