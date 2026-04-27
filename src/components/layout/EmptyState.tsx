import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="stack stack-4"
      style={{ alignItems: 'center', textAlign: 'center', padding: 'var(--space-16) var(--space-8)' }}
    >
      {icon && (
        <div style={{ color: 'var(--on-surface-muted)', opacity: 0.5 }}>{icon}</div>
      )}
      <div className="stack stack-2">
        <p className="text-headline-sm">{title}</p>
        {description && <p className="text-body-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
