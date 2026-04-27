import { Icons } from '@/components/design-system'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state-icon">
        <Icons.AlertTriangle size={20} />
      </div>
      <div className="error-state-body">
        <p className="error-state-title">{title}</p>
        <p className="error-state-message">{message}</p>
        {onRetry && (
          <button className="btn btn-sm btn-secondary error-state-retry" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
