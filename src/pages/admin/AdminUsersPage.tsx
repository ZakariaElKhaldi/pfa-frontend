import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { AdminUserTable, type AdminUser } from '@/components/cards/AdminUserTable'
import { AdminUserEditForm, type AdminUserEditValues } from '@/components/forms/AdminUserEditForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useData } from '@/hooks/useApi'
import { api } from '@/lib/api'

const ROLE_FILTERS: { value: 'all' | 'user' | 'analyst' | 'admin'; label: string }[] = [
  { value: 'all',     label: 'All' },
  { value: 'user',    label: 'Users' },
  { value: 'analyst', label: 'Analysts' },
  { value: 'admin',   label: 'Admins' },
]

interface BackendUser {
  id: number; username: string; email: string; role: 'user' | 'analyst' | 'admin'; is_active: boolean; date_joined: string
}

export function AdminUsersPage() {
  const { state, refetch } = useData<BackendUser[]>('/api/auth/admin/users/')
  const [editing, setEditing]   = useState<AdminUser | null>(null)
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState<string | undefined>()
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'analyst' | 'admin'>('all')
  const [search,     setSearch]     = useState('')

  const handleEdit = useCallback((user: AdminUser) => {
    setEditing(user)
    setSaveError(undefined)
  }, [])

  const handleDelete = useCallback(async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await api.delete(`/api/auth/admin/users/${pendingDelete.id}/`)
      toast.success(`Deleted user ${pendingDelete.username}`)
      setPendingDelete(null)
      refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }, [pendingDelete, refetch])

  const handleSave = useCallback(async (values: AdminUserEditValues) => {
    if (!editing) return
    setSaving(true)
    setSaveError(undefined)
    try {
      await api.patch(`/api/auth/admin/users/${editing.id}/`, {
        email: values.email, username: values.username, role: values.role,
      })
      toast.success(`Updated ${values.username}`)
      setEditing(null)
      refetch()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed'
      setSaveError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }, [editing, refetch])

  const users: AdminUser[] = useMemo(() => {
    if (state.status !== 'success') return []
    const q = search.trim().toLowerCase()
    return state.data
      .filter(u => roleFilter === 'all' || u.role === roleFilter)
      .filter(u => !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .map(u => ({
        id:         u.id,
        username:   u.username,
        email:      u.email,
        role:       u.role,
        isActive:   u.is_active,
        dateJoined: new Date(u.date_joined).toLocaleDateString(),
      }))
  }, [state, roleFilter, search])

  return (
    <div className="p-6 stack stack-5">
      <PageHeader title="User Management" subtitle="View and edit all platform users." />

      {/* Filter bar */}
      {state.status === 'success' && state.data.length > 0 && (
        <div className="cluster cluster-3" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="cluster cluster-2" style={{ flexWrap: 'wrap' }}>
            {ROLE_FILTERS.map(f => (
              <button
                key={f.value}
                type="button"
                onClick={() => setRoleFilter(f.value)}
                className={`btn btn-sm ${roleFilter === f.value ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 180, maxWidth: 320 }}>
            <Input
              placeholder="Search username or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {(roleFilter !== 'all' || search) && (
            <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
              {users.length} of {state.data.length}
            </span>
          )}
        </div>
      )}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={refetch} />}
      {(state.status === 'loading' || state.status === 'idle') && <Skeleton className="h-64 w-full" />}
      {state.status === 'success' && users.length === 0 && (
        <EmptyState title="No users" description="No users registered yet." />
      )}
      {state.status === 'success' && users.length > 0 && (
        <AdminUserTable users={users} onEdit={handleEdit} onDelete={u => setPendingDelete(u)} />
      )}

      {editing && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
          }}
          onClick={e => e.target === e.currentTarget && setEditing(null)}
        >
          <div className="card" style={{ width: '100%', maxWidth: 440 }}>
            <div className="cluster cluster-4" style={{ justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <span className="text-headline-sm">Edit User</span>
              <button className="btn btn-sm btn-ghost" onClick={() => setEditing(null)}>✕</button>
            </div>
            <AdminUserEditForm
              initial={{ email: editing.email, username: editing.username, role: editing.role }}
              onSubmit={handleSave}
              loading={saving}
              error={saveError}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete user?"
        description={pendingDelete ? `User "${pendingDelete.username}" will be permanently removed. This cannot be undone.` : undefined}
        confirmText="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

export function AdminUsersPagePreview() {
  const users: AdminUser[] = [
    { id: 1, username: 'zakaria',  email: 'zakaria@example.com',  role: 'admin',   isActive: true,  dateJoined: '2024-01-01' },
    { id: 2, username: 'analyst1', email: 'analyst1@example.com', role: 'analyst', isActive: true,  dateJoined: '2024-01-05' },
    { id: 3, username: 'user42',   email: 'user42@example.com',   role: 'user',    isActive: false, dateJoined: '2024-01-10' },
  ]
  return (
    <div className="p-6 stack stack-5">
      <PageHeader title="User Management" subtitle="View and edit all platform users." />
      <AdminUserTable users={users} onEdit={() => {}} onDelete={() => {}} />
    </div>
  )
}
