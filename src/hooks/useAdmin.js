import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, exportApi } from '@/api/admin'

export function useAdminUsers(params) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getUsers(params),
    staleTime: 30_000,
  })
}

export function useSystemStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getSystemStats,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => adminApi.updateUser(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useExport() {
  return {
    exportSignals:   exportApi.exportSignals,
    exportPortfolio: exportApi.exportPortfolio,
  }
}
