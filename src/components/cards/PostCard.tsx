import { SentimentBadge } from '@/components/design-system'
import type { SentimentLabel } from '@/design-system/tokens'

export interface PostCardProps {
  source: string
  sourceName: string
  time: string
  content: string
  label: SentimentLabel
  score: number
}

export function PostCard({ source, sourceName, time, content, label, score }: PostCardProps) {
  return (
    <div className="post-card">
      <div className="post-card-source">{source}</div>
      <div className="post-card-body">
        <div className="post-card-header">
          <span className="post-card-source-name">{sourceName}</span>
          <span className="post-card-time">{time}</span>
        </div>
        <p className="post-card-content">{content}</p>
        <div className="post-card-footer">
          <SentimentBadge label={label} />
          <span className="text-mono-sm text-muted">
            score: {score >= 0 ? '+' : ''}{score.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
