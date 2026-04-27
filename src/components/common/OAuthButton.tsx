export type OAuthProvider = 'google'

interface OAuthButtonProps {
  provider: OAuthProvider
  onClick?: () => void
  loading?: boolean
}

const GOOGLE_LOGO = (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3L37.1 9.7C33.9 6.8 29.2 5 24 5 12.4 5 3 14.4 3 26s9.4 21 21 21 21-9.4 21-21c0-1.3-.1-2.7-.4-3.9z" />
    <path fill="#FF3D00" d="m6.3 15.5 6.6 4.8C14.7 16.4 19 13 24 13c3.1 0 5.8 1.1 7.9 3l6.1-6.3C34.6 6.9 29.6 5 24 5 16.3 5 9.7 9.4 6.3 15.5z" />
    <path fill="#4CAF50" d="M24 47c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 38.5 26.8 39.5 24 39.5c-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C9.7 43 16.3 47 24 47z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.4-2.4 4.5-4.5 5.9.1 0 .1.1.1.1l6.2 5.2c-.4.4 6.9-5 6.9-15.2 0-1.3-.1-2.7-.4-3.9z" />
  </svg>
)

const PROVIDER_CONFIG: Record<OAuthProvider, { logo: React.ReactNode; label: string }> = {
  google: { logo: GOOGLE_LOGO, label: 'Continue with Google' },
}

export function OAuthButton({ provider, onClick, loading }: OAuthButtonProps) {
  const { logo, label } = PROVIDER_CONFIG[provider]
  return (
    <button
      onClick={onClick}
      disabled={loading}
      aria-label={label}
      className="oauth-button"
    >
      <span className="oauth-button-logo" aria-hidden="true">
        {loading ? <span className="spinner spinner-sm" /> : logo}
      </span>
      <span className="oauth-button-label">{loading ? 'Connecting…' : label}</span>
    </button>
  )
}
