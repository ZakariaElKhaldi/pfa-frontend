export type WSStatus = 'connected' | 'connecting' | 'disconnected'

const CONFIG: Record<WSStatus, { color: string; label: string; pulse: boolean }> = {
  connected:    { color: 'var(--secondary)',       label: 'Live',         pulse: true  },
  connecting:   { color: 'var(--warning)',          label: 'Connecting…',  pulse: true  },
  disconnected: { color: 'var(--on-surface-muted)', label: 'Disconnected', pulse: false },
}

export function WSStatusDot({ status }: { status: WSStatus }) {
  const { color, label, pulse } = CONFIG[status]
  return (
    <div className="cluster cluster-2" style={{ alignItems: 'center' }}>
      <span
        aria-label={label}
        style={{
          display:       'inline-block',
          width:         8,
          height:        8,
          borderRadius:  '50%',
          background:    color,
          flexShrink:    0,
          animation:     pulse ? 'ws-pulse 1.8s ease-in-out infinite' : 'none',
        }}
      />
      <span className="text-label-sm text-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {label}
      </span>
    </div>
  )
}
