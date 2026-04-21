import { AyahCard, Blank } from '@/components/drill/AyahCard'
import { OptionButton, optionState } from '@/components/ui/OptionButton'
import { Feedback } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

export interface DistractorRoundData {
  kind: 'distractor'
  surahId: number
  ayahNumber: number
  translation: string
  words: string[]
  blankIndex: number
  target: string
  options: string[]
  note: string
}

export interface TransitionRoundData {
  kind: 'transition'
  surahId: number
  fromAyah: number
  toAyah: number
  lastWords: string
  target: string
  options: string[]
}

export interface ProofreadRoundData {
  kind: 'proofread'
  surahId: number
  ayahNumber: number
  translation: string
  displayWords: string[]
  correctWords: string[]
  corruptedIndexes: number[]
  notes: string[]
}

export interface ConstructionRoundData {
  kind: 'construction'
  surahId: number
  ayahNumber: number
  translation: string
  words: string[]
  blankIndex: number
  target: string
  graphemes: string[]
  pool: string[]
  note: string
}

export type AnyRound =
  | DistractorRoundData
  | TransitionRoundData
  | ProofreadRoundData
  | ConstructionRoundData

interface DistractorProps {
  round: DistractorRoundData
  picked: string | null
  correct: boolean
  onPick: (opt: string) => void
  accent?: string
  optionsLabel?: string
  accentToneClass?: string
}

export function DistractorRound({
  round,
  picked,
  correct,
  onPick,
  accent = 'var(--color-medium)',
  optionsLabel = 'Options · Look closely',
  accentToneClass = 'text-medium-deep',
}: DistractorProps) {
  return (
    <>
      <AyahCard
        translation={round.translation}
        ayahNumber={round.ayahNumber}
        audio={{ surahId: round.surahId, ayahNumber: round.ayahNumber }}
      >
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-ink"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(22px, 5vw, 30px)',
            lineHeight: 2,
          }}
        >
          {round.words.map((w, i) => {
            if (i !== round.blankIndex) return <span key={i}>{w}</span>
            const state =
              picked === null ? 'idle' : correct ? 'correct' : 'wrong'
            return (
              <Blank key={i} state={state} accent={accent}>
                {picked ?? undefined}
              </Blank>
            )
          })}
        </div>
      </AyahCard>

      <div
        className={cn(
          'mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em]',
          accentToneClass,
        )}
      >
        {optionsLabel}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {round.options.map((opt) => (
          <OptionButton
            key={opt}
            arabic
            locked={picked !== null}
            state={optionState(picked, opt, round.target)}
            onClick={() => onPick(opt)}
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
          correctText={round.note}
          incorrectText={`The word in the muṣḥaf is ${round.target}. ${round.note}`}
        />
      </div>
    </>
  )
}

interface TransitionProps {
  round: TransitionRoundData
  picked: string | null
  correct: boolean
  onPick: (opt: string) => void
  accentToneClass?: string
}

export function TransitionRound({
  round,
  picked,
  correct,
  onPick,
  accentToneClass = 'text-medium-deep',
}: TransitionProps) {
  return (
    <>
      <AyahCard
        audio={{ surahId: round.surahId, ayahNumber: round.toAyah }}
      >
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Ayah {round.fromAyah} · last words
        </div>
        <div
          dir="rtl"
          className="mt-2 text-ink"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(22px, 5vw, 30px)',
            lineHeight: 2,
          }}
        >
          <span className="text-ink-muted">… </span>
          {round.lastWords}
        </div>

        <div
          className="my-5 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, var(--color-hairline), transparent)',
          }}
        />

        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Ayah {round.toAyah} · opens with
        </div>
        <div
          dir="rtl"
          className="mt-2"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(22px, 5vw, 30px)',
            lineHeight: 2,
          }}
        >
          {picked !== null ? (
            <>
              <span
                style={{
                  color: correct ? 'var(--color-correct)' : 'var(--color-incorrect)',
                  borderBottom: `2px solid ${correct ? 'var(--color-correct)' : 'var(--color-incorrect)'}`,
                  paddingBottom: 2,
                }}
              >
                {picked}
              </span>
              <span className="text-ink-muted"> …</span>
            </>
          ) : (
            <>
              <span
                className="inline-block align-middle"
                style={{
                  minWidth: 140,
                  height: '1.2em',
                  borderBottom: '2.5px dashed var(--color-hero)',
                  margin: '0 6px',
                }}
              />
              <span className="text-ink-muted">…</span>
            </>
          )}
        </div>
      </AyahCard>

      <div
        className={cn(
          'mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em]',
          accentToneClass,
        )}
      >
        Options · Which opens Ayah {round.toAyah}?
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        {round.options.map((opt) => (
          <OptionButton
            key={opt}
            arabic
            locked={picked !== null}
            state={optionState(picked, opt, round.target)}
            onClick={() => onPick(opt)}
          >
            {opt}
          </OptionButton>
        ))}
      </div>

      <div className="mt-6">
        <Feedback
          show={picked !== null}
          correct={correct}
          correctLabel="Chain held"
          incorrectLabel="Chain slipped"
          correctText={`Ayah ${round.toAyah} opens with ${round.target}.`}
          incorrectText={`Ayah ${round.toAyah} opens with ${round.target}, not ${picked}. The distractors are openings from elsewhere in this sūrah.`}
        />
      </div>
    </>
  )
}

export function isProofreadCorrect(
  flagged: number[],
  cleanMarked: boolean,
  round: ProofreadRoundData,
): boolean {
  if (round.corruptedIndexes.length === 0) {
    return cleanMarked && flagged.length === 0
  }
  if (cleanMarked) return false
  if (flagged.length !== round.corruptedIndexes.length) return false
  const want = new Set(round.corruptedIndexes)
  return flagged.every((i) => want.has(i))
}

interface ProofreadProps {
  round: ProofreadRoundData
  flagged: number[]
  cleanMarked: boolean
  submitted: boolean
  onToggleFlag: (i: number) => void
  onToggleClean: () => void
  accentToneClass?: string
}

export function ProofreadRound({
  round,
  flagged,
  cleanMarked,
  submitted,
  onToggleFlag,
  onToggleClean,
  accentToneClass = 'text-medium-deep',
}: ProofreadProps) {
  const flaggedSet = new Set(flagged)
  const corruptedSet = new Set(round.corruptedIndexes)
  const correct = submitted && isProofreadCorrect(flagged, cleanMarked, round)
  const hasCorruptions = round.corruptedIndexes.length > 0

  const missed = round.corruptedIndexes.filter((i) => !flaggedSet.has(i))
  const falseFlags = flagged.filter((i) => !corruptedSet.has(i))

  return (
    <>
      <AyahCard
        translation={round.translation}
        ayahNumber={round.ayahNumber}
        audio={{ surahId: round.surahId, ayahNumber: round.ayahNumber }}
      >
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-ink"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(22px, 5vw, 30px)',
            lineHeight: 2,
          }}
        >
          {round.displayWords.map((w, i) => {
            const isFlagged = flaggedSet.has(i)
            const isCorrupted = corruptedSet.has(i)
            let background = 'transparent'
            let border = '1.5px solid transparent'

            if (!submitted) {
              if (isFlagged) {
                background = 'color-mix(in oklch, var(--color-hero) 14%, transparent)'
                border = '1.5px solid var(--color-hero)'
              }
            } else {
              if (isFlagged && isCorrupted) {
                background = 'color-mix(in oklch, var(--color-correct) 16%, transparent)'
                border = '1.5px solid var(--color-correct)'
              } else if (isFlagged && !isCorrupted) {
                background = 'color-mix(in oklch, var(--color-incorrect) 14%, transparent)'
                border = '1.5px solid var(--color-incorrect)'
              } else if (!isFlagged && isCorrupted) {
                background = 'color-mix(in oklch, var(--color-incorrect) 10%, transparent)'
                border = '1.5px dashed var(--color-incorrect)'
              }
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => onToggleFlag(i)}
                disabled={submitted}
                className={cn(
                  'rounded-md px-2 py-0.5 transition-colors',
                  !submitted && 'hover:bg-hero-soft',
                )}
                style={{ background, border }}
              >
                {w}
              </button>
            )
          })}
        </div>
      </AyahCard>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div
          className={cn(
            'font-mono text-[10px] font-bold uppercase tracking-[0.2em]',
            accentToneClass,
          )}
        >
          Tap every suspect word — or mark clean
        </div>
        <button
          type="button"
          onClick={onToggleClean}
          disabled={submitted}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink transition-colors',
            submitted
              ? 'opacity-60'
              : cleanMarked
                ? 'border-hero bg-hero-soft text-hero-deep'
                : 'hover:bg-bg-sunk',
          )}
        >
          <Icon name="check" size={12} />
          Looks clean
        </button>
      </div>

      {!submitted && (
        <div className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          {flagged.length > 0
            ? `${flagged.length} flagged · tap again to unflag, then press Check`
            : cleanMarked
              ? 'Marked clean · press Check to commit'
              : 'Pick one or more suspect words, or mark the ayah clean'}
        </div>
      )}

      <div className="mt-6">
        <Feedback
          show={submitted}
          correct={correct}
          correctLabel="Sharp eye"
          incorrectLabel="Missed it"
          correctText={
            !hasCorruptions
              ? 'Nothing swapped — the ayah matches the muṣḥaf exactly.'
              : round.notes.join(' ')
          }
          incorrectText={
            !hasCorruptions
              ? 'This ayah was clean — no swap to catch. Trust the muṣḥaf when it matches.'
              : missed.length === 0 && falseFlags.length > 0
                ? `You flagged ${falseFlags.length} correct word${falseFlags.length === 1 ? '' : 's'} — red dashed are the real swaps. ${round.notes.join(' ')}`
                : `${round.corruptedIndexes
                    .map(
                      (idx) =>
                        `${round.correctWords[idx]} → ${round.displayWords[idx]}`,
                    )
                    .join(' · ')}. ${round.notes.join(' ')}`
          }
        />
      </div>
    </>
  )
}

interface ConstructionProps {
  round: ConstructionRoundData
  build: number[]
  submitted: boolean | null
  onAddLetter: (poolIdx: number) => void
  onBackspace: () => void
  onClear: () => void
  accentToneClass?: string
}

export function ConstructionRound({
  round,
  build,
  submitted,
  onAddLetter,
  onBackspace,
  onClear,
  accentToneClass = 'text-medium-deep',
}: ConstructionProps) {
  const assembled = build.map((i) => round.pool[i]).join('')

  const renderSlot = () => {
    if (submitted === null) {
      if (assembled === '') {
        return <Blank state="idle" accent="var(--color-medium)" />
      }
      return (
        <span
          className="inline-block rounded-md px-2.5 align-middle"
          style={{
            background: 'color-mix(in oklch, var(--color-medium) 10%, transparent)',
            border: '1.5px solid var(--color-medium)',
          }}
        >
          {assembled}
        </span>
      )
    }
    if (submitted === true) {
      return <Blank state="correct">{assembled}</Blank>
    }
    return (
      <span className="inline-flex flex-wrap items-center gap-2 align-middle">
        {assembled && (
          <span
            className="rounded-md px-2.5"
            style={{
              background:
                'color-mix(in oklch, var(--color-incorrect) 12%, transparent)',
              border: '1.5px solid var(--color-incorrect)',
              textDecoration: 'line-through',
              textDecorationColor: 'var(--color-incorrect)',
            }}
          >
            {assembled}
          </span>
        )}
        <span
          className="rounded-md px-2.5"
          style={{
            background:
              'color-mix(in oklch, var(--color-correct) 16%, transparent)',
            border: '1.5px solid var(--color-correct)',
          }}
        >
          {round.target}
        </span>
      </span>
    )
  }

  return (
    <>
      <AyahCard
        translation={round.translation}
        ayahNumber={round.ayahNumber}
        audio={{ surahId: round.surahId, ayahNumber: round.ayahNumber }}
      >
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-ink"
          style={{
            fontFamily: 'var(--font-arabic-ayah)',
            fontSize: 'clamp(22px, 5vw, 30px)',
            lineHeight: 2,
          }}
        >
          {round.words.map((w, i) => {
            if (i !== round.blankIndex) return <span key={i}>{w}</span>
            return <span key={i}>{renderSlot()}</span>
          })}
        </div>
      </AyahCard>

      <div className="mt-6 flex items-center justify-between">
        <div
          className={cn(
            'font-mono text-[10px] font-bold uppercase tracking-[0.2em]',
            accentToneClass,
          )}
        >
          Construction · tap letters in order
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBackspace}
            disabled={submitted !== null || build.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink transition-colors hover:bg-bg-sunk disabled:opacity-50"
          >
            <Icon name="x" size={12} />
            Undo
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={submitted !== null || build.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-bold text-ink transition-colors hover:bg-bg-sunk disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {round.pool.map((g, i) => {
          const used = build.includes(i)
          return (
            <button
              key={i}
              type="button"
              onClick={() => onAddLetter(i)}
              disabled={used || submitted !== null}
              dir="rtl"
              className={cn(
                'flex h-14 items-center justify-center rounded-lg border bg-card text-ink shadow-soft-sm transition-colors',
                used
                  ? 'border-hairline opacity-30'
                  : 'border-hairline hover:border-medium hover:bg-medium-soft',
              )}
              style={{
                fontFamily: 'var(--font-arabic-ayah)',
                fontSize: 'clamp(22px, 4.5vw, 26px)',
              }}
            >
              {g}
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <Feedback
          show={submitted !== null}
          correct={submitted === true}
          correctLabel="Precise"
          incorrectLabel="Not the muṣḥaf form"
          correctText={round.note}
          incorrectText={`You built ${assembled || '—'}. The muṣḥaf form is ${round.target}. ${round.note}`}
        />
      </div>
    </>
  )
}
