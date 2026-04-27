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
  const initial = source.charAt(0).toUpperCase()
  return (
    <article className="post-card" aria-label={`Post from ${sourceName} on ${source}`}>
      <div className="post-card-source" data-source={source} title={source} aria-hidden="true">
        {initial}
      </div>
      <div className="post-card-body">
        <div className="post-card-header">
          <span className="post-card-source-name">{sourceName}</span>
          <time className="post-card-time">{time}</time>
        </div>
        <p className="post-card-content">{content}</p>
        <div className="post-card-footer">
          <SentimentBadge label={label} />
          <span className="text-mono-sm text-muted">
            score: {score >= 0 ? '+' : ''}{score.toFixed(2)}
          </span>
        </div>
      </div>
    </article>
  )
}
