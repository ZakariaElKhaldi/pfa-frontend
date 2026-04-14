import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { BarChart2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()
  const from         = location.state?.from?.pathname ?? '/'

  const [form, setForm]       = useState({ username: '', password: '' })
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-action flex items-center justify-center shadow-lg">
            <BarChart2 size={22} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-max-text">CrowdSignal</h1>
            <p className="text-xs text-subtle mt-0.5">Social sentiment trading platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-container rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-primary-text">Sign in</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-signal-sell-container border border-signal-sell-border">
              <AlertCircle size={14} className="text-signal-sell shrink-0" />
              <p className="text-xs text-signal-sell">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-subtle">Username</Label>
              <Input
                autoFocus
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="your_username"
                required
                className="h-10 bg-surface border-container text-primary-text placeholder:text-muted"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-subtle">Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
                className="h-10 bg-surface border-container text-primary-text"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-10 bg-action hover:bg-action-hover text-white font-medium"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted mt-0">
            Don't have an account?{' '}
            <a href="/register" className="text-action hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
