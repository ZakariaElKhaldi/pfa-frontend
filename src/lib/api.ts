const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')

const TOKEN_KEY = 'cs_access'
const REFRESH_KEY = 'cs_refresh'

let refreshInFlight: Promise<string | null> | null = null

function looksLikeJwt(token: string | null): boolean {
  return !!token && token.split('.').length === 3
}

export function getJwtExp(token: string | null): number | null {
  if (!token || !looksLikeJwt(token)) return null
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = payload.padEnd(payload.length + ((4 - payload.length % 4) % 4), '=')
    const decoded = JSON.parse(atob(padded)) as { exp?: unknown }
    return typeof decoded.exp === 'number' ? decoded.exp : null
  } catch {
    return null
  }
}

export function isJwtExpired(token: string | null, skewSeconds = 0): boolean {
  const exp = getJwtExp(token)
  if (!exp) return true
  return exp <= Math.floor(Date.now() / 1000) + skewSeconds
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setRefresh: (t: string) => localStorage.setItem(REFRESH_KEY, t),
  clearRefresh: () => localStorage.removeItem(REFRESH_KEY),
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    const refresh = tokenStore.getRefresh()
    if (!refresh || isJwtExpired(refresh, 5)) return null
    try {
      const res = await fetch(`${BASE}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })
      if (!res.ok) return null
      const data = await res.json()
      tokenStore.set(data.access)
      return data.access
    } catch {
      return null
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown) {
    super(`API ${status}`)
    this.status = status
    this.body = body
  }
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  let token = tokenStore.get()
  if (token && isJwtExpired(token, 5)) {
    token = await refreshAccessToken()
  }
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers })

  if (res.status === 401 && retry) {
    const fresh = await refreshAccessToken()
    if (fresh) return request<T>(path, init, false)
    tokenStore.clearAll()
    window.dispatchEvent(new Event('cs:logout'))
    throw new ApiError(401, null)
  }

  if (!res.ok) {
    let body: unknown
    try { body = await res.json() } catch { body = null }
    throw new ApiError(res.status, body)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get:    <T>(path: string)                   => request<T>(path, { method: 'GET' }),
  post:   <T>(path: string, body: unknown)    => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)    => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string)                   => request<T>(path, { method: 'DELETE' }),
}

export function getWebSocketAuthToken(): string | null {
  const token = tokenStore.get()
  return token && !isJwtExpired(token, 5) ? token : null
}
