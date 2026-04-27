import { PnLBadge } from './PnLBadge'

export interface PortfolioSummaryCardProps {
  cash:        number
  totalValue:  number
  pnl:         number
  pnlPct:      number
  positionCount: number
}

interface Kpi {
  label: string
  value: string
  subValue?: React.ReactNode
}

export function PortfolioSummaryCard({ cash, totalValue, pnl, pnlPct, positionCount }: PortfolioSummaryCardProps) {
  const fmtCcy = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

  const kpis: Kpi[] = [
    {
      label:    'Total Value',
      value:    fmtCcy(totalValue),
      subValue: <PnLBadge value={pnl} pct={pnlPct} size="sm" />,
    },
    { label: 'Cash', value: fmtCcy(cash) },
    { label: 'Invested', value: fmtCcy(totalValue - cash) },
    { label: 'Positions', value: String(positionCount) },
  ]

  return (
    <article
      className="card"
      aria-label="Portfolio summary"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <span
          style={{
            fontSize:      'var(--text-label-md)',
            fontWeight:    500,
            letterSpacing: 'var(--tracking-label-pro)',
            textTransform: 'uppercase',
            color:         'var(--on-surface-muted)',
          }}
        >
          Portfolio
        </span>
      </header>

      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap:                 'var(--space-4)',
        }}
      >
        {kpis.map((k) => (
          <div key={k.label} className="stack stack-2">
            <span
              style={{
                fontSize:      'var(--text-label-sm)',
                fontWeight:    500,
                letterSpacing: 'var(--tracking-label-pro)',
                textTransform: 'uppercase',
                color:         'var(--on-surface-muted)',
              }}
            >
              {k.label}
            </span>
            <span
              style={{
                fontFamily:         'var(--font-mono)',
                fontSize:           'var(--text-mono-lg)',
                fontWeight:         700,
                color:              'var(--on-surface)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {k.value}
            </span>
            {k.subValue && k.subValue}
          </div>
        ))}
      </div>
    </article>
  )
}
