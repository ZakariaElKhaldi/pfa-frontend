import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const SENTIMENT_COLORS = {
  bullish: 'text-[--color-signal-buy] bg-[--color-signal-buy-container]',
  bearish: 'text-[--color-signal-sell] bg-[--color-signal-sell-container]',
  neutral: 'text-[--color-subtle] bg-[--color-container]',
}

const SOURCE_LABELS = { reddit: 'Reddit', stocktwits: 'StockTwits' }

export default function PostCard({ post }) {
  const { title, content, sentiment_label, source, posted_at, url } = post
  const text = title || content

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg bg-[--color-container] hover:bg-[--color-container] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-[--color-muted] uppercase tracking-wider">
          {SOURCE_LABELS[source] ?? source}
        </span>
        <span className={cn(
          'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase',
          SENTIMENT_COLORS[sentiment_label] ?? SENTIMENT_COLORS.neutral
        )}>
          {sentiment_label}
        </span>
      </div>

      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[--color-primary-text] leading-relaxed hover:text-[--color-action] transition-colors line-clamp-3"
        >
          {text}
        </a>
      ) : (
        <p className="text-xs text-[--color-primary-text] leading-relaxed line-clamp-3">{text}</p>
      )}

      <span className="text-[10px] text-[--color-muted] text-right">
        {posted_at ? formatDistanceToNow(new Date(posted_at), { addSuffix: true }) : '—'}
      </span>
    </div>
  )
}
