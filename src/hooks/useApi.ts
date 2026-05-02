import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '@/lib/api'

export type ApiState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

export function useData<T>(path: string | null, deps: unknown[] = []) {
  const [state, setState] = useState<ApiState<T>>({ status: 'idle' })
  const abortRef = useRef<AbortController | null>(null)

  const fetch = useCallback(async () => {
    if (!path) return
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setState({ status: 'loading' })
    try {
      const data = await api.get<T>(path)
      if (!ctrl.signal.aborted) setState({ status: 'success', data })
    } catch (e) {
      if (!ctrl.signal.aborted) {
        const msg = e instanceof Error ? e.message : 'Request failed'
        setState({ status: 'error', message: msg })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps])

  useEffect(() => {
    fetch()
    return () => abortRef.current?.abort()
  }, [fetch])

  const refetch = useCallback(() => fetch(), [fetch])

  return { state, refetch }
}
