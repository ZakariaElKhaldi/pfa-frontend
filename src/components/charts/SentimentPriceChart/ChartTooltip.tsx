import { C_PRICE, C_BULL, C_BEAR, SIG_COL } from './constants'
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
        minWidth:           140,
      }}
    >
      <div style={{ color: 'var(--on-surface-muted)', marginBottom: 'var(--space-1)' }}>{tip.label}</div>
      <div style={{ color: C_PRICE }}>Price· ${tip.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      <div style={{ color: tip.sent >= 0 ? C_BULL : C_BEAR }}>Sent·· {tip.sent >= 0 ? '+' : ''}{tip.sent.toFixed(4)}</div>
      {tip.signal && <div style={{ color: SIG_COL[tip.signal], marginTop: 'var(--space-1)' }}>Signal: {tip.signal}</div>}
    </div>
  )
}
