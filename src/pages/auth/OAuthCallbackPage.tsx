import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { api, tokenStore } from '@/lib/api'

export function OAuthCallbackPage({ provider }: { provider: 'google' | 'github' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { refreshUser } = useAuth()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const params = new URLSearchParams(location.search)
    const code = params.get('code')
    const error = params.get('error')

    if (error || !code) {
      toast.error('Sign-in was cancelled or failed.')
      navigate('/login', { replace: true })
      return
    }

    const redirectUri = `${window.location.origin}/auth/callback/${provider}`

    ;(async () => {
      try {
        const data = await api.post<{ access: string; refresh: string }>(
          `/api/auth/${provider}/`,
          { code, redirect_uri: redirectUri },
        )
        tokenStore.set(data.access)
        tokenStore.setRefresh(data.refresh)
        await refreshUser()
        toast.success(`Signed in with ${provider}`)
        navigate('/', { replace: true })
      } catch {
        toast.error(`${provider} sign-in failed. Check your OAuth app settings.`)
        navigate('/login', { replace: true })
      }
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--surface-base)', color: 'var(--on-surface-muted)' }}
    >
      <p>Completing sign-in with {provider}…</p>
    </div>
  )
}
