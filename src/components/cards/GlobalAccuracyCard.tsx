import { AccuracyRing } from '@/components/design-system'

/** Maps exactly to GET /api/signals/accuracy/global/ */
export interface GlobalAccuracyCardProps {
  overallPct:     number | null
  bySignal:       Partial<Record<'BUY' | 'SELL' | 'HOLD', number>>
  totalEvaluated: number
}

const SIGNAL_COLOR: Record<'BUY' | 'SELL' | 'HOLD', string> = {
  BUY:  'var(--secondary)',
  SELL: 'var(--tertiary)',
  HOLD: 'var(--on-surface-muted)',
}

export function GlobalAccuracyCard({ overallPct, bySignal, totalEvaluated }: GlobalAccuracyCardProps) {
  const noData = overallPct === null || totalEvaluated === 0

  return (
    <div
      style={{
        background:   'var(--surface-container)',
        borderRadius: 'var(--radius-xl)',
        padding:      'var(--space-6)',
        display:      'flex',
        flexDirection: 'column',
        gap:          'var(--space-5)',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h3
          style={{
            fontSize:   'var(--text-label-lg)',
            fontWeight: 600,
            color:      'var(--on-surface)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-label-pro)',
          }}
        >
          Global Accuracy
        </h3>
        <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>
          {totalEvaluated.toLocaleString()} evaluated
        </span>
      </header>

      {noData ? (
        <div
          style={{
            padding:   'var(--space-8)',
            textAlign: 'center',
            color:     'var(--on-surface-muted)',
            fontSize:  'var(--text-body-sm)',
          }}
        >
          No accuracy data yet
        </div>
      ) : (
        <>
          {/* Overall ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
            <AccuracyRing pct={overallPct!} size={88} color="var(--primary)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span
                style={{
                  fontSize:   'var(--text-mono-xl)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color:      'var(--primary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {overallPct!.toFixed(1)}%
              </span>
              <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
                24-hour window
              </span>
            </div>
          </div>

          {/* Per-signal breakdown */}
          {Object.keys(bySignal).length > 0 && (
            <div
              style={{
                display:       'flex',
                flexDirection: 'column',
                gap:           'var(--space-2)',
                borderTop:     '1px solid var(--outline-variant)',
                paddingTop:    'var(--space-4)',
              }}
            >
              {(['BUY', 'SELL', 'HOLD'] as const).map((sig) => {
                const pct = bySignal[sig]
                if (pct === undefined) return null
                const color = SIGNAL_COLOR[sig]
                return (
                  <div
                    key={sig}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}
                  >
                    <span
                      style={{
                        width:       40,
                        fontSize:    'var(--text-label-sm)',
                        fontFamily:  'var(--font-mono)',
                        fontWeight:  700,
                        color,
                        flexShrink:  0,
                      }}
                    >
                      {sig}
                    </span>
                    <div
                      style={{
                        flex:         1,
                        height:       6,
                        background:   'var(--surface-container-high)',
                        borderRadius: 'var(--radius-full)',
                        overflow:     'hidden',
                      }}
                    >
                      <div
                        style={{
                          width:        `${pct}%`,
                          height:       '100%',
                          background:   color,
                          borderRadius: 'var(--radius-full)',
                          transition:   'width 0.6s var(--ease-out)',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        width:              40,
                        textAlign:          'right',
                        fontSize:           'var(--text-mono-sm)',
                        fontFamily:         'var(--font-mono)',
                        fontWeight:         600,
                        color:              'var(--on-surface)',
                        fontVariantNumeric: 'tabular-nums',
                        flexShrink:         0,
                      }}
                    >
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
