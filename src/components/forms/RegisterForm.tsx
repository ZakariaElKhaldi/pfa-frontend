import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OAuthButton } from '@/components/common/OAuthButton'

export interface RegisterFormValues {
  username: string
  email: string
  password1: string
  password2: string
}

export interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => void
  onOAuth?: (provider: 'google' | 'github') => void
  onSwitchToLogin?: () => void
  loading?: boolean
  error?: string
}

export function RegisterForm({ onSubmit, onOAuth, onSwitchToLogin, loading, error }: RegisterFormProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')

  const passwordMismatch = password2.length > 0 && password1 !== password2

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (passwordMismatch) return
    onSubmit({ username, email, password1, password2 })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <header className="flex flex-col gap-1">
        <h1 className="text-headline-md font-semibold" style={{ color: 'var(--on-surface)' }}>
          Create your account
        </h1>
        <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
          Start tracking sentiment in seconds
        </p>
      </header>

      {onOAuth && (
        <div className="flex flex-col gap-2">
          <OAuthButton provider="google" onClick={() => onOAuth('google')} disabled={loading} />
          <OAuthButton provider="github" onClick={() => onOAuth('github')} disabled={loading} />
          <div className="flex items-center gap-3 my-1" aria-hidden="true">
            <div className="flex-1 h-px" style={{ background: 'var(--outline-variant)' }} />
            <span className="text-label-sm uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--outline-variant)' }} />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-username">Username</Label>
        <Input
          id="register-username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-password1">Password</Label>
        <Input
          id="register-password1"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password1}
          onChange={(e) => setPassword1(e.target.value)}
          disabled={loading}
          aria-describedby="register-password-help"
        />
        <span id="register-password-help" className="text-label-sm" style={{ color: 'var(--on-surface-muted)' }}>
          At least 8 characters
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-password2">Confirm password</Label>
        <Input
          id="register-password2"
          type="password"
          autoComplete="new-password"
          required
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          disabled={loading}
          aria-invalid={passwordMismatch || undefined}
        />
        {passwordMismatch && (
          <span role="alert" className="text-label-sm" style={{ color: 'var(--tertiary)' }}>
            Passwords don&apos;t match
          </span>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg px-3 py-2 text-body-sm"
          style={{ background: 'var(--tertiary-container)', color: 'var(--tertiary)' }}
        >
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading || passwordMismatch} className="w-full">
        {loading ? 'Creating account…' : 'Create account'}
      </Button>

      {onSwitchToLogin && (
        <p className="text-center text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            Sign in
          </button>
        </p>
      )}
    </form>
  )
}
