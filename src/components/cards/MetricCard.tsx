import { Icons } from '@/components/design-system'

export interface MetricCardProps {
  label: string
  value: string
  delta: string
  positive: boolean
}

export function MetricCard({ label, value, delta, positive }: MetricCardProps) {
  return (
    <div className="metric-card">
      <span className="metric-card-label">{label}</span>
      <span className="metric-card-value">{value}</span>
      <span className={`metric-card-delta ${positive ? 'positive' : 'negative'}`}>
        {positive ? <Icons.ArrowUp size={12} /> : <Icons.ArrowDown size={12} />}
        {delta}
      </span>
    </div>
  )
}
