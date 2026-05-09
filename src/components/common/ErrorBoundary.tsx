import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: Error | null }

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
    this.handleRetry = this.handleRetry.bind(this)
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: unknown) {
    // Log to console (could be replaced with an error reporting service)
    // Keep state minimal to avoid large serializations.
    // eslint-disable-next-line no-console
    console.error('Uncaught error in component tree:', error, info)
    this.setState({ error })
  }

  handleRetry() {
    // Simple retry strategy: reload the page so the app can rehydrate cleanly.
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-3xl mx-auto">
          <div className="card stack stack-3">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Something went wrong</h2>
            <p style={{ color: 'var(--on-surface-muted)' }}>
              An unexpected error occurred while rendering this page. You can retry or
              report the issue if it persists.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button className="btn" onClick={this.handleRetry}>Reload</button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  // Copy minimal error info to clipboard for reporting
                  const msg = this.state.error ? `${this.state.error.name}: ${this.state.error.message}` : 'Unknown error'
                  navigator.clipboard?.writeText(msg).catch(() => {})
                  alert('Error summary copied to clipboard. Paste it into a bug report.')
                }}
              >
                Copy error
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
