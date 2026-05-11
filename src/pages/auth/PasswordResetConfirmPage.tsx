import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, ApiError } from '@/lib/api'

function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError) || !error.body || typeof error.body !== 'object') {
    return fallback
  }
  const body = error.body as Record<string, unknown>
  const first = Object.values(body).flatMap((value) => Array.isArray(value) ? value : [value])[0]
  return typeof first === 'string' ? first : fallback
}

export function PasswordResetConfirmPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const uid = params.get('uid') ?? ''
  const token = params.get('token') ?? ''
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const missingLinkData = !uid || !token
  const passwordMismatch = password2.length > 0 && password1 !== password2

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (missingLinkData || passwordMismatch) return
    setLoading(true)
    setError(undefined)
    try {
      await api.post('/api/auth/password/reset/confirm/', {
        uid,
        token,
        new_password1: password1,
        new_password2: password2,
      })
      toast.success('Password reset complete')
      navigate('/login')
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to reset password. Please request a new link.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--surface-base)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-lg"
        style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <header className="flex flex-col gap-1">
            <h1 className="text-headline-md font-semibold" style={{ color: 'var(--on-surface)' }}>
              Choose new password
            </h1>
            <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
              Set a new password for your CrowdSignal account.
            </p>
          </header>

          {missingLinkData && (
            <div role="alert" className="rounded-lg px-3 py-2 text-body-sm" style={{ background: 'var(--tertiary-container)', color: 'var(--on-tertiary-container, var(--tertiary))' }}>
              This reset link is incomplete. Request a new password reset email.
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="reset-password1">New password</Label>
            <Input
              id="reset-password1"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              disabled={loading || missingLinkData}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reset-password2">Confirm new password</Label>
            <Input
              id="reset-password2"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              disabled={loading || missingLinkData}
              aria-invalid={passwordMismatch || undefined}
            />
            {passwordMismatch && (
              <span role="alert" className="text-label-sm" style={{ color: 'var(--tertiary)' }}>
                Passwords don't match
              </span>
            )}
          </div>

          {error && (
            <div role="alert" className="rounded-lg px-3 py-2 text-body-sm" style={{ background: 'var(--tertiary-container)', color: 'var(--on-tertiary-container, var(--tertiary))' }}>
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading || missingLinkData || passwordMismatch || !password1 || !password2} className="w-full">
            {loading ? 'Resetting...' : 'Reset password'}
          </Button>

          <button
            type="button"
            onClick={() => navigate(missingLinkData ? '/password/reset' : '/login')}
            className="text-center text-body-sm font-medium hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            {missingLinkData ? 'Request new link' : 'Back to sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
