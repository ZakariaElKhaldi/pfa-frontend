import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { strategiesApi } from '@/api/strategies'

export function useStrategies() {
  return useQuery({
    queryKey: ['strategies'],
    queryFn: strategiesApi.list,
    staleTime: 60_000,
  })
}

export function useCreateStrategy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: strategiesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['strategies'] }),
  })
}

export function useToggleStrategy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: strategiesApi.toggle,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['strategies'] }),
  })
}

export function useDeleteStrategy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: strategiesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['strategies'] }),
  })
}

export function useStrategyExecutions(id) {
  return useQuery({
    queryKey: ['strategies', 'executions', id],
    queryFn: () => strategiesApi.getExecutions(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}
