import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface ProfileFormValues {
  username: string
  email: string
  firstName?: string
  lastName?: string
}

export interface ProfileFormProps {
  initial: ProfileFormValues
  onSubmit: (values: ProfileFormValues) => void
  loading?: boolean
  error?: string
  success?: string
}

export function ProfileForm({ initial, onSubmit, loading, error, success }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>(initial)

  useEffect(() => {
    setValues(initial)
  }, [initial])

  const dirty =
    values.username !== initial.username ||
    values.email !== initial.email ||
    (values.firstName ?? '') !== (initial.firstName ?? '') ||
    (values.lastName ?? '') !== (initial.lastName ?? '')

  function update<K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) {
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
          Profile
        </h2>
        <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
          Update your account details
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-firstName">First name</Label>
          <Input
            id="profile-firstName"
            type="text"
            autoComplete="given-name"
            value={values.firstName ?? ''}
            onChange={(e) => update('firstName', e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-lastName">Last name</Label>
          <Input
            id="profile-lastName"
            type="text"
            autoComplete="family-name"
            value={values.lastName ?? ''}
            onChange={(e) => update('lastName', e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-username">Username</Label>
        <Input
          id="profile-username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          value={values.username}
          onChange={(e) => update('username', e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
          disabled={loading}
        />
      </div>

      {error && (
        <div role="alert" className="rounded-lg px-3 py-2 text-body-sm" style={{ background: 'var(--tertiary-container)', color: 'var(--tertiary)' }}>
          {error}
        </div>
      )}
      {success && !error && (
        <div role="status" className="rounded-lg px-3 py-2 text-body-sm" style={{ background: 'var(--secondary-container)', color: 'var(--secondary)' }}>
          {success}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={loading || !dirty} onClick={() => setValues(initial)}>
          Reset
        </Button>
        <Button type="submit" disabled={loading || !dirty}>
          {loading ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
