import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Wordmark } from '@/components/ui/Wordmark'
import { IlluminatedCorners } from '@/components/ui/IlluminatedCorners'
import { Icon } from '@/components/ui/Icon'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { OptionButton, optionState } from '@/components/ui/OptionButton'
import { Feedback } from '@/components/ui/Feedback'
import { cn } from '@/lib/cn'

type StepId = 'welcome' | 'easy' | 'medium' | 'hard' | 'done'
const STEPS: StepId[] = ['welcome', 'easy', 'medium', 'hard', 'done']

export function OnboardingPage() {
  const [stepIdx, setStepIdx] = useState(0)
  const navigate = useNavigate()
  const step = STEPS[stepIdx]

  const next = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1)
    else navigate('/home')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MushafGrid />

      <header className="relative mx-auto flex max-w-2xl items-center justify-between px-6 pt-6 sm:pt-8">
        <Wordmark />
        <Link
          to="/home"
          className="text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          Skip tour
        </Link>
      </header>

      <div className="relative mx-auto mt-6 flex max-w-2xl items-center gap-1.5 px-6">
        {STEPS.slice(0, -1).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === stepIdx ? 'w-8 bg-hero' : i < stepIdx ? 'w-4 bg-hero' : 'w-4 bg-hairline',
            )}
          />
        ))}
      </div>

      <main className="relative mx-auto w-full max-w-2xl px-6 pb-24 pt-10">
        {step === 'welcome' && <Welcome onNext={next} />}
        {step === 'easy' && <EasyDemo onNext={next} />}
        {step === 'medium' && <MediumDemo onNext={next} />}
        {step === 'hard' && <HardDemo onNext={next} />}
        {step === 'done' && <Done onNext={next} />}
      </main>
    </div>
  )
}

function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="relative w-full max-w-md rounded-xl border px-6 pb-10 pt-12 shadow-soft-md"
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
            fontSize: 'clamp(34px, 7vw, 48px)',
            lineHeight: 1.55,
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

      <div className="mt-10 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-hero">
        Welcome
      </div>
      <h1 className="mt-3 text-balance text-[32px] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[40px]">
        Your hifdh, to the letter.
      </h1>
      <p className="mt-4 max-w-md text-balance text-[15px] leading-relaxed text-ink-soft">
        Most apps ask if you know a surah. Athar asks how <em>precisely</em> — letter,
        ḥaraka, ending. Let's try one of each.
      </p>

      <PrimaryButton tone="hero" onClick={onNext} className="mt-8">
        Try a quick demo
        <Icon name="arrow-r" size={16} />
      </PrimaryButton>
    </div>
  )
}

function EasyDemo({ onNext }: { onNext: () => void }) {
  const target = 'ٱلْمُسْتَقِيمَ'
  const options = ['ٱلْمُسْتَقِيمَ', 'ٱلْمُسْتَقِينَ', 'ٱلْمُسْتَقِيمِ']
  const [picked, setPicked] = useState<string | null>(null)
  const correct = picked === target

  return (
    <DemoShell
      tone="easy"
      eyebrow="Try it · Easy · Word level"
      title="Complete the ayah."
      hint="Tap the word that belongs in the gap."
    >
      <AyahFrame>
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-ink"
          style={{ fontFamily: 'var(--font-arabic-ayah)', fontSize: 'clamp(22px, 5vw, 30px)', lineHeight: 2 }}
        >
          <span>ٱهْدِنَا</span>
          <span>ٱلصِّرَٰطَ</span>
          {picked ? (
            <span
              className="rounded-md px-2.5"
              style={{
                background: correct
                  ? 'color-mix(in oklch, var(--color-correct) 15%, transparent)'
                  : 'color-mix(in oklch, var(--color-incorrect) 12%, transparent)',
                border: `1.5px solid ${correct ? 'var(--color-correct)' : 'var(--color-incorrect)'}`,
              }}
            >
              {picked}
            </span>
          ) : (
            <span
              className="inline-block align-middle"
              style={{
                minWidth: 120,
                height: '1.2em',
                borderBottom: '2.5px dashed var(--color-easy)',
                margin: '0 6px',
              }}
            />
          )}
        </div>
        <Caption>"Guide us to the straight path."</Caption>
      </AyahFrame>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <OptionButton
            key={opt}
            arabic
            locked={picked !== null}
            state={optionState(picked, opt, target)}
            onClick={() => !picked && setPicked(opt)}
            full={i === options.length - 1}
          >
            {opt}
          </OptionButton>
        ))}
      </div>

      <div className="mt-6">
        <Feedback
          show={picked !== null}
          correct={correct}
          correctLabel="Correct"
          incorrectLabel="Not quite"
          correctText="The ending fatḥa matters — ـمَ, not ـمِ or ـنَ."
          incorrectText="ٱلْمُسْتَقِيمَ is the answer. One letter or one vowel makes the difference."
        />
      </div>

      <PrimaryButton tone="ink" disabled={!picked} onClick={onNext} className="mt-8">
        {picked ? 'Next — letter level' : 'Pick a word to continue'}
        {picked && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DemoShell>
  )
}

function MediumDemo({ onNext }: { onNext: () => void }) {
  const target = 'ص'
  const options = ['ص', 'س', 'ض', 'ث']
  const [picked, setPicked] = useState<string | null>(null)
  const correct = picked === target

  return (
    <DemoShell
      tone="medium"
      eyebrow="Try it · Medium · Letter level"
      title="Which letter fits?"
      hint="Four look alike — only one is right."
    >
      <AyahFrame>
        <div
          dir="rtl"
          className="inline-flex items-center justify-center text-ink"
          style={{ fontFamily: 'var(--font-arabic-ayah)', fontSize: 'clamp(32px, 7vw, 44px)' }}
        >
          <span>ٱل</span>
          <span
            className="mx-0.5 inline-flex items-center justify-center rounded-md"
            style={{
              width: 52,
              height: 62,
              background: picked
                ? correct
                  ? 'color-mix(in oklch, var(--color-correct) 18%, transparent)'
                  : 'color-mix(in oklch, var(--color-incorrect) 14%, transparent)'
                : 'var(--color-medium-soft)',
              border: `2px ${picked ? 'solid' : 'dashed'} ${
                picked
                  ? correct
                    ? 'var(--color-correct)'
                    : 'var(--color-incorrect)'
                  : 'var(--color-medium)'
              }`,
            }}
          >
            {picked ?? <span className="text-[22px] text-medium">?</span>}
          </span>
          <span>ِّرَٰطَ</span>
        </div>
        <Caption>al-ṣirāṭ · "the path"</Caption>
      </AyahFrame>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {options.map((opt) => (
          <OptionButton
            key={opt}
            arabic
            locked={picked !== null}
            state={optionState(picked, opt, target)}
            onClick={() => !picked && setPicked(opt)}
            square
          >
            {opt}
          </OptionButton>
        ))}
      </div>

      <div className="mt-6">
        <Feedback
          show={picked !== null}
          correct={correct}
          correctLabel="Precise"
          incorrectLabel="Close"
          correctText="ص has the emphatic ṣād sound — easily confused with س (sīn) and ض (ḍād)."
          incorrectText="The right answer is ص. Reciters often blur this — training your eye fixes it."
        />
      </div>

      <PrimaryButton tone="ink" disabled={!picked} onClick={onNext} className="mt-8">
        {picked ? 'Next — proofread' : 'Pick a letter to continue'}
        {picked && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DemoShell>
  )
}

function HardDemo({ onNext }: { onNext: () => void }) {
  const tokens = [
    { id: 't1', text: 'ٱهْدِنَا', correct: true },
    { id: 't2', text: 'ٱلسِّرَٰطَ', correct: false, fix: 'ٱلصِّرَٰطَ' },
    { id: 't3', text: 'ٱلْمُسْتَقِيمَ', correct: true },
  ]
  const [flagged, setFlagged] = useState<string | null>(null)
  const done = flagged !== null
  const correct = flagged !== null && tokens.find((t) => t.id === flagged)?.correct === false

  return (
    <DemoShell
      tone="hard"
      eyebrow="Try it · Hard · Proofread"
      title="Spot the mistake."
      hint="One word below has been quietly swapped for a lookalike. Tap the wrong one."
    >
      <AyahFrame>
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-ink"
          style={{ fontFamily: 'var(--font-arabic-ayah)', fontSize: 'clamp(22px, 5vw, 30px)', lineHeight: 2 }}
        >
          {tokens.map((t) => {
            const isFlagged = flagged === t.id
            const reveal = done
            const isWrong = !t.correct
            const tone = isFlagged
              ? isWrong
                ? 'correct'
                : 'incorrect'
              : reveal && isWrong
                ? 'reveal'
                : null

            return (
              <button
                key={t.id}
                type="button"
                disabled={done}
                onClick={() => !done && setFlagged(t.id)}
                className="rounded-md px-2.5 py-0.5 transition-colors disabled:cursor-default"
                style={{
                  background:
                    tone === 'correct'
                      ? 'color-mix(in oklch, var(--color-correct) 16%, transparent)'
                      : tone === 'incorrect'
                        ? 'color-mix(in oklch, var(--color-incorrect) 14%, transparent)'
                        : tone === 'reveal'
                          ? 'color-mix(in oklch, var(--color-correct) 10%, transparent)'
                          : 'transparent',
                  border: `1.5px dashed ${
                    tone === 'correct'
                      ? 'var(--color-correct)'
                      : tone === 'incorrect'
                        ? 'var(--color-incorrect)'
                        : tone === 'reveal'
                          ? 'var(--color-correct)'
                          : 'color-mix(in oklch, var(--color-hard) 45%, transparent)'
                  }`,
                  color: 'var(--color-ink)',
                  cursor: done ? 'default' : 'pointer',
                  fontFamily: 'var(--font-arabic-ayah)',
                }}
              >
                {t.text}
              </button>
            )
          })}
        </div>
        <Caption>One of these three does not belong in the muṣḥaf.</Caption>
      </AyahFrame>

      <div className="mt-6">
        <Feedback
          show={done}
          correct={correct}
          correctLabel="You caught it"
          incorrectLabel="The trap was elsewhere"
          correctText="ٱلسِّرَٰطَ (with سـ) is not in the muṣḥaf — the real word is ٱلصِّرَٰطَ (with صـ). This is proofread mode in one move."
          incorrectText="The tampered word was ٱلسِّرَٰطَ. Real hifdh means catching the drift before the reciter does — Athar trains exactly this."
        />
      </div>

      <PrimaryButton tone="ink" disabled={!done} onClick={onNext} className="mt-8">
        {done ? 'Finish tour' : 'Tap the wrong word to continue'}
        {done && <Icon name="arrow-r" size={16} />}
      </PrimaryButton>
    </DemoShell>
  )
}

function Done({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center pt-4 text-center">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full border-2 text-hero"
        style={{
          background: 'var(--color-hero-soft)',
          borderColor: 'var(--color-hero)',
        }}
      >
        <Icon name="check" size={44} strokeWidth={2.5} />
      </div>

      <div className="mt-7 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-hero">
        You're ready
      </div>
      <h1 className="mt-3 text-balance text-[30px] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[38px]">
        Five levels of precision.
        <br /> No lives. Just reps.
      </h1>
      <p className="mt-4 max-w-md text-balance text-[15px] leading-relaxed text-ink-soft">
        Every miss becomes a weak-spot card that comes back tomorrow. No shame, just
        quiet improvement.
      </p>

      <PrimaryButton tone="hero" onClick={onNext} className="mt-8">
        Start my first session
        <Icon name="arrow-r" size={16} />
      </PrimaryButton>
    </div>
  )
}

interface DemoShellProps {
  tone: 'easy' | 'medium' | 'hard'
  eyebrow: string
  title: string
  hint: string
  children: React.ReactNode
}

function DemoShell({ tone, eyebrow, title, hint, children }: DemoShellProps) {
  const dotColor = {
    easy: 'var(--color-easy)',
    medium: 'var(--color-medium)',
    hard: 'var(--color-hard)',
  }[tone]
  const labelColor = {
    easy: 'var(--color-easy-deep)',
    medium: 'var(--color-medium-deep)',
    hard: 'var(--color-hard-deep)',
  }[tone]

  return (
    <div>
      <div
        className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: labelColor }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: dotColor }}
        />
        {eyebrow}
      </div>
      <h2 className="mt-2 text-balance text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
        {title}
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{hint}</p>
      <div className="mt-6">{children}</div>
    </div>
  )
}

function AyahFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-hairline bg-card p-6 text-center shadow-soft-sm">
      {children}
    </div>
  )
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 text-center text-[11px] italic text-ink-muted">{children}</div>
  )
}
