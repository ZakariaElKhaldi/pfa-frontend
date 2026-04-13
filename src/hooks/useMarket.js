import { useQuery } from '@tanstack/react-query'
import { marketApi } from '@/api/market'

export function useQuote(symbol) {
  return useQuery({
    queryKey: ['market', 'quote', symbol],
    queryFn: () => marketApi.getQuote(symbol),
    enabled: !!symbol,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function usePrices(symbol) {
  return useQuery({
    queryKey: ['market', 'prices', symbol],
    queryFn: () => marketApi.getPrices(symbol),
    enabled: !!symbol,
    staleTime: 60_000,
  })
}

export function useIndicators(symbol) {
  return useQuery({
    queryKey: ['market', 'indicators', symbol],
    queryFn: () => marketApi.getIndicators(symbol),
    enabled: !!symbol,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
