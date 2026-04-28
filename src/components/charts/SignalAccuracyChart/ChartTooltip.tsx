import { C1H, C24H } from './constants'
import type { Tip } from './types'

interface ChartTooltipProps {
  tip:    Tip
  width:  number
  height: number
}

export function ChartTooltip({ tip, width, height }: ChartTooltipProps) {
  return (
    <div
      role="tooltip"
      style={{
        position:           'absolute',
        left:               `${(tip.svgX / width) * 100}%`,
        top:                `${(tip.svgY / height) * 100}%`,
        transform:          'translate(10px,-50%)',
        background:         'var(--surface-container-high)',
        border:             '1px solid var(--outline-variant)',
        borderRadius:       'var(--radius-md)',
        padding:            'var(--space-2) var(--space-3)',
        fontSize:           'var(--text-label-sm)',
        pointerEvents:      'none',
        color:              'var(--on-surface)',
        zIndex:             10,
        whiteSpace:         'nowrap',
        fontVariantNumeric: 'tabular-nums',
        minWidth:           120,
      }}
    >
      <div style={{ color: 'var(--on-surface-muted)', marginBottom: 'var(--space-1)' }}>{tip.label}</div>
      {tip.p1h  != null && <div style={{ color: C1H  }}>1h·· {(tip.p1h  * 100).toFixed(1)}%</div>}
      {tip.p24h != null && <div style={{ color: C24H }}>24h· {(tip.p24h * 100).toFixed(1)}%</div>}
    </div>
  )
}
