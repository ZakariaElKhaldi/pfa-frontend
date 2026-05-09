export type PredictionMethod = 'ml' | 'rule_based' | 'xgboost' | 'ensemble'

const CONFIG: Record<string, { cls: string; label: string }> = {
  ml:         { cls: 'badge-buy',     label: 'ML Model'   },
  rule_based: { cls: 'badge-neutral', label: 'Rule-Based' },
  xgboost:    { cls: 'badge-buy',     label: 'XGBoost'    },
  ensemble:   { cls: 'badge-sell',    label: 'Ensemble'   },
}

export function PredictionMethodBadge({ method }: { method: string }) {
  const config = CONFIG[method] ?? { cls: 'badge-neutral', label: method ?? 'Unknown' }
  return <span className={`badge ${config.cls}`}>{config.label}</span>
}
