import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { MushafGrid } from '@/components/ui/MushafGrid'
import { useAuth } from '@/lib/auth'

export function CallbackPage() {
  const { user, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash
    const errParam =
      new URL(window.location.href).searchParams.get('error_description') ??
      new URL(window.location.href).searchParams.get('error')
    if (errParam) setError(errParam)
    if (hash) {
      const params = new URLSearchParams(hash.slice(1))
      const hashErr = params.get('error_description') ?? params.get('error')
      if (hashErr) setError(hashErr)
    }
  }, [])

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <MushafGrid />
        <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-5">
          <div className="text-[13px] font-semibold text-ink-muted">Signing you in…</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <MushafGrid />
        <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-5">
          <div className="rounded-[14px] border border-hard/40 bg-hard-soft px-4 py-3 text-[13px] text-hard-deep">
            Sign-in failed: {error}
          </div>
        </div>
      </div>
    )
  }

  return <Navigate to={user ? '/home' : '/login'} replace />
}
