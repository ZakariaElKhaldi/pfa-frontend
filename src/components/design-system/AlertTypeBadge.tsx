export type AlertType = 'divergence' | 'extreme_sentiment' | 'hype_fade' | 'pump_suspected'

const CONFIG: Record<AlertType, { cls: string; label: string }> = {
  divergence:        { cls: 'badge-hold',    label: 'Divergence'        },
  extreme_sentiment: { cls: 'badge-sell',    label: 'Extreme Sentiment' },
  hype_fade:         { cls: 'badge-neutral', label: 'Hype Fade'         },
  pump_suspected:    { cls: 'badge-sell',    label: 'Pump Suspected'    },
}

export function AlertTypeBadge({ type }: { type: AlertType }) {
  const { cls, label } = CONFIG[type]
  return <span className={`badge ${cls}`}>{label}</span>
}
