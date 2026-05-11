import { useState, useCallback, useEffect, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { ProfileForm, type ProfileFormValues } from '@/components/forms/ProfileForm'
import { Icons } from '@/components/design-system'
import { RoleBadge, type UserRole } from '@/components/design-system/RoleBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useData } from '@/hooks/useApi'
import { useTheme } from '@/context/ThemeContext'
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

const SECTION_LABEL: CSSProperties = {
  fontSize: 'var(--text-label-md)', fontWeight: 500,
  letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
  color: 'var(--on-surface-muted)',
}

function initials(username: string | undefined, first?: string, last?: string): string {
  if (first || last) return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || (username?.[0] ?? '?').toUpperCase()
  return (username ?? '?').slice(0, 2).toUpperCase()
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
        <div className="profile-layout">
          <aside className="profile-overview" aria-label="Account overview">
            <div className="profile-identity">
              <div
                className="profile-avatar"
                aria-hidden
              >
                {initials(state.data.username, state.data.first_name, state.data.last_name)}
              </div>
              <div className="profile-identity-copy">
                <h2>
                  {state.data.first_name || state.data.last_name
                    ? `${state.data.first_name ?? ''} ${state.data.last_name ?? ''}`.trim()
                    : state.data.username}
                </h2>
                <span>
                  @{state.data.username}
                </span>
              </div>
            </div>

            <div className="profile-badge-row">
              <RoleBadge role={state.data.role} />
              <span className={`profile-status ${state.data.is_active ? 'is-active' : ''}`}>
                <span aria-hidden />
                {state.data.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="profile-meta-card">
              <span style={SECTION_LABEL}>Account</span>
              <MetaRow icon={<Icons.Mail size={15} />} label="Email" value={state.data.email} />
              <MetaRow icon={<Icons.Calendar size={15} />} label="Member since" value={new Date(state.data.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} />
              <MetaRow icon={<Icons.Hash size={15} />} label="User ID" value={`#${state.data.id}`} mono />
            </div>

            <div className="profile-capability-grid" aria-label="Access summary">
              <Capability label="Signals" active />
              <Capability label="Export" active={state.data.role === 'analyst' || state.data.role === 'admin'} />
              <Capability label="Admin" active={state.data.role === 'admin'} />
            </div>
          </aside>

          <div className="profile-settings">
            <section className="profile-section">
              <SectionHeader
                icon={<Icons.User size={18} />}
                title="Personal Details"
                description="Keep your account identity and contact details current."
              />
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
                showHeader={false}
              />
            </section>

            <PreferencesSection />
            <PasswordChangeSection />
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
    <form onSubmit={handleSubmit} className="profile-section stack stack-4">
      <SectionHeader
        icon={<Icons.Lock size={18} />}
        title="Password"
        description="Use a strong password you do not reuse elsewhere."
      />

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
        <div role="alert" className="rounded-lg px-3 py-2 text-body-sm" style={{ background: 'var(--error-container)', color: 'var(--on-error-container)' }}>
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

  const { setTheme } = useTheme()

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
      setTheme(draft.theme)
      refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="profile-section stack stack-4">
      <SectionHeader
        icon={<Icons.Settings size={18} />}
        title="Preferences"
        description="Tune notifications, default ticker, and digest frequency."
      />

      <div className="stack stack-3">
        <div className="stack stack-1">
          <Label htmlFor="pref-theme">Theme</Label>
          <Select value={draft.theme} onValueChange={(val) => { if (val) setDraft({ ...draft, theme: val as Theme }) }} disabled={busy}>
            <SelectTrigger id="pref-theme" className="w-full" style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', fontSize: 'var(--text-body-md)' }}>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
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
          <Select value={draft.digest_frequency} onValueChange={(val) => { if (val) setDraft({ ...draft, digest_frequency: val as Digest }) }} disabled={busy}>
            <SelectTrigger id="pref-digest" className="w-full" style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', fontSize: 'var(--text-body-md)' }}>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Off</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
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

function SectionHeader({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <header className="profile-section-header">
      <span className="profile-section-icon" aria-hidden>{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  )
}

function Capability({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`profile-capability ${active ? 'is-active' : ''}`}>
      <span aria-hidden>{active ? <Icons.Check size={14} /> : <Icons.Minus size={14} />}</span>
      <strong>{label}</strong>
    </div>
  )
}

function MetaRow({ icon, label, value, mono = false, valueColor }: { icon?: ReactNode; label: string; value: string; mono?: boolean; valueColor?: string }) {
  return (
    <div className="profile-meta-row">
      {icon && <span className="profile-meta-icon" aria-hidden>{icon}</span>}
      <span className="profile-meta-label">
        {label}
      </span>
      <span
        className="profile-meta-value"
        style={{
          color: valueColor ?? undefined,
          fontFamily: mono ? 'var(--font-mono)' : undefined,
          fontVariantNumeric: mono ? 'tabular-nums' : undefined,
        }}
      >
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
