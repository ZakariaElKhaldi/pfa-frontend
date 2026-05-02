export type IndicatorTone = 'positive' | 'negative' | 'neutral'

export interface IndicatorChipProps {
  label: string
  value: string | number
  tone?: IndicatorTone
}

const TONE_COLOR: Record<IndicatorTone, string> = {
  positive: 'var(--secondary)',
  negative: 'var(--tertiary)',
  neutral:  'var(--on-surface)',
}

export function IndicatorChip({ label, value, tone }: IndicatorChipProps) {
  return (
    <div className="indicator-chip">
      <span className="indicator-chip-label">{label}</span>
      <span
        className="indicator-chip-value"
        style={tone ? { color: TONE_COLOR[tone] } : undefined}
      >
        {value}
      </span>
    </div>
  )
}
