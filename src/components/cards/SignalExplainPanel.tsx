export interface ScoringEntry {
  feature: string
  score:   number
  weight?: number
}

export interface SignalExplainPanelProps {
  symbol:  string
  /** Items from /api/tickers/:symbol/signal/explain/ — scoring_detail breakdown */
  entries: ScoringEntry[]
  /** Overall engine output score */
  engineScore?: number
  /** Human-readable summary, if provided by the API */
  inputSummary?: string
}

function ScoreBar({ value }: { value: number }) {
  // value in [-1, 1] → bar width & color
  const abs   = Math.abs(value)
  const pct   = Math.min(abs * 100, 100)
  const color = value >= 0 ? 'var(--secondary)' : 'var(--tertiary)'

  return (
    <div
      style={{
        position:     'relative',
        height:        6,
        borderRadius: 'var(--radius-full)',
        background:   'var(--surface-container-high)',
        overflow:     'hidden',
      }}
    >
      <div
        style={{
          position:     'absolute',
          inset:         value >= 0 ? '0 auto 0 50%' : '0 50% 0 auto',
          width:        `${pct / 2}%`,
          background:   color,
          borderRadius: 'var(--radius-full)',
          transition:   'width 400ms var(--ease-out)',
        }}
      />
      {/* Centre tick */}
      <div
        style={{
          position:   'absolute',
          top:        0,
          bottom:     0,
          left:       '50%',
          width:      1,
          background: 'var(--outline-variant)',
          transform:  'translateX(-50%)',
        }}
      />
    </div>
  )
}

export function SignalExplainPanel({
  symbol,
  entries,
  engineScore,
  inputSummary,
}: SignalExplainPanelProps) {
  const sorted = [...entries].sort((a, b) => Math.abs(b.score) - Math.abs(a.score))

  return (
    <article
      className="card"
      aria-label={`Signal explanation for ${symbol}`}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
    >
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <span style={{ fontSize: 'var(--text-headline-sm)', fontWeight: 600, color: 'var(--on-surface)' }}>
            Signal Explanation
          </span>
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label-pro)' }}>
            {symbol}
          </span>
        </div>
        {engineScore !== undefined && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize:   'var(--text-headline-md)',
                fontWeight: 800,
                color:      engineScore >= 0 ? 'var(--secondary)' : 'var(--tertiary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {engineScore >= 0 ? '+' : ''}{engineScore.toFixed(4)}
            </span>
            <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>Engine output</span>
          </div>
        )}
      </header>

      {/* Input summary */}
      {inputSummary && (
        <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-variant)', lineHeight: 1.55 }}>
          {inputSummary}
        </p>
      )}

      {/* Feature breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {sorted.map((e) => {
          const sign = e.score >= 0 ? '+' : ''
          return (
            <div key={e.feature} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                  {e.feature}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
                  {e.weight !== undefined && (
                    <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
                      w={e.weight.toFixed(2)}
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize:   'var(--text-mono-sm)',
                      fontWeight: 700,
                      color:      e.score >= 0 ? 'var(--secondary)' : 'var(--tertiary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {sign}{e.score.toFixed(4)}
                  </span>
                </div>
              </div>
              <ScoreBar value={e.score} />
            </div>
          )
        })}
      </div>
    </article>
  )
}
