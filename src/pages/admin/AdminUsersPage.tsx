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

const ROLE_COLOR: Record<string, string> = {
  admin:   'var(--tertiary)',
  analyst: 'var(--primary)',
  user:    'var(--secondary)',
}

interface BackendUser {
  id: number; username: string; email: string; role: 'user' | 'analyst' | 'admin'; is_active: boolean; date_joined: string
}

// ── Role summary bar ─────────────────────────────────────────────────────────
function RoleSummaryBar({ users }: { users: AdminUser[] }) {
  const counts = { admin: 0, analyst: 0, user: 0 }
  users.forEach(u => { if (u.role in counts) counts[u.role as keyof typeof counts]++ })
  const total = users.length || 1

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
      {(['admin', 'analyst', 'user'] as const).map(r => {
        const color = ROLE_COLOR[r]
        const pct = ((counts[r] / total) * 100).toFixed(0)
        return (
          <div key={r} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)',
            background: `color-mix(in srgb, ${color} 12%, var(--surface-container))`,
            border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, color, textTransform: 'capitalize' }}>{r}</span>
            <span style={{ fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', color: 'var(--on-surface)', fontWeight: 700 }}>
              {counts[r]}
            </span>
            <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>({pct}%)</span>
          </div>
        )
      })}
      <span style={{ marginLeft: 'auto', fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
        {users.length} total users
      </span>
    </div>
  )
}

export function AdminUsersPage() {
  const { state, refetch } = useData<BackendUser[]>('/api/auth/admin/users/')
  const [editing, setEditing]   = useState<AdminUser | null>(null)
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState<string | undefined>()
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'analyst' | 'admin'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'username' | 'email' | 'role' | 'dateJoined'>('dateJoined')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleEdit   = useCallback((user: AdminUser) => { setEditing(user); setSaveError(undefined) }, [])
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
    } finally { setDeleting(false) }
  }, [pendingDelete, refetch])

  const handleSave = useCallback(async (values: AdminUserEditValues) => {
    if (!editing) return
    setSaving(true); setSaveError(undefined)
    try {
      await api.patch(`/api/auth/admin/users/${editing.id}/`, { email: values.email, username: values.username, role: values.role })
      toast.success(`Updated ${values.username}`)
      setEditing(null)
      refetch()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed'
      setSaveError(msg); toast.error(msg)
    } finally { setSaving(false) }
  }, [editing, refetch])

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const users: AdminUser[] = useMemo(() => {
    if (state.status !== 'success') return []
    const q = search.trim().toLowerCase()
    let rows = state.data
      .filter(u => roleFilter === 'all'   || u.role === roleFilter)
      .filter(u => statusFilter === 'all' || (statusFilter === 'active' ? u.is_active : !u.is_active))
      .filter(u => !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .map(u => ({
        id: u.id, username: u.username, email: u.email, role: u.role,
        isActive: u.is_active, dateJoined: new Date(u.date_joined).toLocaleDateString(),
      }))

    rows = [...rows].sort((a, b) => {
      const va = String(a[sortKey] ?? '').toLowerCase()
      const vb = String(b[sortKey] ?? '').toLowerCase()
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
    return rows
  }, [state, roleFilter, statusFilter, search, sortKey, sortDir])

  const allUsers: AdminUser[] = useMemo(() => {
    if (state.status !== 'success') return []
    return state.data.map(u => ({
      id: u.id, username: u.username, email: u.email, role: u.role,
      isActive: u.is_active, dateJoined: new Date(u.date_joined).toLocaleDateString(),
    }))
  }, [state])

  const SortBtn = ({ k, children }: { k: typeof sortKey; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => toggleSort(k)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 'inherit', color: 'inherit', fontWeight: sortKey === k ? 700 : 400 }}
    >
      {children}
      <span style={{ fontSize: 10, opacity: sortKey === k ? 1 : 0.3 }}>{sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
    </button>
  )

  return (
    <div className="p-6 stack stack-5">
      <PageHeader title="User Management" subtitle="View, search, and manage all platform accounts." />

      {state.status === 'success' && allUsers.length > 0 && <RoleSummaryBar users={allUsers} />}

      {/* Filter + sort bar */}
      {state.status === 'success' && state.data.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Search */}
          <div style={{ maxWidth: 360 }}>
            <Input
              placeholder="Search username or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>Role:</span>
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
            <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', marginLeft: 'var(--space-3)' }}>Status:</span>
            {(['all', 'active', 'inactive'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 'var(--radius-full)', textTransform: 'capitalize' }}
              >
                {s}
              </button>
            ))}
            {(roleFilter !== 'all' || statusFilter !== 'all' || search) && (
              <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)', marginLeft: 'auto' }}>
                {users.length} of {state.data.length}
              </span>
            )}
          </div>
          {/* Sort row */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', flexWrap: 'wrap' }}>
            <span>Sort by:</span>
            <SortBtn k="username">Username</SortBtn>
            <SortBtn k="email">Email</SortBtn>
            <SortBtn k="role">Role</SortBtn>
            <SortBtn k="dateJoined">Joined</SortBtn>
          </div>
        </div>
      )}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={refetch} />}
      {(state.status === 'loading' || state.status === 'idle') && <Skeleton className="h-64 w-full" />}
      {state.status === 'success' && users.length === 0 && (
        <EmptyState title="No users" description="No users match the current filters." />
      )}
      {state.status === 'success' && users.length > 0 && (
        <AdminUserTable users={users} onEdit={handleEdit} onDelete={u => setPendingDelete(u)} />
      )}

      {/* Edit modal */}
      {editing && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={e => e.target === e.currentTarget && setEditing(null)}
        >
          <div className="card" style={{ width: '100%', maxWidth: 440 }}>
            <div className="cluster cluster-4" style={{ justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div>
                <span className="text-headline-sm">Edit User</span>
                <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)', marginTop: 4 }}>
                  ID #{editing.id} · Joined {editing.dateJoined}
                </p>
              </div>
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
        description={pendingDelete ? `User "${pendingDelete.username}" (${pendingDelete.email}) will be permanently removed. This cannot be undone.` : undefined}
        confirmText="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
