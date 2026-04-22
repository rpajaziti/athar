import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { Icon } from '@/components/ui/Icon'
import { Wordmark } from '@/components/ui/Wordmark'
import { useAuth } from '@/lib/auth'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export function LoginPage() {
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  if (loading) return null
  if (user) return <Navigate to="/home" replace />

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase || !email) return
    setStatus('sending')
    setError(null)
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (err) {
      setStatus('error')
      setError(err.message)
      return
    }
    setStatus('sent')
  }

  const handleGoogle = async () => {
    if (!supabase) return
    setError(null)
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (err) setError(err.message)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MushafGrid />

      <header className="relative mx-auto flex max-w-3xl items-center justify-between px-5 pt-3 sm:px-6 sm:pt-5">
        <Wordmark />
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          Skip
          <Icon name="chevron" size={14} />
        </Link>
      </header>

      <main className="relative mx-auto w-full max-w-md px-5 pb-16 pt-10 sm:px-6 sm:pt-16">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hero-deep">
          Sign in · Sync across devices
        </div>
        <h1 className="mt-2 text-balance text-[26px] font-extrabold tracking-tight text-ink sm:text-[32px]">
          Keep your progress with you.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft sm:text-[14px]">
          Athar works fine without an account — your progress stays on this device. Sign
          in to carry it anywhere.
        </p>

        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-[14px] border border-hard/40 bg-hard-soft px-4 py-3 text-[13px] text-hard-deep">
            Supabase isn't configured. Copy{' '}
            <code className="font-mono text-[12px]">.env.example</code> to{' '}
            <code className="font-mono text-[12px]">.env.local</code> and fill in your
            project URL and anon key.
          </div>
        )}

        {isSupabaseConfigured && (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-hairline bg-card px-4 py-3 text-[14px] font-bold text-ink shadow-soft-sm transition-colors hover:bg-bg-sunk"
            >
              <GoogleMark />
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-hairline" />
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                or
              </div>
              <div className="h-px flex-1 bg-hairline" />
            </div>

            <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
              <label className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                Email · magic link
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'sending' || status === 'sent'}
                placeholder="you@example.com"
                className="rounded-[14px] border border-hairline bg-card px-4 py-3 text-[14px] text-ink shadow-soft-sm outline-none transition-colors focus:border-hero disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === 'sending' || status === 'sent' || !email}
                className="inline-flex items-center justify-center gap-1.5 rounded-[14px] bg-ink px-5 py-3 text-[14px] font-bold text-bg shadow-soft-sm transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {status === 'sending'
                  ? 'Sending…'
                  : status === 'sent'
                    ? 'Check your inbox'
                    : 'Send magic link'}
                {status !== 'sent' && <Icon name="arrow-r" size={14} />}
              </button>
              {status === 'sent' && (
                <div className="rounded-[14px] border border-easy/40 bg-easy-soft px-4 py-3 text-[13px] text-easy-deep">
                  Magic link sent to <strong>{email}</strong>. Open it on this device.
                </div>
              )}
              {error && (
                <div className="rounded-[14px] border border-hard/40 bg-hard-soft px-4 py-3 text-[13px] text-hard-deep">
                  {error}
                </div>
              )}
            </form>
          </>
        )}
      </main>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}
