import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tickersApi } from '@/api/tickers'

export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: tickersApi.getWatchlist,
    staleTime: 60_000,
  })
}

export function useAddToWatchlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tickersApi.addToWatchlist,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  })
}

export function useRemoveFromWatchlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tickersApi.removeFromWatchlist,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  })
}

export function useTickerSearch(q) {
  return useQuery({
    queryKey: ['ticker-search', q],
    queryFn: () => tickersApi.search(q),
    enabled: q?.length >= 1,
    staleTime: 30_000,
  })
}
