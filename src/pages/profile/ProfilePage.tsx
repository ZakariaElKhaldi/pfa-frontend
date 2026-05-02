import { useState, useCallback, useEffect, type FormEvent } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { ProfileForm, type ProfileFormValues } from '@/components/forms/ProfileForm'
import { RoleBadge, type UserRole } from '@/components/design-system/RoleBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useData } from '@/hooks/useApi'
import { api } from '@/lib/api'

type Theme  = 'light' | 'dark' | 'system'
type Digest = 'off'   | 'daily' | 'weekly'

interface UserPreference {
  theme: Theme
  default_ticker: string
  alert_email: boolean
  alert_push:  boolean
  digest_frequency: Digest
  updated_at: string
}

interface UserData {
  id: number; email: string; username: string; role: UserRole
  is_active: boolean; date_joined: string
  first_name?: string; last_name?: string
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 'var(--text-label-md)', fontWeight: 500,
  letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
  color: 'var(--on-surface-muted)',
}

function initials(username: string, first?: string, last?: string): string {
  if (first || last) return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || username[0].toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

export function ProfilePage() {
  const { state, refetch } = useData<UserData>('/api/auth/user/')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | undefined>()

  const handleSubmit = useCallback(async (values: ProfileFormValues) => {
    setSaving(true)
    setError(undefined)
    try {
      await api.patch('/api/auth/user/', {
        username:   values.username,
        email:      values.email,
        first_name: values.firstName ?? '',
        last_name:  values.lastName  ?? '',
      })
      toast.success('Profile updated')
      refetch()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Update failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }, [refetch])

  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Profile" subtitle="Account settings and personal information." />

      {state.status === 'error' && <ErrorState message={state.message} onRetry={refetch} />}
      {(state.status === 'loading' || state.status === 'idle') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 2fr)', gap: 'var(--space-6)' }}>
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      )}
      {state.status === 'success' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 2fr)', gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Account meta sidebar */}
          <aside className="card stack stack-5">
            <div className="stack stack-3" style={{ alignItems: 'center', textAlign: 'center' }}>
              <div
                aria-hidden
                style={{
                  width: 88, height: 88, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'color-mix(in srgb, var(--primary) 18%, transparent)',
                  color: 'var(--primary)',
                  fontSize: 'var(--text-headline-md)', fontWeight: 600,
                  letterSpacing: 'var(--tracking-label-pro)',
                }}
              >
                {initials(state.data.username, state.data.first_name, state.data.last_name)}
              </div>
              <div className="stack stack-1" style={{ alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-headline-sm)', fontWeight: 600 }}>
                  {state.data.first_name || state.data.last_name
                    ? `${state.data.first_name ?? ''} ${state.data.last_name ?? ''}`.trim()
                    : state.data.username}
                </span>
                <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
                  @{state.data.username}
                </span>
              </div>
              <RoleBadge role={state.data.role} />
            </div>

            <div style={{ height: 1, background: 'var(--outline-variant)' }} />

            <div className="stack stack-3">
              <span style={SECTION_LABEL}>Account</span>
              <MetaRow label="Email"        value={state.data.email} />
              <MetaRow label="Member since" value={new Date(state.data.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} />
              <MetaRow label="Status"       value={state.data.is_active ? 'Active' : 'Inactive'} valueColor={state.data.is_active ? 'var(--secondary)' : 'var(--on-surface-muted)'} />
              <MetaRow label="User ID"      value={`#${state.data.id}`} mono />
            </div>
          </aside>

          {/* Form column */}
          <div className="stack stack-5">
            <div className="card">
              <ProfileForm
                initial={{
                  username:  state.data.username,
                  email:     state.data.email,
                  firstName: state.data.first_name ?? '',
                  lastName:  state.data.last_name  ?? '',
                }}
                onSubmit={handleSubmit}
                loading={saving}
                error={error}
              />
            </div>

            <PasswordChangeSection />
            <PreferencesSection />
          </div>
        </div>
      )}
    </div>
  )
}

function PasswordChangeSection() {
  const [oldPw, setOldPw]   = useState('')
  const [new1, setNew1]     = useState('')
  const [new2, setNew2]     = useState('')
  const [busy, setBusy]     = useState(false)
  const [err, setErr]       = useState<string | undefined>()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErr(undefined)
    if (new1 !== new2) {
      setErr('Passwords do not match.')
      return
    }
    if (new1.length < 8) {
      setErr('Password must be at least 8 characters.')
      return
    }
    setBusy(true)
    try {
      await api.post('/api/auth/password/change/', {
        old_password:  oldPw,
        new_password1: new1,
        new_password2: new2,
      })
      toast.success('Password changed')
      setOldPw(''); setNew1(''); setNew2('')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Password change failed'
      setErr(msg)
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card stack stack-4">
      <div className="stack stack-1">
        <h2 className="text-headline-sm font-semibold" style={{ color: 'var(--on-surface)' }}>Password</h2>
        <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>Change your account password.</p>
      </div>

      <div className="stack stack-3">
        <div className="stack stack-1">
          <Label htmlFor="pw-old">Current password</Label>
          <Input id="pw-old" type="password" autoComplete="current-password" value={oldPw} onChange={e => setOldPw(e.target.value)} disabled={busy} required />
        </div>
        <div className="stack stack-1">
          <Label htmlFor="pw-new1">New password</Label>
          <Input id="pw-new1" type="password" autoComplete="new-password" minLength={8} value={new1} onChange={e => setNew1(e.target.value)} disabled={busy} required />
        </div>
        <div className="stack stack-1">
          <Label htmlFor="pw-new2">Confirm new password</Label>
          <Input id="pw-new2" type="password" autoComplete="new-password" minLength={8} value={new2} onChange={e => setNew2(e.target.value)} disabled={busy} required />
        </div>
      </div>

      {err && (
        <div role="alert" className="rounded-lg px-3 py-2 text-body-sm" style={{ background: 'var(--tertiary-container)', color: 'var(--tertiary)' }}>
          {err}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={busy || !oldPw || !new1 || !new2}>
          {busy ? 'Changing…' : 'Change password'}
        </Button>
      </div>
    </form>
  )
}

function PreferencesSection() {
  const { state, refetch } = useData<UserPreference>('/api/auth/preferences/')
  const [draft, setDraft]  = useState<UserPreference | null>(null)
  const [busy, setBusy]    = useState(false)

  useEffect(() => {
    if (state.status === 'success') setDraft(state.data)
  }, [state])

  if (state.status === 'idle' || state.status === 'loading') {
    return <Skeleton className="h-72 w-full" />
  }
  if (state.status === 'error') {
    return <ErrorState message={state.message} onRetry={refetch} />
  }
  if (!draft) return null

  const dirty = JSON.stringify(draft) !== JSON.stringify(state.data)

  async function handleSave() {
    if (!draft) return
    setBusy(true)
    try {
      await api.patch('/api/auth/preferences/', draft)
      toast.success('Preferences saved')
      refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card stack stack-4">
      <div className="stack stack-1">
        <h2 className="text-headline-sm font-semibold" style={{ color: 'var(--on-surface)' }}>Preferences</h2>
        <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>Notifications, default ticker, and digest frequency.</p>
      </div>

      <div className="stack stack-3">
        <div className="stack stack-1">
          <Label htmlFor="pref-theme">Theme</Label>
          <select
            id="pref-theme"
            value={draft.theme}
            onChange={e => setDraft({ ...draft, theme: e.target.value as Theme })}
            disabled={busy}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--outline-variant)',
              background: 'var(--surface-container-lowest)',
              color: 'var(--on-surface)',
              fontSize: 'var(--text-body-md)',
            }}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="stack stack-1">
          <Label htmlFor="pref-ticker">Default ticker</Label>
          <Input
            id="pref-ticker"
            placeholder="e.g. AAPL"
            value={draft.default_ticker}
            onChange={e => setDraft({ ...draft, default_ticker: e.target.value.toUpperCase() })}
            disabled={busy}
          />
        </div>

        <div className="cluster cluster-3" style={{ justifyContent: 'space-between' }}>
          <div className="stack stack-1">
            <span style={{ fontSize: 'var(--text-body-md)', fontWeight: 500 }}>Email alerts</span>
            <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
              Receive critical signal alerts by email.
            </span>
          </div>
          <Switch checked={draft.alert_email} onCheckedChange={v => setDraft({ ...draft, alert_email: v })} disabled={busy} />
        </div>

        <div className="cluster cluster-3" style={{ justifyContent: 'space-between' }}>
          <div className="stack stack-1">
            <span style={{ fontSize: 'var(--text-body-md)', fontWeight: 500 }}>Push notifications</span>
            <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
              In-app toast for new BUY/SELL signals.
            </span>
          </div>
          <Switch checked={draft.alert_push} onCheckedChange={v => setDraft({ ...draft, alert_push: v })} disabled={busy} />
        </div>

        <div className="stack stack-1">
          <Label htmlFor="pref-digest">Digest frequency</Label>
          <select
            id="pref-digest"
            value={draft.digest_frequency}
            onChange={e => setDraft({ ...draft, digest_frequency: e.target.value as Digest })}
            disabled={busy}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--outline-variant)',
              background: 'var(--surface-container-lowest)',
              color: 'var(--on-surface)',
              fontSize: 'var(--text-body-md)',
            }}
          >
            <option value="off">Off</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={busy || !dirty} onClick={() => state.status === 'success' && setDraft(state.data)}>
          Reset
        </Button>
        <Button type="button" disabled={busy || !dirty} onClick={handleSave}>
          {busy ? 'Saving…' : 'Save preferences'}
        </Button>
      </div>
    </div>
  )
}

function MetaRow({ label, value, mono = false, valueColor }: { label: string; value: string; mono?: boolean; valueColor?: string }) {
  return (
    <div className="cluster cluster-3" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label-pro)' }}>
        {label}
      </span>
      <span style={{
        fontSize: 'var(--text-body-sm)',
        color: valueColor ?? 'var(--on-surface)',
        fontFamily: mono ? 'var(--font-mono)' : undefined,
        fontVariantNumeric: mono ? 'tabular-nums' : undefined,
        textAlign: 'right',
      }}>
        {value}
      </span>
    </div>
  )
}

export function ProfilePagePreview({
  loading = false,
  error,
}: {
  loading?: boolean
  error?: string
}) {
  return (
    <div className="p-6 stack stack-5" style={{ maxWidth: 560 }}>
      <PageHeader title="Profile" subtitle="Account settings and preferences." />
      <div className="card">
        <ProfileForm
          initial={{ username: 'zakaria', email: 'zakaria@example.com', firstName: 'Zakaria', lastName: '' }}
          onSubmit={() => {}}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}
