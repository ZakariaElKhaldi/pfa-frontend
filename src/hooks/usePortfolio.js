import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { portfolioApi } from '@/api/portfolio'

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: portfolioApi.getSummary,
    staleTime: 60_000,
  })
}

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: portfolioApi.getPortfolio,
    staleTime: 60_000,
  })
}

export function useTrades() {
  return useQuery({
    queryKey: ['portfolio', 'trades'],
    queryFn: portfolioApi.getTrades,
    staleTime: 60_000,
  })
}

export function useBuy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: portfolioApi.buy,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio'] }),
  })
}

export function useSell() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: portfolioApi.sell,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio'] }),
  })
}
