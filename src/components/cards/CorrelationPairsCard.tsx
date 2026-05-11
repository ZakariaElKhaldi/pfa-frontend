import { useMemo } from 'react'
import { SectionLabel } from '@/components/design-system'

export interface CorrelationPairsCardProps {
  symbols: string[]
  matrix: Array<Array<number | null>>
}

export function CorrelationPairsCard({ symbols, matrix }: CorrelationPairsCardProps) {
  const topPairs = useMemo(() => {
    if (symbols.length < 2) return null
    const pairs: { s1: string, s2: string, v: number }[] = []
    
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const v = matrix[i][j]
        if (v !== null && !Number.isNaN(v)) {
          pairs.push({ s1: symbols[i], s2: symbols[j], v })
        }
      }
    }
    
    const pos = [...pairs].filter(p => p.v > 0).sort((a, b) => b.v - a.v).slice(0, 3)
    const neg = [...pairs].filter(p => p.v < 0).sort((a, b) => a.v - b.v).slice(0, 3)
    
    return { pos, neg }
  }, [symbols, matrix])

  if (!topPairs) return null

  return (
    <div className="stack stack-4">
      <div className="card stack stack-3">
        <SectionLabel as="h3">Strongest Positive</SectionLabel>
        {topPairs.pos.length === 0 ? (
          <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>No positive correlations.</span>
        ) : (
          <div className="stack stack-2">
            {topPairs.pos.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-label-sm)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.s1} ↔ {p.s2}</span>
                <span style={{ fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--secondary)' }}>
                  +{p.v.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="card stack stack-3">
        <SectionLabel as="h3">Strongest Negative</SectionLabel>
        {topPairs.neg.length === 0 ? (
          <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>No negative correlations.</span>
        ) : (
          <div className="stack stack-2">
            {topPairs.neg.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-label-sm)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.s1} ↔ {p.s2}</span>
                <span style={{ fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--tertiary)' }}>
                  {p.v.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
