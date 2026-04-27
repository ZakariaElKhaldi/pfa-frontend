export interface IndicatorChipProps {
  label: string
  value: string | number
}

export function IndicatorChip({ label, value }: IndicatorChipProps) {
  return (
    <div className="indicator-chip">
      <span className="indicator-chip-label">{label}</span>
      <span className="indicator-chip-value">{value}</span>
    </div>
  )
}
