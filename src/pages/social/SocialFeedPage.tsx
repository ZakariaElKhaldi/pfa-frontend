import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/design-system'
import { useData } from '@/hooks/useApi'
import type { SentimentLabel } from '@/design-system/tokens'

interface FeedPost {
  id: number
  ticker: number
  source: 'reddit' | 'stocktwits'
  external_id: string
  title: string | null
  url: string | null
  content: string
  sentiment_score: number | null
  sentiment_label: SentimentLabel | ''
  posted_at: string
  positive_prob?: number
  negative_prob?: number
  neutral_prob?: number
}

const SOURCES: { value: 'all' | 'reddit' | 'stocktwits'; label: string; color: string }[] = [
  { value: 'all',        label: 'All',        color: 'var(--primary)' },
  { value: 'reddit',     label: 'Reddit',     color: 'hsl(16, 100%, 50%)' },
  { value: 'stocktwits', label: 'StockTwits', color: 'hsl(200, 90%, 45%)' },
]
const SENTIMENTS: { value: 'all' | SentimentLabel; label: React.ReactNode }[] = [
  { value: 'all',     label: 'All' },
  { value: 'bullish', label: <span style={{display: 'flex', alignItems: 'center', gap: 4}}><Icons.ArrowUp size={14} /> Bullish</span> },
  { value: 'bearish', label: <span style={{display: 'flex', alignItems: 'center', gap: 4}}><Icons.ArrowDown size={14} /> Bearish</span> },
  { value: 'neutral', label: <span style={{display: 'flex', alignItems: 'center', gap: 4}}><Icons.Minus size={14} /> Neutral</span> },
]

const SENT_COLOR: Record<string, string> = {
  bullish: 'var(--secondary)',
  bearish: 'var(--tertiary)',
  neutral: 'var(--on-surface-muted)',
}
const SENT_BG: Record<string, string> = {
  bullish: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
  bearish: 'color-mix(in srgb, var(--tertiary) 12%, transparent)',
  neutral: 'var(--surface-container-high)',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1)  return 'just now'
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24)   return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── Rich post card ────────────────────────────────────────────────────────────
function RichPostCard({
  post, symbol, onClick,
}: {
  post: FeedPost; symbol: string; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const label = (post.sentiment_label || 'neutral') as SentimentLabel
  const score = post.sentiment_score ?? 0
  const color = SENT_COLOR[label] ?? 'var(--on-surface-muted)'
  const srcInfo = SOURCES.find(s => s.value === post.source)

  // Probability bars (pos / neg / neu)
  const pos = post.positive_prob ?? null
  const neg = post.negative_prob ?? null
  const neu = post.neutral_prob ?? null
  const hasProbs = pos !== null && neg !== null && neu !== null

  const text = post.title
    ? `${post.title}\n\n${post.content}`
    : post.content
  const truncated = text.length > 220 ? text.slice(0, 220) + '…' : text

  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        background: 'var(--surface-container)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: `1px solid ${hovered ? 'var(--outline-variant)' : 'transparent'}`,
        cursor: symbol || post.url ? 'pointer' : 'default',
        transition: 'all 0.15s var(--ease-out)',
        transform: hovered && (symbol || post.url) ? 'translateY(-1px)' : undefined,
        boxShadow: hovered ? 'var(--shadow-sm)' : 'none',
      }}
    >
      {/* Sentiment accent strip */}
      <div style={{ width: 4, flexShrink: 0, background: color, borderRadius: '0 0 0 0' }} />

      <div style={{ flex: 1, padding: 'var(--space-3) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {/* Source logo placeholder */}
          <span style={{
            width: 20, height: 20, borderRadius: '50%', background: srcInfo?.color ?? 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            {post.source.charAt(0).toUpperCase()}
          </span>
          <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, color: srcInfo?.color }}>
            {post.source === 'reddit' ? 'Reddit' : 'StockTwits'}
          </span>

          {symbol && (
            <span style={{
              fontSize: 'var(--text-label-sm)', fontWeight: 700, padding: '1px 8px',
              borderRadius: 'var(--radius-full)', background: 'var(--surface-container-high)',
              color: 'var(--primary)', fontFamily: 'var(--font-mono)',
            }}>
              ${symbol}
            </span>
          )}

          <time style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', marginLeft: 'auto' }}>
            {timeAgo(post.posted_at)}
          </time>
        </div>

        {/* Content */}
        <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface)', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-line' }}>
          {truncated}
        </p>

        {/* Footer: sentiment badge + score + prob bars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-1)' }}>
          <span style={{
            fontSize: 'var(--text-label-sm)', fontWeight: 700, padding: '2px 10px',
            borderRadius: 'var(--radius-full)', color, background: SENT_BG[label],
            textTransform: 'capitalize',
          }}>
            {label}
          </span>
          <span style={{
            fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)',
            color: score >= 0 ? 'var(--secondary)' : 'var(--tertiary)', fontWeight: 600,
          }}>
            {score >= 0 ? '+' : ''}{score.toFixed(3)}
          </span>

          {hasProbs && (
            <div style={{ flex: 1, display: 'flex', gap: 2, height: 6, borderRadius: 999, overflow: 'hidden', minWidth: 80 }} title={`Pos: ${(pos! * 100).toFixed(0)}% / Neg: ${(neg! * 100).toFixed(0)}% / Neu: ${(neu! * 100).toFixed(0)}%`}>
              <div style={{ flex: pos!, background: 'var(--secondary)', transition: 'flex 0.3s' }} />
              <div style={{ flex: neg!, background: 'var(--tertiary)', transition: 'flex 0.3s' }} />
              <div style={{ flex: neu!, background: 'var(--surface-container-high)', transition: 'flex 0.3s' }} />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

// ── Sentiment stats header ─────────────────────────────────────────────────────
function SentimentStats({ posts }: { posts: FeedPost[] }) {
  const counts = { bullish: 0, bearish: 0, neutral: 0 }
  posts.forEach(p => {
    const l = (p.sentiment_label || 'neutral') as SentimentLabel
    if (l in counts) counts[l as keyof typeof counts]++
  })
  const avgScore = posts.length > 0
    ? posts.reduce((s, p) => s + (p.sentiment_score ?? 0), 0) / posts.length
    : 0

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
      {(['bullish', 'bearish', 'neutral'] as const).map(l => {
        const color = SENT_COLOR[l]
        return (
          <div key={l} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)',
            background: `color-mix(in srgb, ${color} 12%, var(--surface-container))`,
            border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 700, color, textTransform: 'capitalize' }}>{l}</span>
            <span style={{ fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', color: 'var(--on-surface)', fontWeight: 600 }}>{counts[l]}</span>
          </div>
        )
      })}
      {/* Aggregate score */}
      <div style={{
        marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
        padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)',
        background: 'var(--surface-container)',
      }}>
        <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>Avg score</span>
        <span style={{
          fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700,
          color: avgScore >= 0 ? 'var(--secondary)' : 'var(--tertiary)',
        }}>
          {avgScore >= 0 ? '+' : ''}{avgScore.toFixed(3)}
        </span>
      </div>
    </div>
  )
}

export function SocialFeedPage() {
  const navigate = useNavigate()
  const [tickerFilter, setTickerFilter] = useState('')
  const [source, setSource] = useState<'all' | 'reddit' | 'stocktwits'>('all')
  const [sentiment, setSentiment] = useState<'all' | SentimentLabel>('all')
  const [search, setSearch] = useState('')
  const [showCount, setShowCount] = useState(30)

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

  const { state: tickers } = useData<Array<{ id: number; symbol: string }>>('/api/tickers/')
  const symbolByTickerId = useMemo(() => {
    if (tickers.status !== 'success') return new Map<number, string>()
    return new Map(tickers.data.map(t => [t.id, t.symbol]))
  }, [tickers])

  // Reset show count when filters change
  useEffect(() => { setShowCount(30) }, [source, sentiment, search, tickerFilter])

  const visible = filtered.slice(0, showCount)

  return (
    <div className="p-6 stack stack-5">
      <PageHeader title="Social Feed" subtitle="Cross-ticker stream from Reddit and StockTwits, sentiment-scored." />

      {/* Live stats strip */}
      {state.status === 'success' && filtered.length > 0 && (
        <SentimentStats posts={filtered} />
      )}

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Ticker search + text search */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Input
            placeholder="Filter by ticker (e.g. AAPL)…"
            value={tickerFilter}
            onChange={e => setTickerFilter(e.target.value)}
            style={{ maxWidth: 220, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
          />
          <Input
            placeholder="Keyword search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 180, maxWidth: 340 }}
          />
        </div>

        {/* Source + sentiment pill filters */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>Source:</span>
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
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', marginLeft: 'var(--space-3)' }}>Sentiment:</span>
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
          {state.status === 'success' && (
            <span style={{ marginLeft: 'auto', fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
              {filtered.length} of {state.data.length} posts
            </span>
          )}
        </div>
      </div>

      {state.status === 'error' && <ErrorState message={state.message} onRetry={refetch} />}
      {(state.status === 'idle' || state.status === 'loading') && (
        <div className="stack stack-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      )}
      {state.status === 'success' && filtered.length === 0 && (
        <EmptyState
          title={state.data.length === 0 ? 'No posts yet' : 'No matches'}
          description={state.data.length === 0 ? 'Posts will appear after the next pipeline run.' : 'Adjust filters to see more.'}
        />
      )}

      {state.status === 'success' && visible.length > 0 && (
        <div className="stack stack-2">
          {visible.map(p => {
            const symbol = symbolByTickerId.get(p.ticker) ?? ''
            return (
              <RichPostCard
                key={p.id}
                post={p}
                symbol={symbol}
                onClick={() => symbol ? navigate(`/tickers/${symbol}`) : p.url ? window.open(p.url, '_blank') : undefined}
              />
            )
          })}

          {filtered.length > showCount && (
            <button
              className="btn btn-ghost"
              onClick={() => setShowCount(n => n + 30)}
              style={{ alignSelf: 'center', borderRadius: 'var(--radius-full)' }}
            >
              Load more ({filtered.length - showCount} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
