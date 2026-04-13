import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { BarChart2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const { login }     = useAuth()
  const navigate      = useNavigate()

  const [form, setForm]       = useState({ email: '', username: '', password1: '', password2: '' })
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.password1 !== form.password2) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await authApi.register({
        email:     form.email,
        username:  form.username,
        password1: form.password1,
        password2: form.password2,
      })
      /* auto-login after successful registration */
      await login({ username: form.username, password: form.password1 })
      navigate('/', { replace: true })
    } catch (err) {
      const detail = err?.response?.data
      if (typeof detail === 'object') {
        const first = Object.values(detail)?.[0]
        setError(Array.isArray(first) ? first[0] : String(first))
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const passwordsMatch = form.password1 && form.password2 && form.password1 === form.password2

  return (
    <div className="min-h-screen bg-[--color-void] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[--color-action] flex items-center justify-center shadow-lg">
            <BarChart2 size={22} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-[--color-max-text]">CrowdSignal</h1>
            <p className="text-xs text-[--color-subtle] mt-0.5">Create your account</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[--color-surface-low] rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[--color-primary-text]">Sign up</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[--color-signal-sell-container] border border-[--color-signal-sell-border]">
              <AlertCircle size={14} className="text-[--color-signal-sell] shrink-0" />
              <p className="text-xs text-[--color-signal-sell]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[--color-subtle]">Email</Label>
              <Input
                autoFocus
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                required
                className="h-10 bg-[--color-surface] border-[--color-container] text-[--color-primary-text] placeholder:text-[--color-muted]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[--color-subtle]">Username</Label>
              <Input
                value={form.username}
                onChange={set('username')}
                placeholder="trader_username"
                required
                className="h-10 bg-[--color-surface] border-[--color-container] text-[--color-primary-text] placeholder:text-[--color-muted]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[--color-subtle]">Password</Label>
              <Input
                type="password"
                value={form.password1}
                onChange={set('password1')}
                placeholder="••••••••"
                required
                className="h-10 bg-[--color-surface] border-[--color-container] text-[--color-primary-text]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[--color-subtle] flex items-center gap-1">
                Confirm Password
                {passwordsMatch && <CheckCircle2 size={11} className="text-[--color-signal-buy]" />}
              </Label>
              <Input
                type="password"
                value={form.password2}
                onChange={set('password2')}
                placeholder="••••••••"
                required
                className="h-10 bg-[--color-surface] border-[--color-container] text-[--color-primary-text]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-10 bg-[--color-action] hover:bg-[--color-action-hover] text-white font-medium"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-xs text-[--color-muted]">
            Already have an account?{' '}
            <Link to="/login" className="text-[--color-action] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
