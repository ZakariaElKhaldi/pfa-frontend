import { useQuery } from '@tanstack/react-query'
import { signalsApi } from '@/api/signals'

export function useLatestSignals(limit = 20) {
  return useQuery({
    queryKey: ['signals', 'recent', limit],
    queryFn: () => signalsApi.getRecent(limit),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

export function useSignalAccuracy() {
  return useQuery({
    queryKey: ['signals', 'accuracy'],
    queryFn: signalsApi.getAccuracy,
    staleTime: 5 * 60_000,
  })
}

export function useSymbolSignalHistory(symbol) {
  return useQuery({
    queryKey: ['signals', 'history', symbol],
    queryFn: () => signalsApi.getBySymbol(symbol),
    enabled: !!symbol,
    staleTime: 30_000,
  })
}

export function useSignal(symbol) {
  return useQuery({
    queryKey: ['signals', 'latest', symbol],
    queryFn: () => signalsApi.getSignal(symbol),
    enabled: !!symbol,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

export function useSignalExplain(symbol) {
  return useQuery({
    queryKey: ['signals', 'explain', symbol],
    queryFn: () => signalsApi.getExplain(symbol),
    enabled: !!symbol,
    staleTime: 5 * 60_000,
  })
}
