import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
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

export function PasswordResetRequestPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(undefined)
    try {
      await api.post('/api/auth/password/reset/', { email })
      setSent(true)
      toast.success('Password reset email sent')
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to send reset email. Please try again.'))
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
              Reset password
            </h1>
            <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
              Enter your account email to receive a reset link.
            </p>
          </header>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || sent}
            />
          </div>

          {sent && (
            <div role="status" className="rounded-lg px-3 py-2 text-body-sm" style={{ background: 'var(--secondary-container)', color: 'var(--secondary)' }}>
              Check your inbox for the reset link.
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-lg px-3 py-2 text-body-sm" style={{ background: 'var(--tertiary-container)', color: 'var(--on-tertiary-container, var(--tertiary))' }}>
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading || sent || !email} className="w-full">
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-center text-body-sm font-medium hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            Back to sign in
          </button>
        </form>
      </div>
    </div>
  )
}
