import { MoodBadge } from '@/components/design-system/MoodBadge'
import type { Mood } from '@/components/design-system/MoodBadge'

export interface MoodCardProps {
  symbol: string
  mood: Mood
  confidence: number
  windowStart: string
  windowEnd: string
}

type Tone = 'bullish' | 'bearish' | 'neutral'

const MOOD_TONE: Record<Mood, Tone> = {
  bullish:   'bullish',
  euphoric:  'bullish',
  bearish:   'bearish',
  panic:     'bearish',
  uncertain: 'neutral',
}

export function MoodCard({ symbol, mood, confidence, windowStart, windowEnd }: MoodCardProps) {
  const tone = MOOD_TONE[mood]
  return (
    <div className={`mood-card mood-card-${tone}`}>
      <div className="mood-card-header">
        <div className="mood-card-meta">
          <span className="mood-card-symbol">{symbol}</span>
          <span className="mood-card-window">{windowStart} – {windowEnd}</span>
        </div>
        <MoodBadge mood={mood} />
      </div>

      <div className="mood-card-confidence">
        <span className="mood-card-confidence-label">Confidence</span>
        <span className="mood-card-confidence-value">{(confidence * 100).toFixed(0)}%</span>
      </div>

      <div className="mood-card-bar" aria-hidden="true">
        <div className="mood-card-bar-fill" style={{ width: `${confidence * 100}%` }} />
      </div>
    </div>
  )
}
