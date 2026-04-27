export type PredictionMethod = 'ml' | 'rule'

const CONFIG: Record<PredictionMethod, { cls: string; label: string }> = {
  ml:   { cls: 'badge-buy',     label: 'ML Model'   },
  rule: { cls: 'badge-neutral', label: 'Rule-Based' },
}

export function PredictionMethodBadge({ method }: { method: PredictionMethod }) {
  const { cls, label } = CONFIG[method]
  return <span className={`badge ${cls}`}>{label}</span>
}
