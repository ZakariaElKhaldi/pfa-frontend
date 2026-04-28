import { useState } from 'react'
import { Icons } from '@/components/design-system'

export interface DecisionLogRowProps {
  id:             string | number
  ticker:         string
  timestamp:      string
  inputSummary:   string
  scoringDetail:  Record<string, unknown>
  engineOutput:   Record<string, unknown>
  alertsTriggered: string[]
}

export function DecisionLogRow({
  id,
  ticker,
  timestamp,
  inputSummary,
  scoringDetail,
  engineOutput,
  alertsTriggered,
}: DecisionLogRowProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        background:   'var(--surface-container)',
        borderRadius: 'var(--radius-lg)',
        overflow:     'hidden',
        outline:      open ? '1px solid var(--outline-variant)' : '1px solid transparent',
        transition:   'outline-color var(--duration-fast) var(--ease-out)',
      }}
    >
      {/* Header row — always visible */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`decision-detail-${id}`}
        onClick={() => setOpen((v) => !v)}
        style={{
          width:        '100%',
          display:      'flex',
          alignItems:   'center',
          gap:          'var(--space-4)',
          padding:      'var(--space-3) var(--space-4)',
          background:   'transparent',
          border:       'none',
          cursor:       'pointer',
          textAlign:    'left',
        }}
      >
        {/* Ticker chip */}
        <span
          style={{
            fontFamily:  'var(--font-mono)',
            fontWeight:  700,
            fontSize:    'var(--text-mono-sm)',
            color:       'var(--on-surface)',
            padding:     '2px 8px',
            background:  'var(--surface-container-high)',
            borderRadius: 'var(--radius-sm)',
            flexShrink:  0,
          }}
        >
          {ticker}
        </span>

        {/* Timestamp */}
        <time
          style={{
            fontSize:           'var(--text-label-sm)',
            color:              'var(--on-surface-muted)',
            fontVariantNumeric: 'tabular-nums',
            flexShrink:         0,
          }}
        >
          {timestamp}
        </time>

        {/* Input summary (truncated) */}
        <span
          style={{
            flex:         1,
            fontSize:     'var(--text-body-sm)',
            color:        'var(--on-surface-variant)',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}
        >
          {inputSummary}
        </span>

        {/* Alert count badge */}
        {alertsTriggered.length > 0 && (
          <span
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          4,
              padding:      '2px 8px',
              borderRadius: 'var(--radius-full)',
              background:   'var(--tertiary-container)',
              color:        'var(--tertiary)',
              fontSize:     'var(--text-label-sm)',
              fontWeight:   600,
              flexShrink:   0,
            }}
          >
            <Icons.AlertTriangle size={11} aria-hidden />
            {alertsTriggered.length}
          </span>
        )}

        {/* Expand icon */}
        <Icons.ChevronDown
          size={16}
          aria-hidden
          style={{
            color:      'var(--on-surface-muted)',
            flexShrink: 0,
            transform:  open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--duration-fast) var(--ease-out)',
          } as React.CSSProperties}
        />
      </button>

      {/* Expanded detail */}
      {open && (
        <div
          id={`decision-detail-${id}`}
          style={{
            borderTop: '1px solid var(--outline-variant)',
            padding:   'var(--space-4)',
            display:   'flex',
            flexDirection: 'column',
            gap:       'var(--space-4)',
          }}
        >
          {/* Alerts triggered */}
          {alertsTriggered.length > 0 && (
            <section aria-label="Alerts triggered">
              <p style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
                Alerts triggered
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {alertsTriggered.map((a, i) => (
                  <span
                    key={i}
                    style={{
                      padding:      '2px 10px',
                      borderRadius: 'var(--radius-full)',
                      background:   'var(--tertiary-container)',
                      color:        'var(--tertiary)',
                      fontSize:     'var(--text-label-sm)',
                      fontWeight:   500,
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Scoring detail */}
          <section aria-label="Scoring detail">
            <p style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
              Scoring detail
            </p>
            <pre
              style={{
                fontFamily:   'var(--font-mono)',
                fontSize:     'var(--text-mono-sm)',
                color:        'var(--on-surface)',
                background:   'var(--surface-container-high)',
                borderRadius: 'var(--radius-md)',
                padding:      'var(--space-3) var(--space-4)',
                overflowX:    'auto',
                margin:       0,
                whiteSpace:   'pre-wrap',
                wordBreak:    'break-word',
              }}
            >
              {JSON.stringify(scoringDetail, null, 2)}
            </pre>
          </section>

          {/* Engine output */}
          <section aria-label="Engine output">
            <p style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
              Engine output
            </p>
            <pre
              style={{
                fontFamily:   'var(--font-mono)',
                fontSize:     'var(--text-mono-sm)',
                color:        'var(--on-surface)',
                background:   'var(--surface-container-high)',
                borderRadius: 'var(--radius-md)',
                padding:      'var(--space-3) var(--space-4)',
                overflowX:    'auto',
                margin:       0,
                whiteSpace:   'pre-wrap',
                wordBreak:    'break-word',
              }}
            >
              {JSON.stringify(engineOutput, null, 2)}
            </pre>
          </section>
        </div>
      )}
    </div>
  )
}
