import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OAuthButton } from '@/components/common/OAuthButton'

export interface LoginFormValues {
  email: string
  password: string
}

export interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void
  onOAuth?: (provider: 'google' | 'github') => void
  onForgotPassword?: () => void
  onSwitchToRegister?: () => void
  loading?: boolean
  error?: string
}

export function LoginForm({
  onSubmit,
  onOAuth,
  onForgotPassword,
  onSwitchToRegister,
  loading,
  error,
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <header className="flex flex-col gap-1">
        <h1 className="text-headline-md font-semibold" style={{ color: 'var(--on-surface)' }}>
          Welcome back
        </h1>
        <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
          Sign in to your CrowdSignal account
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
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-label-md underline-offset-2 hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              Forgot?
            </button>
          )}
        </div>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg px-3 py-2 text-body-sm"
          style={{ background: 'var(--tertiary-container)', color: 'var(--on-tertiary-container, var(--tertiary))' }}
        >
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>

      {onSwitchToRegister && (
        <p className="text-center text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-medium hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            Create one
          </button>
        </p>
      )}
    </form>
  )
}
