import { useState } from 'react'
import { useNavigate } from 'react-router'
import { LoginForm } from '@/components/forms/LoginForm'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/lib/api'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  async function handleSubmit({ email, password }: { email: string; password: string }) {
    setLoading(true)
    setError(undefined)
    try {
      await login(email, password)
      navigate('/')
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) {
        setError('Invalid email or password.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleOAuth(provider: 'google' | 'github') {
    window.location.href = `/api/auth/${provider}/`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--surface-base)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-lg"
        style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}
      >
        <LoginForm
          onSubmit={handleSubmit}
          onOAuth={handleOAuth}
          onForgotPassword={() => navigate('/forgot-password')}
          onSwitchToRegister={() => navigate('/register')}
          loading={loading}
          error={error}
        />
      </div>
      <p className="fixed bottom-4 text-label-sm" style={{ color: 'var(--on-surface-muted)' }}>
        CrowdSignal — Sentient Terminal
      </p>
    </div>
  )
}

/** Storybook / test version: no router calls, pure props */
export function LoginPagePreview({
  loading = false,
  error,
}: {
  loading?: boolean
  error?: string
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--surface-base)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-lg"
        style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}
      >
        <LoginForm
          onSubmit={(v) => console.log('submit', v)}
          onOAuth={(p) => console.log('oauth', p)}
          onForgotPassword={() => console.log('forgot')}
          onSwitchToRegister={() => console.log('switch to register')}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}
