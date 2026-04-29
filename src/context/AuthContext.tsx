import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { api, tokenStore } from '@/lib/api'

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
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const u = await api.get<AuthUser>('/api/auth/user/')
      setUser(u)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    if (tokenStore.get()) {
      fetchUser().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [fetchUser])

  // Listen for forced logout (401 with no refresh)
  useEffect(() => {
    const handle = () => { setUser(null) }
    window.addEventListener('cs:logout', handle)
    return () => window.removeEventListener('cs:logout', handle)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ access: string; refresh: string }>(
      '/api/auth/login/',
      { email, password },
    )
    tokenStore.set(data.access)
    tokenStore.setRefresh(data.refresh)
    await fetchUser()
  }, [fetchUser])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout/', { refresh: tokenStore.getRefresh() })
    } catch { /* ignore */ }
    tokenStore.clearAll()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
