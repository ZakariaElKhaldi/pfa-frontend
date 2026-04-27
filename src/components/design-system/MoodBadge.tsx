export type Mood = 'bullish' | 'bearish' | 'uncertain' | 'euphoric' | 'panic'

const CONFIG: Record<Mood, { cls: string; label: string }> = {
  bullish:   { cls: 'badge-bullish', label: 'Bullish'   },
  bearish:   { cls: 'badge-bearish', label: 'Bearish'   },
  uncertain: { cls: 'badge-neutral', label: 'Uncertain' },
  euphoric:  { cls: 'badge-buy',     label: 'Euphoric'  },
  panic:     { cls: 'badge-sell',    label: 'Panic'     },
}

export function MoodBadge({ mood }: { mood: Mood }) {
  const { cls, label } = CONFIG[mood]
  return <span className={`badge ${cls}`}>{label}</span>
}
