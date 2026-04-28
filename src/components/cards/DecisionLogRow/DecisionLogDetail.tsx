const sectionLabel: React.CSSProperties = {
  fontSize:      'var(--text-label-sm)',
  color:         'var(--on-surface-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom:  'var(--space-2)',
}

const pre: React.CSSProperties = {
  fontFamily:    'var(--font-mono)',
  fontSize:      'var(--text-mono-sm)',
  color:         'var(--on-surface)',
  background:    'var(--surface-container-high)',
  borderRadius:  'var(--radius-md)',
  padding:       'var(--space-3) var(--space-4)',
  overflowX:     'auto',
  margin:        0,
  whiteSpace:    'pre-wrap',
  wordBreak:     'break-word',
}

interface DecisionLogDetailProps {
  id:              string | number
  alertsTriggered: string[]
  scoringDetail:   Record<string, unknown>
  engineOutput:    Record<string, unknown>
}

export function DecisionLogDetail({ id, alertsTriggered, scoringDetail, engineOutput }: DecisionLogDetailProps) {
  return (
    <div
      id={`decision-detail-${id}`}
      style={{ borderTop: '1px solid var(--outline-variant)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
    >
      {alertsTriggered.length > 0 && (
        <section aria-label="Alerts triggered">
          <p style={sectionLabel}>Alerts triggered</p>
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

      <section aria-label="Scoring detail">
        <p style={sectionLabel}>Scoring detail</p>
        <pre style={pre}>{JSON.stringify(scoringDetail, null, 2)}</pre>
      </section>

      <section aria-label="Engine output">
        <p style={sectionLabel}>Engine output</p>
        <pre style={pre}>{JSON.stringify(engineOutput, null, 2)}</pre>
      </section>
    </div>
  )
}
