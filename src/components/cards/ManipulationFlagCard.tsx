import { Icons } from '@/components/design-system'

export type PatternType = 'pump_dump' | 'bot_swarm' | 'coordinated_spam'

export interface ManipulationFlagCardProps {
  symbol:          string
  patternType:     PatternType
  confidence:      number
  detectedAt:      string
  reviewed?:       boolean
  /** Wires to PATCH /api/intelligence/flags/<pk>/review/ — omit to hide button */
  onMarkReviewed?: () => void
}

const LABEL: Record<PatternType, string> = {
  pump_dump:        'Pump & Dump',
  bot_swarm:        'Bot Swarm',
  coordinated_spam: 'Coordinated Spam',
}

export function ManipulationFlagCard({
  symbol,
  patternType,
  confidence,
  detectedAt,
  reviewed,
  onMarkReviewed,
}: ManipulationFlagCardProps) {
  const severity = reviewed ? 'resolved' : 'danger'
  return (
    <div className={`alert-card alert-card-${severity}`}>
      <div className="alert-card-icon extreme">
        <Icons.Flame size={18} />
      </div>

      <div className="alert-card-body">
        <div className="alert-card-title">
          <span className="badge badge-sell">{LABEL[patternType]}</span>
          <span className="tag tag-primary">{symbol}</span>
          {reviewed && <span className="badge badge-neutral">Reviewed</span>}
        </div>
        <div className="alert-card-meta">
          <span className="alert-card-stat">Confidence: <strong>{(confidence * 100).toFixed(0)}%</strong></span>
          <span className="alert-card-stat">Detected: {detectedAt}</span>
        </div>
      </div>

      {!reviewed && onMarkReviewed && (
        <button
          className="btn btn-sm btn-outline-alert alert-card-action"
          onClick={onMarkReviewed}
          aria-label="Mark as reviewed"
        >
          <Icons.Check size={14} aria-hidden />
          Review
        </button>
      )}
    </div>
  )
}
