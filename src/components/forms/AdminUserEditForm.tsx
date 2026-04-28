import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UserRole } from '@/components/design-system/RoleBadge'

export interface AdminUserEditValues {
  email:    string
  username: string
  role:     UserRole
}

export interface AdminUserEditFormProps {
  /** Pre-populated from AdminUser row — all fields required */
  initial:  AdminUserEditValues
  onSubmit: (values: AdminUserEditValues) => void
  loading?: boolean
  error?:   string
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'user',     label: 'User'     },
  { value: 'analyst',  label: 'Analyst'  },
  { value: 'admin',    label: 'Admin'    },
]

export function AdminUserEditForm({ initial, onSubmit, loading, error }: AdminUserEditFormProps) {
  const [values, setValues] = useState<AdminUserEditValues>(initial)

  useEffect(() => {
    setValues(initial)
  }, [initial])

  const dirty =
    values.email    !== initial.email    ||
    values.username !== initial.username ||
    values.role     !== initial.role

  function update<K extends keyof AdminUserEditValues>(key: K, value: AdminUserEditValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <header className="flex flex-col gap-1">
        <h2 className="text-headline-sm font-semibold" style={{ color: 'var(--on-surface)' }}>
          Edit user
        </h2>
        <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
          Changes are applied via <code>PATCH /api/auth/admin/users/&lt;pk&gt;/</code>
        </p>
      </header>

      <div className="flex flex-col gap-2">
        <Label htmlFor="aue-username">Username</Label>
        <Input
          id="aue-username"
          type="text"
          autoComplete="off"
          value={values.username}
          onChange={(e) => update('username', e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="aue-email">Email</Label>
        <Input
          id="aue-email"
          type="email"
          autoComplete="off"
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="aue-role">Role</Label>
        <select
          id="aue-role"
          value={values.role}
          onChange={(e) => update('role', e.target.value as UserRole)}
          disabled={loading}
          style={{
            padding:      'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border:       '1px solid var(--outline-variant)',
            background:   'var(--surface-container)',
            color:        'var(--on-surface)',
            fontSize:     'var(--text-body-sm)',
          }}
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding:      'var(--space-3) var(--space-4)',
            background:   'var(--tertiary-container)',
            color:        'var(--tertiary)',
            borderRadius: 'var(--radius-md)',
            fontSize:     'var(--text-body-sm)',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
        <Button
          type="button"
          variant="outline"
          disabled={loading || !dirty}
          onClick={() => setValues(initial)}
        >
          Reset
        </Button>
        <Button type="submit" disabled={loading || !dirty}>
          {loading ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
