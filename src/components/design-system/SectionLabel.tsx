import type { ReactNode } from 'react'

export interface SectionLabelProps {
  children: ReactNode
  /** Optional trailing action (button, link, etc.) */
  action?: ReactNode
  /** Optional HTML tag to render as — defaults to div */
  as?: 'div' | 'h2' | 'h3'
}

/**
 * Standardised section header used throughout the app.
 * Replaces all ad-hoc inline `<span style={{ ... }}>` section headings.
 * Matches the design token `.text-nav-label` utility (uppercase, tracked, muted).
 */
export function SectionLabel({ children, action, as: Tag = 'div' }: SectionLabelProps) {
  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            'var(--space-3)',
      }}
    >
      <Tag
        style={{
          fontSize:      'var(--text-label-md)',
          fontWeight:    500,
          letterSpacing: 'var(--tracking-label-pro)',
          textTransform: 'uppercase',
          color:         'var(--on-surface-muted)',
          lineHeight:    'var(--leading-snug)',
        }}
      >
        {children}
      </Tag>
      {action && (
        <div style={{ flexShrink: 0 }}>
          {action}
        </div>
      )}
    </div>
  )
}
