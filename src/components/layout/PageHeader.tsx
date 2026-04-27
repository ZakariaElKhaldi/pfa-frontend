import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="cluster cluster-4" style={{ justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
      <div className="stack stack-1">
        <h1 className="text-headline-lg">{title}</h1>
        {subtitle && <p className="text-body-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="cluster cluster-3">{actions}</div>}
    </div>
  )
}
