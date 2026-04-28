import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import { RoleBadge } from '@/components/design-system'

export interface AdminUser {
  id:         string | number
  username:   string
  email:      string
  role:       'user' | 'analyst' | 'admin'
  isActive:   boolean
  dateJoined: string
}

export interface AdminUserTableProps {
  users:      AdminUser[]
  onEdit?:    (user: AdminUser) => void
  onDelete?:  (user: AdminUser) => void
}

export function AdminUserTable({ users, onEdit, onDelete }: AdminUserTableProps) {
  if (users.length === 0) {
    return (
      <div
        style={{
          padding:      'var(--space-10)',
          textAlign:    'center',
          color:        'var(--on-surface-muted)',
          fontSize:     'var(--text-body-sm)',
          background:   'var(--surface-container)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        No users found
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <Table className="table">
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            {(onEdit || onDelete) && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div
                    className="avatar avatar-sm"
                    aria-hidden
                    style={{ background: 'var(--primary)', color: '#fff', fontSize: 'var(--text-label-sm)', fontWeight: 700 }}
                  >
                    {u.username[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500, color: 'var(--on-surface)' }}>
                    {u.username}
                  </span>
                </div>
              </TableCell>
              <TableCell style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
                {u.email}
              </TableCell>
              <TableCell><RoleBadge role={u.role} /></TableCell>
              <TableCell>
                <span
                  style={{
                    display:      'inline-flex',
                    padding:      '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize:     'var(--text-label-sm)',
                    fontWeight:   600,
                    background:   u.isActive ? 'var(--secondary-container)' : 'var(--surface-container-high)',
                    color:        u.isActive ? 'var(--secondary)' : 'var(--on-surface-muted)',
                  }}
                >
                  {u.isActive ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
              <TableCell style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', fontVariantNumeric: 'tabular-nums' }}>
                {u.dateJoined}
              </TableCell>
              {(onEdit || onDelete) && (
                <TableCell>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {onEdit && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => onEdit(u)}
                        aria-label={`Edit ${u.username}`}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => onDelete(u)}
                        aria-label={`Delete ${u.username}`}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
