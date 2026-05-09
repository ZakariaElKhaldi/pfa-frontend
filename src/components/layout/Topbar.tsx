import type { ReactNode } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { WSStatusDot } from '@/components/common/WSStatusDot'
import type { WSStatus } from '@/components/common/WSStatusDot'

export interface BreadcrumbItem {
  label: string
  /** If provided, renders as a link */
  href?: string
}

export interface TopbarProps {
  breadcrumb?: BreadcrumbItem[]
  wsStatus?: WSStatus
  /** Slot for a search or command palette trigger */
  searchSlot?: ReactNode
  /** Storybook/test: hide the SidebarTrigger */
  hideSidebarTrigger?: boolean
}

/**
 * Sticky topbar rendered inside SidebarInset.
 * Extracted from AppShell for independent composition and Storybook testing.
 *
 * Layout: [SidebarTrigger] [Breadcrumb] ─── [searchSlot] [WSStatusDot] [ThemeToggle]
 */
export function Topbar({ breadcrumb, wsStatus, searchSlot, hideSidebarTrigger }: TopbarProps) {
  return (
    <header
      style={{
        position:        'sticky',
        top:             0,
        zIndex:          'var(--z-raised)',
        display:         'flex',
        alignItems:      'center',
        gap:             'var(--space-3)',
        height:          'var(--topbar-height)',
        padding:         '0 var(--space-4)',
        background:      'rgba(255, 255, 255, 0.72)',
        borderBottom:    '1px solid rgba(203, 213, 225, 0.50)',
        backdropFilter:  'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {!hideSidebarTrigger && <SidebarTrigger />}

      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}
        >
          {breadcrumb.map((item, i) => (
            <span
              key={i}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}
            >
              {i > 0 && (
                <span
                  aria-hidden
                  style={{
                    color:      'var(--on-surface-muted)',
                    fontSize:   'var(--text-label-md)',
                    flexShrink: 0,
                  }}
                >
                  /
                </span>
              )}
              {item.href ? (
                <a
                  href={item.href}
                  style={{
                    fontSize:     'var(--text-title-md)',
                    fontWeight:   i === breadcrumb.length - 1 ? 600 : 400,
                    color:        i === breadcrumb.length - 1
                      ? 'var(--on-surface)'
                      : 'var(--on-surface-muted)',
                    whiteSpace:   'nowrap',
                    overflow:     'hidden',
                    textOverflow: 'ellipsis',
                    transition:   'color var(--duration-fast) var(--ease-out)',
                  }}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={i === breadcrumb.length - 1 ? 'page' : undefined}
                  style={{
                    fontSize:     'var(--text-title-md)',
                    fontWeight:   i === breadcrumb.length - 1 ? 600 : 400,
                    color:        i === breadcrumb.length - 1
                      ? 'var(--on-surface)'
                      : 'var(--on-surface-muted)',
                    whiteSpace:   'nowrap',
                    overflow:     'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Right-aligned cluster */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {searchSlot}
        {wsStatus && <WSStatusDot status={wsStatus} />}
      </div>
    </header>
  )
}
