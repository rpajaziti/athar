import { Link } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Wordmark } from '@/components/ui/Wordmark'
import { Icon } from '@/components/ui/Icon'
import { SURAHS, SURAH_BY_ID } from '@/data/quran'
import { hasMediumData } from '@/data/distractors'
import {
  getProgress,
  getWeakSlots,
  pickTodaysDrill,
  type Tier,
} from '@/lib/progress'

const TIER_META: Record<Exclude<Tier, 'foundations'>, { label: string; tone: string }> = {
  easy: { label: 'E', tone: 'easy' },
  medium: { label: 'M', tone: 'medium' },
  hard: { label: 'H', tone: 'hard' },
  expert: { label: 'X', tone: 'ink' },
}

const TIER_LABEL: Record<Exclude<Tier, 'foundations'>, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
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

const JUZ_NAMES: Record<number, string> = {
  1: 'Juzʾ 1 · Alif-Lām-Mīm',
  26: 'Juzʾ 26 · Ḥā-Mīm',
  27: 'Juzʾ 27 · Qāla fa-mā khaṭbukum',
  28: 'Juzʾ 28 · Qad samiʿa',
  29: 'Juzʾ 29 · Tabāraka',
  30: 'Juzʾ 30 · ʿAmma',
}

export function HomePage() {
  const progress = getProgress()
  const todays = pickTodaysDrill()
  const weakCount = getWeakSlots().length
  const todaysSurah = todays ? SURAH_BY_ID.get(todays.surahId) : null

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MushafGrid />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 pt-6 sm:pt-8">
        <Wordmark />
        <div className="flex items-center gap-4">
          {progress.streak > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-hero/40 bg-hero-soft px-3 py-1 text-[12px] font-bold text-hero-deep">
              <Icon name="target" size={12} />
              {progress.streak}-day streak
            </div>
          )}
          <Link
            to="/bookmarks"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            <Icon name="star" size={14} />
            Starred
          </Link>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            <Icon name="target" size={14} />
            Settings
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted"
          >
            <Icon name="x" size={14} />
            Exit
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-6 pt-10 pb-24">
        {todays && todaysSurah && (
          <section className="mb-12 rounded-2xl border border-hero/40 bg-hero-soft p-6 shadow-soft-sm">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
              Today's drill · Weakest spot
            </div>
            <h2 className="mt-3 text-balance text-[24px] font-extrabold tracking-tight text-ink sm:text-[28px]">
              {todaysSurah.nameComplex}{' '}
              <span
                dir="rtl"
                className="text-ink-soft"
                style={{ fontFamily: 'var(--font-arabic-ui)' }}
              >
                {todaysSurah.nameArabic}
              </span>
              <span className="ml-2 text-ink-muted"> · {TIER_LABEL[todays.tier]}</span>
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              Your best on this tier is{' '}
              <span className="font-bold text-hero-deep">{todays.bestScore}%</span>
              . Close the gap — one round.
            </p>
            <Link
              to={`/drill/${todays.surahId}/${todays.tier}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-[14px] bg-ink px-5 py-3 text-[14px] font-bold text-bg shadow-soft-sm transition-colors hover:opacity-90"
            >
              Run {TIER_LABEL[todays.tier]} · {todaysSurah.nameComplex}
              <Icon name="arrow-r" size={14} />
            </Link>
          </section>
        )}

        <section>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
            Foundations · Letter drill
          </div>
          <h2 className="mt-3 text-balance text-[24px] font-extrabold tracking-tight text-ink sm:text-[28px]">
            Warm up on the confusables.
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            Five quick rounds on the letter shapes that trip ḥuffāẓ — ص vs س vs ض,
            ح vs ه vs ة, medial nūn vs bāʾ, and the rest.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/drill/foundations"
              className="inline-flex items-center gap-1.5 rounded-[14px] border border-hairline bg-card px-5 py-3 text-[14px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk"
            >
              Run Foundations
              <Icon name="arrow-r" size={14} />
            </Link>
            <Link
              to="/drill/write"
              className="inline-flex items-center gap-1.5 rounded-[14px] border border-hairline bg-card px-5 py-3 text-[14px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk"
            >
              <Icon name="pen" size={14} />
              Draw the letter
            </Link>
          </div>
        </section>

        <section className="mt-14">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
            Mixed review · What you know
          </div>
          <h2 className="mt-3 text-balance text-[24px] font-extrabold tracking-tight text-ink sm:text-[28px]">
            Test across sūrahs.
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            {progress.known.length === 0
              ? 'Mark the sūrahs you know. Mixed review will shuffle rounds across all of them — no surah as a crutch.'
              : `Tracking ${progress.known.length} sūrah${progress.known.length === 1 ? '' : 's'} you know. Mixed review pulls ${progress.known.length > 1 ? 'random rounds across them' : 'random rounds'}.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {progress.known.length > 0 && (
              <>
                <Link
                  to="/review/mixed"
                  className="inline-flex items-center gap-1.5 rounded-[14px] border border-hero/40 bg-hero-soft px-5 py-3 text-[14px] font-bold text-hero-deep shadow-soft-sm transition-colors hover:bg-hero/10"
                >
                  Start mixed review
                  <Icon name="arrow-r" size={14} />
                </Link>
                <Link
                  to="/review/mixed?timed=60"
                  className="inline-flex items-center gap-1.5 rounded-[14px] border border-hairline bg-card px-5 py-3 text-[14px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk"
                >
                  <Icon name="target" size={14} />
                  60s sprint
                </Link>
                <Link
                  to="/review/which-surah"
                  className="inline-flex items-center gap-1.5 rounded-[14px] border border-hairline bg-card px-5 py-3 text-[14px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk"
                >
                  Which sūrah?
                  <Icon name="arrow-r" size={14} />
                </Link>
                <Link
                  to="/review/meaning"
                  className="inline-flex items-center gap-1.5 rounded-[14px] border border-hairline bg-card px-5 py-3 text-[14px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk"
                >
                  <Icon name="book" size={14} />
                  Meaning match
                </Link>
                <Link
                  to="/review/next"
                  className="inline-flex items-center gap-1.5 rounded-[14px] border border-hairline bg-card px-5 py-3 text-[14px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk"
                >
                  <Icon name="arrow-r" size={14} />
                  What comes next?
                </Link>
                <Link
                  to="/review/next?dir=prev"
                  className="inline-flex items-center gap-1.5 rounded-[14px] border border-hairline bg-card px-5 py-3 text-[14px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk"
                >
                  <Icon name="chevron" size={14} />
                  What came before?
                </Link>
                <Link
                  to="/review/locate"
                  className="inline-flex items-center gap-1.5 rounded-[14px] border border-hairline bg-card px-5 py-3 text-[14px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk"
                >
                  <Icon name="target" size={14} />
                  Locate phrase
                </Link>
                <Link
                  to="/review/connect"
                  className="inline-flex items-center gap-1.5 rounded-[14px] border border-hairline bg-card px-5 py-3 text-[14px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk"
                >
                  <Icon name="feather" size={14} />
                  Connect sūrahs
                </Link>
              </>
            )}
            <Link
              to="/review/pick"
              className="inline-flex items-center gap-1.5 rounded-[14px] border border-hairline bg-card px-5 py-3 text-[14px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk"
            >
              {progress.known.length === 0 ? 'Pick what you know' : 'Edit selection'}
              <Icon name="arrow-r" size={14} />
            </Link>
          </div>
        </section>

        {weakCount > 0 && (
          <section className="mt-14">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
              Weak-spot review · Targeted
            </div>
            <h2 className="mt-3 text-balance text-[24px] font-extrabold tracking-tight text-ink sm:text-[28px]">
              {weakCount} soft {weakCount === 1 ? 'spot' : 'spots'} to close.
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              Pulls rounds from every sūrah-tier combo where your best score
              sits below 100%. Misses come back until they don't.
            </p>
            <Link
              to="/review/weak"
              className="mt-4 inline-flex items-center gap-1.5 rounded-[14px] border border-hero/40 bg-hero-soft px-5 py-3 text-[14px] font-bold text-hero-deep shadow-soft-sm transition-colors hover:bg-hero/10"
            >
              Start weak-spot review
              <Icon name="arrow-r" size={14} />
            </Link>
          </section>
        )}

        <section className="mt-14">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
            Surah drills
          </div>
          <h2 className="mt-3 text-balance text-[24px] font-extrabold tracking-tight text-ink sm:text-[28px]">
            Pick a sūrah.
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            Easy fills a blank from a bank of correct words. Medium adds
            near-miss distractors — only one form appears in the muṣḥaf.
          </p>

          {(() => {
            const groups = new Map<number, typeof SURAHS>()
            for (const s of SURAHS) {
              const j = surahJuz(s.id)
              const arr = groups.get(j) ?? []
              arr.push(s)
              groups.set(j, arr)
            }
            const ordered = Array.from(groups.entries()).sort((a, b) => a[0] - b[0])
            return (
              <div className="mt-6 grid gap-8">
                {ordered.map(([juz, list]) => (
                  <div key={juz}>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                        {JUZ_NAMES[juz] ?? `Juzʾ ${juz}`}
                      </div>
                      <div className="h-px flex-1 bg-hairline" />
                      <Link
                        to={`/listen/juz/${juz}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-card px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted transition-colors hover:border-hero hover:text-hero-deep"
                      >
                        <Icon name="play" size={10} />
                        Listen juzʾ
                      </Link>
                      <Link
                        to={`/review/juz/${juz}/endings`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-card px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted transition-colors hover:border-medium hover:text-medium-deep"
                      >
                        <Icon name="timer" size={10} />
                        Endings sprint
                      </Link>
                      <Link
                        to={`/review/mixed?juz=${juz}&timed=300`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-card px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted transition-colors hover:border-hero hover:text-hero-deep"
                      >
                        <Icon name="target" size={10} />
                        Marathon
                      </Link>
                      <div className="font-mono text-[10px] text-ink-muted">
                        {list.length} sūrah{list.length === 1 ? '' : 's'}
                      </div>
                    </div>
                    <ul className="grid gap-3">
                      {list.map((s) => {
                        const mediumReady = hasMediumData(s.id)
                        const mastery = progress.surahs[String(s.id)] ?? {}
                        return (
                          <li
                            key={s.id}
                            className="rounded-xl border border-hairline bg-card p-4 shadow-soft-sm"
                          >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-mono text-[11px] font-bold text-ink-muted">
                        {String(s.id).padStart(3, '0')}
                      </span>
                      <span className="text-[15px] font-bold text-ink">
                        {s.nameComplex}
                      </span>
                      <span
                        dir="rtl"
                        className="text-[16px] text-ink-soft"
                        style={{ fontFamily: 'var(--font-arabic-ui)' }}
                      >
                        {s.nameArabic}
                      </span>
                      <span className="text-[12px] text-ink-muted">
                        · {s.meaning} · {s.versesCount} āyāt · {s.revelationPlace === 'makkah' ? 'Makkī' : 'Madanī'}
                      </span>
                    </div>
                    {(mastery.easy || mastery.medium || mastery.hard || mastery.expert) && (
                      <div className="flex flex-wrap gap-1.5">
                        {(['easy', 'medium', 'hard', 'expert'] as const).map((t) => {
                          const rec = mastery[t]
                          if (!rec) return null
                          const { label, tone } = TIER_META[t]
                          return (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold"
                              style={{
                                borderColor: `var(--color-${tone})`,
                                color: `var(--color-${tone}-deep, var(--color-${tone}))`,
                                background: `color-mix(in oklch, var(--color-${tone}) 8%, transparent)`,
                              }}
                            >
                              {label} · {rec.bestScore}%
                            </span>
                          )
                        })}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/drill/${s.id}/easy`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-easy px-3 py-1.5 text-[12px] font-bold text-easy-deep transition-colors hover:bg-easy-soft"
                      >
                        Easy
                        <Icon name="arrow-r" size={12} />
                      </Link>
                      <Link
                        to={`/drill/${s.id}/wordorder`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink-soft transition-colors hover:border-hero hover:bg-hero-soft hover:text-hero-deep"
                      >
                        Word order
                        <Icon name="arrow-r" size={12} />
                      </Link>
                      {s.versesCount >= 2 && (
                        <Link
                          to={`/drill/${s.id}/scramble`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink-soft transition-colors hover:border-hero hover:bg-hero-soft hover:text-hero-deep"
                        >
                          Scramble
                          <Icon name="arrow-r" size={12} />
                        </Link>
                      )}
                      <Link
                        to={`/drill/${s.id}/audio`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink-soft transition-colors hover:border-hero hover:bg-hero-soft hover:text-hero-deep"
                      >
                        <Icon name="ear" size={12} />
                        Audio
                      </Link>
                      <Link
                        to={`/listen/${s.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink-soft transition-colors hover:border-hero hover:bg-hero-soft hover:text-hero-deep"
                      >
                        <Icon name="play" size={12} />
                        Listen
                      </Link>
                      <Link
                        to={`/drill/${s.id}/recite`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink-soft transition-colors hover:border-hero hover:bg-hero-soft hover:text-hero-deep"
                      >
                        <Icon name="feather" size={12} />
                        Murājaʿah
                      </Link>
                      <Link
                        to={`/judge/${s.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink-soft transition-colors hover:border-hero hover:bg-hero-soft hover:text-hero-deep"
                      >
                        <Icon name="eye" size={12} />
                        Judge
                      </Link>
                      {s.versesCount >= 3 && (
                        <Link
                          to={`/drill/${s.id}/endings`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink-soft transition-colors hover:border-medium hover:bg-medium-soft hover:text-medium-deep"
                        >
                          Endings
                          <Icon name="arrow-r" size={12} />
                        </Link>
                      )}
                      {s.versesCount >= 2 && (
                        <Link
                          to={`/drill/${s.id}/continue`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink-soft transition-colors hover:border-hero hover:bg-hero-soft hover:text-hero-deep"
                        >
                          Continue
                          <Icon name="arrow-r" size={12} />
                        </Link>
                      )}
                      {mediumReady && s.versesCount >= 2 && (
                        <Link
                          to={`/drill/${s.id}/passage`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink-soft transition-colors hover:border-hero hover:bg-hero-soft hover:text-hero-deep"
                        >
                          Passage
                          <Icon name="arrow-r" size={12} />
                        </Link>
                      )}
                      {mediumReady ? (
                        <>
                          <Link
                            to={`/drill/${s.id}/medium`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-medium px-3 py-1.5 text-[12px] font-bold text-medium-deep transition-colors hover:bg-medium-soft"
                          >
                            Medium
                            <Icon name="arrow-r" size={12} />
                          </Link>
                          <Link
                            to={`/drill/${s.id}/hard`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-hard px-3 py-1.5 text-[12px] font-bold text-hard-deep transition-colors hover:bg-hard-soft"
                          >
                            Hard
                            <Icon name="arrow-r" size={12} />
                          </Link>
                          <Link
                            to={`/drill/${s.id}/expert`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-ink px-3 py-1.5 text-[12px] font-bold text-ink transition-colors hover:bg-bg-sunk"
                          >
                            Expert
                            <Icon name="arrow-r" size={12} />
                          </Link>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink-muted opacity-60">
                          Medium+ · soon
                        </span>
                      )}
                    </div>
                  </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )
          })()}
        </section>
      </main>
    </div>
  )
}
