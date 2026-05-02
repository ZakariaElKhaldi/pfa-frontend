import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { PostCard } from '@/components/cards/PostCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useData } from '@/hooks/useApi'
import type { SentimentLabel } from '@/design-system/tokens'

interface FeedPost {
  id:               number
  ticker:           number
  source:           'reddit' | 'stocktwits'
  external_id:      string
  title:            string | null
  url:              string | null
  content:          string
  sentiment_score:  number | null
  sentiment_label:  SentimentLabel | ''
  posted_at:        string
}

const SOURCES: { value: 'all' | 'reddit' | 'stocktwits'; label: string }[] = [
  { value: 'all',         label: 'All sources' },
  { value: 'reddit',      label: 'Reddit' },
  { value: 'stocktwits',  label: 'StockTwits' },
]
const SENTIMENTS: { value: 'all' | SentimentLabel; label: string }[] = [
  { value: 'all',     label: 'All sentiment' },
  { value: 'bullish', label: 'Bullish' },
  { value: 'bearish', label: 'Bearish' },
  { value: 'neutral', label: 'Neutral' },
]

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 'var(--text-label-md)', fontWeight: 500,
  letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase',
  color: 'var(--on-surface-muted)',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)  return 'just now'
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function SocialFeedPage() {
  const navigate = useNavigate()
  const [tickerFilter, setTickerFilter] = useState('')
  const [source, setSource]             = useState<'all' | 'reddit' | 'stocktwits'>('all')
  const [sentiment, setSentiment]       = useState<'all' | SentimentLabel>('all')
  const [search, setSearch]             = useState('')

  const path = tickerFilter.trim()
    ? `/api/social/feed/?symbol=${encodeURIComponent(tickerFilter.trim().toUpperCase())}`
    : '/api/social/feed/'
  const { state, refetch } = useData<FeedPost[]>(path, [tickerFilter])

  const filtered = useMemo(() => {
    if (state.status !== 'success') return [] as FeedPost[]
    const q = search.trim().toLowerCase()
    return state.data.filter(p => {
      if (source !== 'all'    && p.source         !== source)    return false
      if (sentiment !== 'all' && p.sentiment_label !== sentiment) return false
      if (q && !p.content.toLowerCase().includes(q) && !(p.title ?? '').toLowerCase().includes(q)) return false
      return true
    })
  }, [state, source, sentiment, search])

  // Resolve ticker_symbol from posts — backend returns ticker as PK only, so fetch tickers index
  const { state: tickers } = useData<Array<{ id: number; symbol: string }>>('/api/tickers/')
  const symbolByTickerId = useMemo(() => {
    if (tickers.status !== 'success') return new Map<number, string>()
    return new Map(tickers.data.map(t => [t.id, t.symbol]))
  }, [tickers])

  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Social Feed" subtitle="Cross-ticker stream from Reddit and StockTwits, sentiment-scored." />

      {/* Filters */}
      <div className="card cluster cluster-3" style={{ alignItems: 'end', flexWrap: 'wrap' }}>
        <div className="stack stack-1" style={{ flex: 1, minWidth: 160 }}>
          <span style={SECTION_LABEL}>Ticker</span>
          <Input placeholder="All tickers" value={tickerFilter} onChange={e => setTickerFilter(e.target.value)} />
        </div>

        <div className="stack stack-1">
          <span style={SECTION_LABEL}>Source</span>
          <div className="cluster cluster-2">
            {SOURCES.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSource(s.value)}
                className={`btn btn-sm ${source === s.value ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="stack stack-1">
          <span style={SECTION_LABEL}>Sentiment</span>
          <div className="cluster cluster-2">
            {SENTIMENTS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSentiment(s.value)}
                className={`btn btn-sm ${sentiment === s.value ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="stack stack-1" style={{ flex: 1, minWidth: 200 }}>
          <span style={SECTION_LABEL}>Search</span>
          <Input placeholder="keywords…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {state.status === 'success' && (
          <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
            {filtered.length} of {state.data.length}
          </span>
        )}
      </div>

      {state.status === 'error' && <ErrorState message={state.message} onRetry={refetch} />}
      {(state.status === 'idle' || state.status === 'loading') && (
        <div className="stack stack-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      )}
      {state.status === 'success' && filtered.length === 0 && (
        <EmptyState
          title={state.data.length === 0 ? 'No posts yet' : 'No matches'}
          description={state.data.length === 0 ? 'Posts will appear after the next pipeline run.' : 'Adjust the filters to see more.'}
        />
      )}
      {state.status === 'success' && filtered.length > 0 && (
        <div className="stack stack-3">
          {filtered.map(p => {
            const symbol = symbolByTickerId.get(p.ticker) ?? ''
            return (
              <div
                key={p.id}
                role={symbol ? 'button' : undefined}
                tabIndex={symbol ? 0 : undefined}
                onClick={() => symbol && navigate(`/tickers/${symbol}`)}
                onKeyDown={e => symbol && e.key === 'Enter' && navigate(`/tickers/${symbol}`)}
                style={{ cursor: symbol ? 'pointer' : 'default' }}
              >
                <PostCard
                  source={p.source}
                  sourceName={p.source === 'reddit' ? 'Reddit' : 'StockTwits'}
                  time={`${symbol ? `$${symbol} · ` : ''}${timeAgo(p.posted_at)}`}
                  content={p.title ? `${p.title}\n\n${p.content}` : p.content}
                  label={(p.sentiment_label || 'neutral') as SentimentLabel}
                  score={p.sentiment_score ?? 0}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function SocialFeedPagePreview() {
  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Social Feed" subtitle="Cross-ticker stream from Reddit and StockTwits." />
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--on-surface-muted)' }}>
        Aggregate social feed with source/sentiment/ticker filters.
      </div>
    </div>
  )
}
