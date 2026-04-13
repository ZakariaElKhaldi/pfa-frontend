import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertsApi } from '@/api/alerts'

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: alertsApi.list,
    staleTime: 30_000,
  })
}

export function useResolveAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: alertsApi.resolve,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}
