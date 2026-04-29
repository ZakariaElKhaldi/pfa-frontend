import { useState } from 'react'
import { useNavigate } from 'react-router'
import { RegisterForm, type RegisterFormValues } from '@/components/forms/RegisterForm'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  async function handleSubmit({ email, password1, password2 }: RegisterFormValues) {
    setLoading(true)
    setError(undefined)
    try {
      // Backend auto-generates username from email; password1/password2 required by dj-rest-auth
      await api.post('/api/auth/registration/', { email, password1, password2 })
      // After registration, log in automatically
      await login(email, password1)
      navigate('/')
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) {
        const body = e.body as Record<string, string[]> | null
        const first = body && Object.values(body).flat()[0]
        setError(first ?? 'Registration failed. Please check your details.')
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
        <RegisterForm
          onSubmit={handleSubmit}
          onOAuth={handleOAuth}
          onSwitchToLogin={() => navigate('/login')}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}

export function RegisterPagePreview({
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
        <RegisterForm
          onSubmit={(v) => console.log('submit', v)}
          onOAuth={(p) => console.log('oauth', p)}
          onSwitchToLogin={() => console.log('switch to login')}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}
