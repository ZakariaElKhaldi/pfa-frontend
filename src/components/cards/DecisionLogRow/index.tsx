import { useState } from 'react'
import { DecisionLogHeader } from './DecisionLogHeader'
import { DecisionLogDetail } from './DecisionLogDetail'

export interface DecisionLogRowProps {
  id:              string | number
  ticker:          string
  timestamp:       string
  inputSummary:    string
  scoringDetail:   Record<string, unknown>
  engineOutput:    Record<string, unknown>
  alertsTriggered: string[]
}

export function DecisionLogRow({ id, ticker, timestamp, inputSummary, scoringDetail, engineOutput, alertsTriggered }: DecisionLogRowProps) {
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
      <DecisionLogHeader
        id={id}
        ticker={ticker}
        timestamp={timestamp}
        inputSummary={inputSummary}
        alertCount={alertsTriggered.length}
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open && (
        <DecisionLogDetail
          id={id}
          alertsTriggered={alertsTriggered}
          scoringDetail={scoringDetail}
          engineOutput={engineOutput}
        />
      )}
    </div>
  )
}
