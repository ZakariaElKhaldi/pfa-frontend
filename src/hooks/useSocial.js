import { useQuery } from '@tanstack/react-query'
import { socialApi } from '@/api/social'

export function useSocialFeed(params) {
  return useQuery({
    queryKey: ['social', 'feed', params],
    queryFn: () => socialApi.getFeed(params),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

export function useSocialSentiment(symbol) {
  return useQuery({
    queryKey: ['social', 'sentiment', symbol],
    queryFn: () => socialApi.getSentiment(symbol),
    enabled: !!symbol,
    staleTime: 30_000,
  })
}

export function useTrending() {
  return useQuery({
    queryKey: ['social', 'trending'],
    queryFn: socialApi.getTrending,
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  })
}
