import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Icon } from '@/components/ui/Icon'

type Tone = 'easy' | 'medium' | 'hard' | 'expert' | 'hero'

const TONE_BG: Record<Tone, string> = {
  easy: 'var(--color-easy-soft)',
  medium: 'var(--color-medium-soft)',
  hard: 'var(--color-hard-soft)',
  expert: 'var(--color-bg-sunk)',
  hero: 'var(--color-hero-soft)',
}
const TONE_BORDER: Record<Tone, string> = {
  easy: 'var(--color-easy)',
  medium: 'var(--color-medium)',
  hard: 'var(--color-hard)',
  expert: 'var(--color-ink)',
  hero: 'var(--color-hero)',
}
const TONE_LABEL: Record<Tone, string> = {
  easy: 'var(--color-easy-deep)',
  medium: 'var(--color-medium-deep)',
  hard: 'var(--color-hard-deep)',
  expert: 'var(--color-ink)',
  hero: 'var(--color-hero-deep)',
}

const arabicStyle = { fontFamily: 'var(--font-arabic-ayah)' as const }

interface Example {
  tone: Tone
  label: string
  title: string
  summary: string
  explanation: string
  to: string
  preview: ReactNode
}

function Blank({ children, tone = 'easy' }: { children?: ReactNode; tone?: Tone }) {
  return (
    <span
      className="inline-block rounded border-b-2 px-2 py-0.5"
      style={{
        borderColor: TONE_BORDER[tone],
        background: TONE_BG[tone],
        minWidth: '2.5em',
      }}
    >
      {children}
    </span>
  )
}

function Opt({
  children,
  state,
}: {
  children: ReactNode
  state?: 'correct' | 'wrong' | 'idle'
}) {
  const bg =
    state === 'correct'
      ? 'color-mix(in oklch, var(--color-correct) 18%, transparent)'
      : state === 'wrong'
        ? 'color-mix(in oklch, var(--color-incorrect) 14%, transparent)'
        : 'var(--color-card)'
  const border =
    state === 'correct'
      ? 'var(--color-correct)'
      : state === 'wrong'
        ? 'var(--color-incorrect)'
        : 'var(--color-hairline)'
  return (
    <div
      className="rounded-md border px-2 py-1.5 text-center text-[14px]"
      style={{ background: bg, borderColor: border, ...arabicStyle }}
    >
      {children}
    </div>
  )
}

const EXAMPLES: Example[] = [
  {
    tone: 'hero',
    label: 'Foundations',
    title: 'Letter confusables',
    summary: 'ص vs س vs ض — letter-shape discrimination.',
    explanation:
      'Warms up your eye for look-alikes before you touch a full ayah. You see a single letter in Uthmani shape and pick its name from three options. Designed as a daily 30-second primer.',
    to: '/drill/foundations',
    preview: (
      <>
        <div className="text-center text-[32px]" style={arabicStyle}>
          ص
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <Opt state="correct">ṣād</Opt>
          <Opt>sīn</Opt>
          <Opt>ḍād</Opt>
        </div>
      </>
    ),
  },
  {
    tone: 'hero',
    label: 'Foundations',
    title: 'Draw the letter',
    summary: 'Finger-trace on a canvas with optional ghost guide.',
    explanation:
      'Trace an Arabic letter on a touch canvas. A faint ghost letter shows the reference shape. When you finish, you self-judge solid / shaky / missed — Athar trusts your own hand.',
    to: '/drill/write',
    preview: (
      <>
        <div className="flex items-center justify-center rounded border border-hairline bg-card p-3">
          <div className="text-[48px] text-ink-muted" style={arabicStyle}>
            ض
          </div>
        </div>
        <div className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          Trace · reveal · self-judge
        </div>
      </>
    ),
  },
  {
    tone: 'easy',
    label: 'Easy',
    title: 'Fill the blank',
    summary: 'Tap the correct word from a bank.',
    explanation:
      'The full ayah is shown with one word missing. Pick the right word from three options — no look-alike traps, just flow. First tier — to feel the sūrah move without second-guessing.',
    to: '/drill/114/easy',
    preview: (
      <>
        <div
          dir="rtl"
          className="text-center text-[18px] leading-loose text-ink"
          style={arabicStyle}
        >
          قُلْ أَعُوذُ بِرَبِّ <Blank tone="easy" /> النَّاسِ
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <Opt>النَّاسِ</Opt>
          <Opt state="correct">مَلِكِ</Opt>
          <Opt>إِلَـٰهِ</Opt>
        </div>
      </>
    ),
  },
  {
    tone: 'medium',
    label: 'Medium',
    title: 'Near-miss distractors',
    summary: 'Confusable forms — only one is in the muṣḥaf.',
    explanation:
      'Same fill-in shape as Easy, but the wrong options are deliberately plausible — a ḥaraka flipped, a letter swapped, a shadda added. Tier 2 is where ḍabṭ begins.',
    to: '/drill/114/medium',
    preview: (
      <>
        <div
          dir="rtl"
          className="text-center text-[18px] leading-loose text-ink"
          style={arabicStyle}
        >
          مِن شَرِّ <Blank tone="medium" /> الْخَنَّاسِ
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <Opt>الوَسْواسِ</Opt>
          <Opt state="correct">الْوَسْوَاسِ</Opt>
          <Opt>الوِسواسِ</Opt>
        </div>
      </>
    ),
  },
  {
    tone: 'hard',
    label: 'Hard',
    title: 'Proofread the ayah',
    summary: 'Some words are swapped with confusables. Flag them.',
    explanation:
      'The complete ayah is shown with one or two quiet swaps — a dot dropped, a letter replaced. Your job is to catch every wrong token. This is the test every hafidh fears.',
    to: '/drill/112/hard',
    preview: (
      <>
        <div
          dir="rtl"
          className="text-center text-[18px] leading-loose text-ink"
          style={arabicStyle}
        >
          قُلْ هُوَ{' '}
          <span
            className="rounded px-1"
            style={{
              background: 'color-mix(in oklch, var(--color-incorrect) 14%, transparent)',
              border: '1px dashed var(--color-incorrect)',
            }}
          >
            اللَهُ
          </span>{' '}
          أَحَدٌ
        </div>
        <div className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-hard-deep">
          1 flagged · tap to check
        </div>
      </>
    ),
  },
  {
    tone: 'expert',
    label: 'Expert',
    title: 'Construct letter-by-letter',
    summary: 'Build the target word from a shuffled grapheme pool.',
    explanation:
      'Letters and ḥarakāt scrambled; you tap them into the correct order. Slow, precise, borderline addictive — reveals whether you know the word or merely recognize it.',
    to: '/drill/114/expert',
    preview: (
      <>
        <div
          dir="rtl"
          className="text-center text-[18px] leading-loose text-ink"
          style={arabicStyle}
        >
          مَلِكِ ٱلنَّاسِ
        </div>
        <div className="mt-2 grid grid-cols-6 gap-1 text-center" style={arabicStyle}>
          {['مَ', 'لِ', 'كِ', 'ٱ', 'لنَّ', 'اسِ'].map((l, i) => (
            <div key={i} className="rounded border border-ink bg-card px-1 py-1 text-[16px]">
              {l}
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    tone: 'hero',
    label: 'Challenge',
    title: 'Word order',
    summary: 'Tap words in recitation order.',
    explanation:
      'Every word of the ayah is a chip. Tap them in the order they should be recited. Fast check for sequence memory without the pressure of typing anything.',
    to: '/drill/114/wordorder',
    preview: (
      <div
        dir="rtl"
        className="flex flex-wrap justify-center gap-1.5"
        style={arabicStyle}
      >
        <span className="rounded border border-hero bg-hero-soft px-2 py-1 text-[14px]">
          1 · قُلْ
        </span>
        <span className="rounded border border-hero bg-hero-soft px-2 py-1 text-[14px]">
          2 · أَعُوذُ
        </span>
        <span className="rounded border border-hairline bg-card px-2 py-1 text-[14px]">
          بِرَبِّ
        </span>
        <span className="rounded border border-hairline bg-card px-2 py-1 text-[14px]">
          النَّاسِ
        </span>
      </div>
    ),
  },
  {
    tone: 'hero',
    label: 'Challenge',
    title: 'Scramble',
    summary: 'Ayat shuffled — tap them into muṣḥaf order.',
    explanation:
      'The ayat of a sūrah appear out of order. Sequence them. Tests the "what comes after what" map that competition hufadh need.',
    to: '/drill/114/scramble',
    preview: (
      <div className="grid gap-1 text-[12px]">
        <div className="rounded border border-hairline bg-card px-2 py-1">
          3 · مِنَ الْجِنَّةِ وَالنَّاسِ
        </div>
        <div className="rounded border border-hero bg-hero-soft px-2 py-1">
          1 · قُلْ أَعُوذُ…
        </div>
        <div className="rounded border border-hairline bg-card px-2 py-1">2 · مَلِكِ النَّاسِ</div>
      </div>
    ),
  },
  {
    tone: 'hero',
    label: 'Challenge',
    title: 'Audio cue',
    summary: 'Hear an ayah, pick which one it was.',
    explanation:
      'A reciter plays one ayah. You pick which ayah of the sūrah it was from a list. Builds the ear-to-text connection — the opposite of normal drills.',
    to: '/drill/114/audio',
    preview: (
      <>
        <div className="flex items-center justify-center gap-2 rounded-full border border-hero/40 bg-hero-soft px-3 py-2 text-[12px] font-bold text-hero-deep">
          <Icon name="play" size={12} />
          Ayah 2 of 6
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <Opt>قُلْ أَعُوذُ</Opt>
          <Opt state="correct">مَلِكِ النَّاسِ</Opt>
          <Opt>إِلَـٰهِ النَّاسِ</Opt>
        </div>
      </>
    ),
  },
  {
    tone: 'medium',
    label: 'Passage',
    title: 'Multi-ayah fill-in',
    summary: '2–3 consecutive ayat with blanks across them.',
    explanation:
      'Blanks span more than one ayah. Tests whether you hold context across verse boundaries — which is where most hufadh actually slip.',
    to: '/drill/114/passage',
    preview: (
      <div
        dir="rtl"
        className="text-center text-[14px] leading-loose text-ink"
        style={arabicStyle}
      >
        قُلْ أَعُوذُ بِرَبِّ <Blank tone="medium" /> <br />
        <Blank tone="medium" /> النَّاسِ
      </div>
    ),
  },
  {
    tone: 'medium',
    label: 'Endings',
    title: 'Fāṣila match',
    summary: 'Which ending closes this ayah?',
    explanation:
      'Pick the correct fāṣila (rhyme-word) for an ayah. Every sūrah has a rhyme pattern — this tests whether you know it, not just the words.',
    to: '/drill/114/endings',
    preview: (
      <>
        <div
          dir="rtl"
          className="text-center text-[16px] leading-loose text-ink"
          style={arabicStyle}
        >
          مَلِكِ <Blank tone="medium" />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <Opt>الْفَلَقِ</Opt>
          <Opt state="correct">النَّاسِ</Opt>
          <Opt>الصَّمَدُ</Opt>
        </div>
      </>
    ),
  },
  {
    tone: 'hard',
    label: 'Musābaqah',
    title: 'Continue-from-here',
    summary: 'Pick the opener of the next ayah.',
    explanation:
      'Given any ayah, what comes next? Chain through a whole sūrah from ayah 1. This is a core Qurʾān-competition format.',
    to: '/drill/114/continue',
    preview: (
      <>
        <div
          dir="rtl"
          className="text-[14px] leading-loose text-ink-soft"
          style={arabicStyle}
        >
          1 · قُلْ أَعُوذُ بِرَبِّ النَّاسِ
          <br />
          <span className="text-ink">2 · مَلِكِ النَّاسِ</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <Opt state="correct">إِلَـٰهِ…</Opt>
          <Opt>مِن شَرِّ…</Opt>
          <Opt>ٱلَّذِى…</Opt>
        </div>
      </>
    ),
  },
  {
    tone: 'hard',
    label: 'Musābaqah',
    title: 'What comes next / before',
    summary: 'Pick the ayah that follows — or precedes.',
    explanation:
      'Cross-surah version: any ayah from your known set, pick the one that comes next (or the one that came before). Tests the whole mental map, not one sūrah.',
    to: '/review/next',
    preview: (
      <>
        <div
          dir="rtl"
          className="text-center text-[14px] leading-loose text-ink"
          style={arabicStyle}
        >
          قُلْ أَعُوذُ بِرَبِّ النَّاسِ
        </div>
        <div className="mt-2 grid gap-1">
          <div
            className="rounded border border-correct bg-correct-soft/40 px-2 py-1 text-center text-[13px]"
            style={arabicStyle}
          >
            مَلِكِ النَّاسِ
          </div>
          <div
            className="rounded border border-hairline bg-card px-2 py-1 text-center text-[13px]"
            style={arabicStyle}
          >
            تَبَّتْ يَدَا أَبِي لَهَبٍ
          </div>
        </div>
      </>
    ),
  },
  {
    tone: 'hard',
    label: 'Musābaqah',
    title: 'Locate phrase',
    summary: 'A phrase — which sūrah and ayah is it from?',
    explanation:
      'A middle-phrase is shown with ellipses. You pick the correct sūrah + ayah from four options. Reveals where you can read but can\'t place.',
    to: '/review/locate',
    preview: (
      <>
        <div dir="rtl" className="text-center text-[16px]" style={arabicStyle}>
          … إِلَـٰهِ النَّاسِ …
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <div className="rounded border border-correct bg-correct-soft/40 px-2 py-1 text-[12px] font-bold">
            Al-Nās · ayah 3
          </div>
          <div className="rounded border border-hairline bg-card px-2 py-1 text-[12px] font-bold">
            Al-Falaq · ayah 2
          </div>
          <div className="rounded border border-hairline bg-card px-2 py-1 text-[12px] font-bold">
            Al-Mulk · ayah 12
          </div>
          <div className="rounded border border-hairline bg-card px-2 py-1 text-[12px] font-bold">
            Al-Kāfirūn · ayah 5
          </div>
        </div>
      </>
    ),
  },
  {
    tone: 'hard',
    label: 'Musābaqah',
    title: 'Connect sūrahs',
    summary: 'End of sūrah X — pick the opener of X+1.',
    explanation:
      'The classic transition drill. See the last ayah of one sūrah, pick the opener of the next. Exposes the seams between sūrahs — where recitation often wobbles.',
    to: '/review/connect',
    preview: (
      <>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          End of Al-Ikhlāṣ
        </div>
        <div dir="rtl" className="text-center text-[14px]" style={arabicStyle}>
          وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ
        </div>
        <div className="mt-2 grid gap-1">
          <div
            className="rounded border border-correct bg-correct-soft/40 px-2 py-1 text-center text-[13px]"
            style={arabicStyle}
          >
            قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ
          </div>
          <div
            className="rounded border border-hairline bg-card px-2 py-1 text-center text-[13px]"
            style={arabicStyle}
          >
            إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ
          </div>
        </div>
      </>
    ),
  },
  {
    tone: 'hero',
    label: 'Review',
    title: 'Which sūrah?',
    summary: 'See an ayah, pick the sūrah it belongs to.',
    explanation:
      'Reverse-lookup drill. Instead of "what ayah is next," this is "where am I?" — useful for opener memorization across many sūrahs.',
    to: '/review/which-surah',
    preview: (
      <>
        <div
          dir="rtl"
          className="text-center text-[16px] leading-loose text-ink"
          style={arabicStyle}
        >
          قُلْ يَا أَيُّهَا الْكَافِرُونَ
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <Opt>Al-Ikhlāṣ</Opt>
          <Opt state="correct">Al-Kāfirūn</Opt>
          <Opt>Al-Nāṣ</Opt>
        </div>
      </>
    ),
  },
  {
    tone: 'hero',
    label: 'Review',
    title: 'Meaning match',
    summary: 'Arabic ayah → pick its translation.',
    explanation:
      'Shown an ayah in Arabic, pick the correct English translation. Reinforces that you know what you\'re reciting, not just how it sounds.',
    to: '/review/meaning',
    preview: (
      <>
        <div dir="rtl" className="text-center text-[16px]" style={arabicStyle}>
          قُلْ هُوَ ٱللَّهُ أَحَدٌ
        </div>
        <div className="mt-2 grid gap-1 text-[11px] italic text-ink-muted">
          <div className="rounded border border-correct bg-correct-soft/40 px-2 py-1">
            "Say, He is Allāh, [who is] One."
          </div>
          <div className="rounded border border-hairline bg-card px-2 py-1">
            "Say, I seek refuge in the Lord of mankind."
          </div>
        </div>
      </>
    ),
  },
  {
    tone: 'hero',
    label: 'Mixed',
    title: 'Mixed review',
    summary: 'Random rounds across every sūrah you know.',
    explanation:
      'Shuffles Easy/Medium/Hard/Expert rounds across all your known sūrahs — no sūrah as a crutch. Occasional "transition" rounds link the seams.',
    to: '/review/mixed',
    preview: (
      <div className="flex flex-wrap gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
        <span className="rounded border border-hairline px-1.5 py-0.5">Easy</span>
        <span className="rounded border border-hairline px-1.5 py-0.5">Medium</span>
        <span className="rounded border border-hairline px-1.5 py-0.5">Hard</span>
        <span className="rounded border border-hairline px-1.5 py-0.5">Expert</span>
        <span className="rounded border border-hairline px-1.5 py-0.5">Transition</span>
      </div>
    ),
  },
  {
    tone: 'hero',
    label: 'Mixed',
    title: '60s sprint / Marathon',
    summary: 'Timed mixed rounds — 60 s or a full juzʾ.',
    explanation:
      'Same pool as Mixed, but against the clock. 60-second sprint for warm-up; Marathon mode locks to one juzʾ and runs 5 minutes.',
    to: '/review/mixed?timed=60',
    preview: (
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hairline/60">
          <div className="h-full w-3/4 bg-hero" />
        </div>
        <span className="font-mono text-[12px] font-bold text-hero-deep">0:42</span>
      </div>
    ),
  },
  {
    tone: 'medium',
    label: 'Weak',
    title: 'Weak-spot review',
    summary: 'Any sūrah-tier where best score is under 100%.',
    explanation:
      'Athar tracks every score. Weak-spot review sorts your soft tiers worst-first and runs them. The tightest feedback loop in the app.',
    to: '/review/weak',
    preview: (
      <div className="grid gap-1 font-mono text-[10px]">
        <div className="flex justify-between rounded border border-hairline bg-card px-2 py-1">
          <span>Al-Falaq · Hard</span>
          <span className="text-hard-deep">72%</span>
        </div>
        <div className="flex justify-between rounded border border-hairline bg-card px-2 py-1">
          <span>Al-Nās · Medium</span>
          <span className="text-medium-deep">89%</span>
        </div>
      </div>
    ),
  },
  {
    tone: 'hero',
    label: 'Recite',
    title: 'Murājaʿah — self-judge',
    summary: 'Preview → reveal → mark missed / shaky / solid.',
    explanation:
      'The honest drill. You try to recite an ayah from memory, then reveal it, then tell Athar how you did. No auto-grading — the grade is the reflection.',
    to: '/drill/114/recite',
    preview: (
      <div className="rounded border border-hairline bg-card p-2 text-center">
        <div className="font-mono text-[10px] text-ink-muted">Recite ayah 4</div>
        <div className="mt-2 grid grid-cols-3 gap-1">
          <span className="rounded border border-incorrect bg-incorrect-soft/40 px-1 py-0.5 text-[10px] font-bold text-incorrect">
            Missed
          </span>
          <span className="rounded border border-medium bg-medium-soft/40 px-1 py-0.5 text-[10px] font-bold text-medium-deep">
            Shaky
          </span>
          <span className="rounded border border-correct bg-correct-soft/40 px-1 py-0.5 text-[10px] font-bold text-correct">
            Solid
          </span>
        </div>
      </div>
    ),
  },
  {
    tone: 'hero',
    label: 'Judge',
    title: 'Judge mode (offline)',
    summary: 'Two-person flow — one reads, one taps marks per ayah.',
    explanation:
      'Pass your phone to a teacher or friend. They tap Solid/Shaky/Missed per ayah while you recite. Optional hidden-muṣḥaf mode for stricter testing.',
    to: '/judge/114',
    preview: (
      <div className="grid gap-1">
        {['Ayah 1 · Solid', 'Ayah 2 · Shaky', 'Ayah 3 · Solid'].map((t) => (
          <div key={t} className="rounded border border-hairline bg-card px-2 py-1 text-[11px]">
            {t}
          </div>
        ))}
      </div>
    ),
  },
  {
    tone: 'hero',
    label: 'Listen',
    title: 'Continuous recitation',
    summary: 'Auto-advance through a sūrah or juzʾ with three reciters.',
    explanation:
      'Not a drill — a listening companion. Plays every ayah back-to-back with scroll-follow. Ḥuṣarī, Mishary, or Minshāwī. Rasm-only display available.',
    to: '/listen/114',
    preview: (
      <>
        <div className="flex items-center gap-2">
          <Icon name="play" size={14} />
          <div className="flex-1">
            <div className="h-1 rounded-full bg-hero/60" />
          </div>
          <span className="font-mono text-[10px] text-ink-muted">3 / 6</span>
        </div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          al-Ḥuṣarī · ayah 3 playing
        </div>
      </>
    ),
  },
  {
    tone: 'hero',
    label: 'Bookmarks',
    title: 'Starred drill',
    summary: 'Any ayah tapped as starred — drill only those.',
    explanation:
      'Star an ayah anywhere in the app (the ⭐ button on every ayah card). This collection becomes its own pool for focused drills.',
    to: '/bookmarks',
    preview: (
      <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-hero-deep">
        <Icon name="star" size={10} />
        3 starred · Drill only these
      </div>
    ),
  },
]

export function ExamplesPage() {
  const navigate = useNavigate()
  return (
    <div className="relative min-h-screen overflow-hidden">
      <MushafGrid />

      <header className="relative mx-auto flex max-w-3xl items-center justify-between px-5 pt-3 sm:px-6 sm:pt-5">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) navigate(-1)
            else navigate('/home')
          }}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <Icon name="chevron" size={14} className="rotate-180" />
          Back
        </button>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
          Examples · Every drill type
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-3xl px-5 pb-16 pt-6 sm:px-6 sm:pt-8">
        <h1 className="text-balance text-[24px] font-extrabold tracking-tight text-ink sm:text-[30px]">
          Every drill, one place.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft sm:text-[14px]">
          A static gallery of every format Athar ships. Skim the previews, read what each
          one is for, tap <strong>Try</strong> to open the live version.
        </p>

        <ol className="mt-8 grid gap-4">
          {EXAMPLES.map((ex, i) => (
            <li
              key={`${ex.to}-${i}`}
              className="rounded-xl border border-hairline bg-card p-4 shadow-soft-sm sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full border font-mono text-[12px] font-bold"
                    style={{
                      borderColor: TONE_BORDER[ex.tone],
                      color: TONE_LABEL[ex.tone],
                      background: TONE_BG[ex.tone],
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
                      style={{
                        borderColor: TONE_BORDER[ex.tone],
                        color: TONE_LABEL[ex.tone],
                        background: TONE_BG[ex.tone],
                      }}
                    >
                      {ex.label}
                    </span>
                    <div className="mt-1.5 text-[16px] font-extrabold tracking-tight text-ink">
                      {ex.title}
                    </div>
                    <div className="text-[12px] font-medium text-ink-muted">
                      {ex.summary}
                    </div>
                  </div>
                </div>
                <Link
                  to={ex.to}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-[11px] font-bold text-bg shadow-soft-sm transition-opacity hover:opacity-90"
                >
                  Try
                  <Icon name="arrow-r" size={11} />
                </Link>
              </div>

              <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                {ex.explanation}
              </p>

              <div className="mt-3 rounded-lg border border-hairline bg-bg-sunk/50 p-3">
                {ex.preview}
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  )
}
