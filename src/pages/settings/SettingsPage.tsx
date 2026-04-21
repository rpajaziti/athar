import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Icon } from '@/components/ui/Icon'
import {
  getProgress,
  getAutoplay,
  setAutoplay as saveAutoplay,
  getReciter,
  setReciter as saveReciter,
  getRasmOnly,
  setRasmOnly as saveRasm,
  resetProgress,
  type ReciterPref,
} from '@/lib/progress'
import { cn } from '@/lib/cn'

const RECITERS: { id: ReciterPref; label: string; note: string }[] = [
  { id: 'Husary_128kbps', label: 'Maḥmūd Khalīl al-Ḥuṣarī', note: 'Deliberate · classroom-paced' },
  { id: 'Alafasy_128kbps', label: 'Mishary Rāshid al-ʿAfāsy', note: 'Warm · flowing' },
  { id: 'Minshawy_Murattal_128kbps', label: 'Muḥammad Ṣiddīq al-Minshāwī', note: 'Measured · murattal' },
]

export function SettingsPage() {
  const [reciter, setReciter] = useState<ReciterPref>(() => getReciter())
  const [rasm, setRasm] = useState(() => getRasmOnly())
  const [autoplay, setAutoplay] = useState(() => getAutoplay())
  const [resetConfirm, setResetConfirm] = useState(false)
  const progress = getProgress()

  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true)
      return
    }
    resetProgress()
    setResetConfirm(false)
    window.location.reload()
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
          Settings
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-3xl px-6 pb-24 pt-8">
        <h1 className="text-balance text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
          Tune your ḥifẓ setup.
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Preferences apply everywhere — drills, review, and the Listen page all follow the same defaults.
        </p>

        <section className="mt-10">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
            Default reciter
          </div>
          <h2 className="mt-2 text-[18px] font-bold text-ink">
            Voice for every ayah you hear.
          </h2>
          <div className="mt-4 grid gap-2">
            {RECITERS.map((r) => {
              const active = r.id === reciter
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setReciter(r.id)
                    saveReciter(r.id)
                  }}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                    active
                      ? 'border-hero bg-hero-soft'
                      : 'border-hairline bg-card hover:bg-bg-sunk',
                  )}
                >
                  <div>
                    <div className="text-[14px] font-bold text-ink">{r.label}</div>
                    <div className="text-[12px] text-ink-muted">{r.note}</div>
                  </div>
                  {active && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-hero-deep">
                      <Icon name="check" size={12} />
                      Active
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-10">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
            Display
          </div>
          <h2 className="mt-2 text-[18px] font-bold text-ink">
            How ayat show by default.
          </h2>
          <div className="mt-4 grid gap-3">
            <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-hairline bg-card px-4 py-3 hover:bg-bg-sunk">
              <div>
                <div className="text-[14px] font-bold text-ink">Rasm only by default</div>
                <div className="text-[12px] text-ink-muted">
                  Drops vowel marks. Reads by the letter skeleton — test your ḍabṭ by memory.
                </div>
              </div>
              <input
                type="checkbox"
                checked={rasm}
                onChange={(e) => {
                  setRasm(e.target.checked)
                  saveRasm(e.target.checked)
                }}
                className="mt-1 h-5 w-5 accent-hero"
              />
            </label>
            <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-hairline bg-card px-4 py-3 hover:bg-bg-sunk">
              <div>
                <div className="text-[14px] font-bold text-ink">Audio autoplay</div>
                <div className="text-[12px] text-ink-muted">
                  In Audio cue drills, play the ayah automatically when the round loads.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoplay}
                onChange={(e) => {
                  setAutoplay(e.target.checked)
                  saveAutoplay(e.target.checked)
                }}
                className="mt-1 h-5 w-5 accent-hero"
              />
            </label>
          </div>
        </section>

        <section className="mt-10">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
            Stats
          </div>
          <h2 className="mt-2 text-[18px] font-bold text-ink">
            Your record so far.
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Streak" value={`${progress.streak}d`} />
            <StatCard label="Attempts" value={String(progress.totalAttempts)} />
            <StatCard label="Sūrahs known" value={String(progress.known.length)} />
            <StatCard
              label="Accuracy"
              value={
                progress.totalAttempts > 0
                  ? `${Math.round((progress.totalCorrect / Math.max(1, progress.totalAttempts * 5)) * 100)}%`
                  : '—'
              }
            />
          </div>
        </section>

        <section className="mt-10">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-incorrect">
            Reset
          </div>
          <h2 className="mt-2 text-[18px] font-bold text-ink">
            Start fresh.
          </h2>
          <p className="mt-2 text-[13px] text-ink-soft">
            Wipes streak, mastery scores, known sūrahs, and weak-spot history from this device. Cannot be undone.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className={cn(
              'mt-4 inline-flex items-center gap-2 rounded-[14px] border px-5 py-3 text-[14px] font-bold transition-colors',
              resetConfirm
                ? 'border-incorrect bg-incorrect text-bg'
                : 'border-incorrect text-incorrect hover:bg-incorrect-soft',
            )}
          >
            <Icon name="x" size={14} />
            {resetConfirm ? 'Tap again to confirm reset' : 'Reset all progress'}
          </button>
          {resetConfirm && (
            <button
              type="button"
              onClick={() => setResetConfirm(false)}
              className="ml-3 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
            >
              Cancel
            </button>
          )}
        </section>
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-card p-4 shadow-soft-sm">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
        {label}
      </div>
      <div className="mt-1 text-[22px] font-extrabold tracking-tight text-ink">
        {value}
      </div>
    </div>
  )
}
