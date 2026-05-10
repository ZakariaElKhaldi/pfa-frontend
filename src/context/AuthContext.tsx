import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { api, tokenStore } from '@/lib/api'

// ---------------------------------------------------------------------------
// DEV BYPASS — set VITE_DEV_BYPASS_AUTH=true in pfa-frontend/.env to skip login
// ---------------------------------------------------------------------------
const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

const DEV_USER: AuthUser = {
  id: 1,
  email: 'dev@crowdsignal.local',
  username: 'dev-admin',
  role: 'admin',
  is_active: true,
  date_joined: new Date().toISOString(),
}

export interface AuthUser {
  id: number
  email: string
  username: string
  role: 'user' | 'analyst' | 'admin'
  is_active: boolean
  date_joined: string
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function looksLikeJwt(token: string | null): boolean {
  if (!token) return false
  return token.split('.').length === 3
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(DEV_BYPASS ? DEV_USER : null)
  const [loading, setLoading] = useState(!DEV_BYPASS)

  const fetchUser = useCallback(async () => {
    if (DEV_BYPASS) return
    try {
      const u = await api.get<AuthUser>('/api/auth/user/')
      setUser(u)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    if (DEV_BYPASS) return
    const access = tokenStore.get()
    const refresh = tokenStore.getRefresh()
    if ((access && !looksLikeJwt(access)) || (refresh && !looksLikeJwt(refresh))) {
      tokenStore.clearAll()
      setLoading(false)
      return
    }
    if (access) {
      fetchUser().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [fetchUser])

  // Listen for forced logout (401 with no refresh)
  useEffect(() => {
    if (DEV_BYPASS) return
    const handle = () => { setUser(null) }
    window.addEventListener('cs:logout', handle)
    return () => window.removeEventListener('cs:logout', handle)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    if (DEV_BYPASS) return
    const data = await api.post<{ access: string; refresh: string }>(
      '/api/auth/login/',
      { email, password },
    )
    tokenStore.set(data.access)
    tokenStore.setRefresh(data.refresh)
    await fetchUser()
  }, [fetchUser])

  const logout = useCallback(async () => {
    if (DEV_BYPASS) return
    try {
      await api.post('/api/auth/logout/', { refresh: tokenStore.getRefresh() })
    } catch { /* ignore */ }
    tokenStore.clearAll()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
