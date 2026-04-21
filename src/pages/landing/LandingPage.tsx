import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { IlluminatedCorners } from '@/components/ui/IlluminatedCorners'
import { Wordmark } from '@/components/ui/Wordmark'
import type { IconName } from '@/components/ui/Icon'

const TIERS: Array<{
  id: string
  label: string
  title: string
  subtitle: string
  body: string
  tone: 'easy' | 'medium' | 'hard' | 'hero'
  icon: IconName
}> = [
  {
    id: 'foundations',
    label: 'Tier 0',
    title: 'Foundations',
    subtitle: 'Confusable letters · Names of Allah',
    body: 'Sort ص from س, catch ٱلْمَلِك vs ٱلْمَالِك. Train the eye before the ayah.',
    tone: 'hero',
    icon: 'type',
  },
  {
    id: 'easy',
    label: 'Tier 1',
    title: 'Easy — Flow',
    subtitle: 'Fill whole words. No traps.',
    body: 'A bank of the correct words, shuffled. Rebuild the sequence and feel the surah move.',
    tone: 'easy',
    icon: 'feather',
  },
  {
    id: 'medium',
    label: 'Tier 2',
    title: 'Medium — Disambiguation',
    subtitle: 'Mixed blanks with lookalike options.',
    body: 'One letter, one ḥaraka, one word at a time — with the confusables mixed in.',
    tone: 'medium',
    icon: 'target',
  },
  {
    id: 'hard',
    label: 'Tier 3',
    title: 'Hard — Proofread',
    subtitle: 'Spot the mistake in the muṣḥaf.',
    body: 'The full ayah is shown. Some tokens are right. Some are deliberately wrong. Catch them.',
    tone: 'hard',
    icon: 'eye',
  },
  {
    id: 'expert',
    label: 'Tier 4',
    title: 'Expert — Construction',
    subtitle: 'Build a word from scrambled letters.',
    body: 'A letter-by-letter build. Artificial, but addictive.',
    tone: 'hero',
    icon: 'shuffle',
  },
]

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <MushafGrid />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 pt-6 sm:pt-8">
        <Wordmark />
        <Link
          to="/onboarding"
          className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-bold text-white shadow-soft-sm transition-transform active:translate-y-[1px]"
        >
          Start
          <Icon name="chevron" size={14} />
        </Link>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-24">
        <Hero />
        <HowItWorks />
        <Tiers />
        <TrustDisclaimer />
        <FooterCTA />
      </main>

      <footer className="relative mx-auto max-w-6xl px-6 pb-12 pt-6 text-center text-[12px] text-ink-muted">
        <p>
          Qurʾān text sourced from Tanzil.net (Ḥafṣ ʿan ʿĀṣim, Uthmani script). Athar is a
          training tool — never copy text from here for recitation.
        </p>
      </footer>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-card px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-hero-deep shadow-soft-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-hero" />
          Precision testing for huffāẓ
        </div>

        <div className="relative mx-auto w-full max-w-xl rounded-xl border bg-card px-6 pb-10 pt-12 shadow-soft-md"
          style={{
            borderColor: 'color-mix(in oklch, var(--color-hero) 45%, transparent)',
            backgroundImage:
              'linear-gradient(180deg, var(--color-hero-soft), var(--color-card))',
          }}
        >
          <IlluminatedCorners color="var(--color-hero)" />
          <div
            dir="rtl"
            className="text-hero-deep"
            style={{
              fontFamily: 'var(--font-arabic-ayah)',
              fontSize: 'clamp(36px, 6vw, 56px)',
              lineHeight: 1.5,
            }}
          >
            ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ
          </div>
          <div
            className="mx-auto mt-5 h-px w-3/5"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--color-hero), transparent)',
            }}
          />
          <div className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-hero-ink">
            One letter · One ḥaraka · One meaning
          </div>
        </div>

        <h1 className="mt-12 text-balance text-[38px] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-[56px]">
          Your hifdh, <span className="text-hero-deep">to the letter.</span>
        </h1>
        <p className="mt-5 max-w-xl text-balance text-[15px] leading-relaxed text-ink-soft sm:text-[17px]">
          Athar tests your memorization at the letter and ḥaraka level — not just
          whether you know the surah, but whether you know it <em>precisely</em>. The
          classical name for this skill is <span className="font-semibold text-ink">ḍabṭ</span>.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            to="/onboarding"
            className="group inline-flex items-center gap-2 rounded-[14px] bg-ink px-6 py-4 text-[15px] font-bold text-white shadow-soft-md transition-transform active:translate-y-[1px]"
          >
            Start a 3-minute drill
            <Icon name="arrow-r" size={16} />
          </Link>
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 rounded-[14px] px-4 py-3 text-[14px] font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            I already know the drill
            <Icon name="chevron" size={14} />
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[11px] font-medium text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="check" size={14} className="text-correct" />
            Works offline
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="check" size={14} className="text-correct" />
            No account needed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="check" size={14} className="text-correct" />
            Free, always
          </span>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Pick a surah',
      body: 'Start with the last ten surahs and Al-Fātiḥa. More will come.',
    },
    {
      n: '02',
      title: 'Choose precision',
      body: 'Five tiers — from letter confusables to full proofread.',
    },
    {
      n: '03',
      title: 'Catch the drift',
      body: 'Athar records the letters you miss and brings them back tomorrow.',
    },
  ]
  return (
    <section className="border-t border-hairline py-16">
      <div className="mx-auto max-w-3xl text-center">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
          How it works
        </div>
        <h2 className="mt-2 text-balance text-[26px] font-extrabold tracking-tight text-ink sm:text-[32px]">
          Three minutes. One drill. Every day.
        </h2>
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.n}
            className="rounded-lg border border-hairline bg-card p-6 shadow-soft-sm"
          >
            <div className="font-mono text-[11px] font-bold tracking-[0.2em] text-hero-deep">
              {s.n}
            </div>
            <div className="mt-2 text-[17px] font-extrabold tracking-tight text-ink">
              {s.title}
            </div>
            <div className="mt-2 text-[13px] leading-relaxed text-ink-soft">{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Tiers() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft shadow-soft-sm">
          <Icon name="sparkles" size={12} className="text-hero" />
          Five levels of precision
        </div>
        <h2 className="mt-3 text-balance text-[26px] font-extrabold tracking-tight text-ink sm:text-[32px]">
          From a first letter to the last shadda.
        </h2>
        <p className="mt-3 text-balance text-[14px] leading-relaxed text-ink-soft">
          Each tier is designed around a specific failure mode in hifdh. You move through
          them at your own pace.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <TierCard key={tier.id} tier={tier} />
        ))}
      </div>
    </section>
  )
}

function TierCard({ tier }: { tier: (typeof TIERS)[number] }) {
  const toneMap: Record<
    typeof tier.tone,
    { icon: string; iconBg: string; ring: string; label: string }
  > = {
    easy: {
      icon: 'var(--color-easy-deep)',
      iconBg: 'var(--color-easy-soft)',
      ring: 'color-mix(in oklch, var(--color-easy) 28%, transparent)',
      label: 'var(--color-easy-deep)',
    },
    medium: {
      icon: 'var(--color-medium-deep)',
      iconBg: 'var(--color-medium-soft)',
      ring: 'color-mix(in oklch, var(--color-medium) 28%, transparent)',
      label: 'var(--color-medium-deep)',
    },
    hard: {
      icon: 'var(--color-hard-deep)',
      iconBg: 'var(--color-hard-soft)',
      ring: 'color-mix(in oklch, var(--color-hard) 28%, transparent)',
      label: 'var(--color-hard-deep)',
    },
    hero: {
      icon: 'var(--color-hero-deep)',
      iconBg: 'var(--color-hero-soft)',
      ring: 'color-mix(in oklch, var(--color-hero) 28%, transparent)',
      label: 'var(--color-hero-deep)',
    },
  }
  const t = toneMap[tier.tone]

  return (
    <div className="group relative flex flex-col gap-3 rounded-lg border border-hairline bg-card p-5 shadow-soft-sm transition-shadow hover:shadow-soft-md">
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-md border"
          style={{ background: t.iconBg, borderColor: t.ring, color: t.icon }}
        >
          <Icon name={tier.icon} size={18} />
        </div>
        <span
          className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: t.label }}
        >
          {tier.label}
        </span>
      </div>
      <div>
        <div className="text-[16px] font-extrabold tracking-tight text-ink">
          {tier.title}
        </div>
        <div className="mt-1 text-[12px] font-medium text-ink-muted">{tier.subtitle}</div>
      </div>
      <p className="text-[13px] leading-relaxed text-ink-soft">{tier.body}</p>
    </div>
  )
}

function TrustDisclaimer() {
  return (
    <section className="py-10">
      <div
        className="relative mx-auto max-w-4xl overflow-hidden rounded-xl border p-8 shadow-soft-md sm:p-10"
        style={{
          borderColor: 'color-mix(in oklch, var(--color-warn) 45%, transparent)',
          background:
            'linear-gradient(180deg, color-mix(in oklch, var(--color-warn) 10%, var(--color-card)), var(--color-card))',
        }}
      >
        <div className="flex items-start gap-4 sm:gap-5">
          <div
            className="flex h-11 w-11 flex-none items-center justify-center rounded-md"
            style={{
              background: 'color-mix(in oklch, var(--color-warn) 20%, transparent)',
              color: 'color-mix(in oklch, var(--color-warn) 80%, black)',
            }}
          >
            <Icon name="shield" size={20} />
          </div>
          <div>
            <div
              className="font-mono text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: 'color-mix(in oklch, var(--color-warn) 80%, black)' }}
            >
              A note about incorrect letters
            </div>
            <div className="mt-2 text-[19px] font-extrabold tracking-tight text-ink sm:text-[22px]">
              Athar sometimes shows wrong letters on purpose.
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-soft sm:text-[15px]">
              To test your precision, some drills present ayāt with a letter, ḥaraka, or
              word quietly swapped for a plausible lookalike. Your job is to catch it.
              <strong className="text-ink"> These traps are never the real text.</strong>{' '}
              The authoritative muṣḥaf comes from Tanzil.net (Ḥafṣ ʿan ʿĀṣim). Use Athar
              to train your eye — never as a source for recitation or copying.
            </p>
            <ul className="mt-5 space-y-2 text-[13px] leading-relaxed text-ink-soft">
              <li className="flex items-start gap-2">
                <Icon name="check" size={14} className="mt-0.5 flex-none text-correct" />
                Every ayah shown as <em>correct</em> is exactly as in the muṣḥaf.
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" size={14} className="mt-0.5 flex-none text-correct" />
                Every trap is flagged at the end of the drill and explained.
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" size={14} className="mt-0.5 flex-none text-correct" />
                Proofread mode can be disabled if you prefer no wrong-text exposure.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function FooterCTA() {
  return (
    <section className="pt-12 pb-4">
      <div
        className="relative mx-auto overflow-hidden rounded-xl bg-ink px-8 py-12 text-center text-white shadow-soft-lg sm:px-12 sm:py-16"
      >
        <svg
          viewBox="0 0 200 200"
          aria-hidden
          className="absolute -right-10 -top-10 h-56 w-56 opacity-20"
        >
          <g stroke="var(--color-hero)" strokeWidth="0.7" fill="none">
            <path d="M100 20 L120 45 L150 40 L142 72 L170 95 L138 102 L142 135 L115 125 L100 155 L85 125 L58 135 L62 102 L30 95 L58 72 L50 40 L80 45 Z" />
            <circle cx="100" cy="95" r="30" />
            <circle cx="100" cy="95" r="18" />
          </g>
        </svg>

        <div className="relative mx-auto max-w-xl">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
            Begin
          </div>
          <h2 className="mt-3 text-balance text-[30px] font-extrabold tracking-tight sm:text-[38px]">
            One ayah. One correction. One quiet improvement.
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-white/70 sm:text-[15px]">
            Athar is built for the hafidh who already knows the surah — and wants to know
            it properly.
          </p>
          <Link
            to="/onboarding"
            className="mt-8 inline-flex items-center gap-2 rounded-[14px] bg-hero px-6 py-4 text-[15px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_0_rgba(0,0,0,0.15)] transition-transform active:translate-y-[1px]"
          >
            Start your first drill
            <Icon name="arrow-r" size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
