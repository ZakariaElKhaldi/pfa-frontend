import { SectionLabel } from '@/components/design-system'

export interface CorrelationMatrixProps {
  symbols: string[]
  matrix: number[][]
}

function corrColor(v: number): string {
  if (Number.isNaN(v)) return 'var(--surface-container)'
  const clamped = Math.max(-1, Math.min(1, v))
  if (clamped >= 0) {
    const alpha = clamped * 0.85
    return `color-mix(in srgb, var(--secondary) ${alpha * 100}%, transparent)`
  }
  const alpha = -clamped * 0.85
  return `color-mix(in srgb, var(--tertiary) ${alpha * 100}%, transparent)`
}

function Legend() {
  return (
    <div className="cluster cluster-2" style={{ alignItems: 'center', fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
      <span>−1</span>
      <div style={{ width: 80, height: 10, borderRadius: 'var(--radius-full)', background: 'linear-gradient(to right, var(--tertiary), var(--surface-container), var(--secondary))' }} />
      <span>+1</span>
    </div>
  )
}

export function CorrelationMatrix({ symbols, matrix }: CorrelationMatrixProps) {
  return (
    <div className="card stack stack-4" style={{ overflowX: 'auto' }}>
      <div className="cluster cluster-3" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <SectionLabel as="h2">Pearson Correlation Matrix</SectionLabel>
        <Legend />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: 'var(--space-2) 0' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 6, fontSize: 'var(--text-body-sm)' }}>
          <thead>
            <tr>
              <th />
              {symbols.map(s => (
                <th key={s} style={{ padding: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--on-surface-muted)', textAlign: 'center' }}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={symbols[i]}>
                <th style={{ padding: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--on-surface-muted)', textAlign: 'right' }}>
                  {symbols[i]}
                </th>
                {row.map((v, j) => (
                  <td
                    key={j}
                    title={`${symbols[i]} ↔ ${symbols[j]}: ${Number.isNaN(v) ? 'N/A' : v.toFixed(3)}`}
                    style={{
                      width: 64, height: 48,
                      background: corrColor(v),
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontVariantNumeric: 'tabular-nums',
                      color: Math.abs(v) > 0.5 && !Number.isNaN(v) ? 'var(--on-surface)' : 'var(--on-surface-muted)',
                      fontWeight: i === j ? 600 : 400,
                      cursor: 'default',
                    }}
                  >
                    {Number.isNaN(v) ? '—' : v.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
