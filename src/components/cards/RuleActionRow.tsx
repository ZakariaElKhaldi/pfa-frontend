// Action display-only row matching the RuleAction model

import { Icons } from '@/components/design-system'
import type { LucideIcon } from 'lucide-react'

export type ActionType = 'notify' | 'email' | 'webhook' | 'log' | 'auto_trade'

export interface RuleActionRowProps {
  actionType: ActionType
  target?:    string
  onRemove?:  () => void
}

const ACTION_CONFIG: Record<ActionType, { icon: LucideIcon; label: string; color: string }> = {
  notify:     { icon: Icons.Bell,     label: 'Notify',               color: 'var(--primary)'          },
  email:      { icon: Icons.Mail,     label: 'Email',                color: 'var(--secondary)'        },
  webhook:    { icon: Icons.Link,     label: 'Webhook',              color: 'var(--warning)'          },
  log:        { icon: Icons.FileText, label: 'Log',                  color: 'var(--on-surface-muted)' },
  auto_trade: { icon: Icons.Bot,      label: 'Auto-Trade (post-MVP)', color: 'var(--tertiary)'         },
}

export function RuleActionRow({ actionType, target, onRemove }: RuleActionRowProps) {
  const { icon: Icon, label, color } = ACTION_CONFIG[actionType]

  return (
    <div
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          'var(--space-3)',
        padding:      'var(--space-2) var(--space-4)',
        background:   'var(--surface-container)',
        borderRadius: 'var(--radius-md)',
        fontSize:     'var(--text-body-sm)',
      }}
    >
      <Icon size={14} aria-hidden style={{ color, flexShrink: 0 } as React.CSSProperties} />
      <span
        style={{
          fontWeight: 600,
          color,
          fontSize:   'var(--text-label-md)',
        }}
      >
        {label}
      </span>
      {target && (
        <span
          style={{
            fontFamily:   'var(--font-mono)',
            fontSize:     'var(--text-mono-sm)',
            color:        'var(--on-surface-muted)',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
            flex:         1,
          }}
        >
          → {target}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove action"
          className="btn-icon"
          style={{
            marginLeft:     'auto',
            width:          20,
            height:         20,
            borderRadius:   'var(--radius-full)',
            background:     'transparent',
            border:         'none',
            color:          'var(--on-surface-muted)',
            cursor:         'pointer',
            transition:     'color var(--duration-fast) var(--ease-out)',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--tertiary)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--on-surface-muted)')}
        >
          <Icons.X size={12} aria-hidden />
        </button>
      )}
    </div>
  )
}
