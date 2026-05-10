import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icons } from '@/components/design-system'
import { useData } from '@/hooks/useApi'
import { api } from '@/lib/api'
import type { SentimentLabel } from '@/design-system/tokens'

interface FeedPost {
  id: number
  ticker: number
  source: string
  external_id: string
  title: string | null
  url: string | null
  content: string
  cleaned_text?: string
  display_content?: string
  sentiment_score: number | null
  sentiment_label: SentimentLabel | ''
  posted_at: string
  positive_prob?: number
  negative_prob?: number
  neutral_prob?: number
}

const POLL_MS = 30_000

const SOURCES: { value: string; label: string; color: string }[] = [
  { value: 'all',         label: 'All',         color: 'var(--primary)' },
  { value: 'reddit',      label: 'Reddit',      color: 'hsl(16, 100%, 50%)' },
  { value: 'stocktwits',  label: 'StockTwits',  color: 'hsl(200, 90%, 45%)' },
  { value: 'news_google', label: 'Google News', color: 'hsl(212, 78%, 48%)' },
  { value: 'news_yahoo',  label: 'Yahoo News',  color: 'hsl(268, 66%, 55%)' },
  { value: 'news_alpaca', label: 'Alpaca News', color: 'hsl(150, 58%, 42%)' },
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

function sourceLabel(source: string): string {
  return SOURCES.find(s => s.value === source)?.label
    ?? source.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase())
}

function postText(post: FeedPost): string {
  return post.display_content ?? post.cleaned_text ?? post.content
}

function mergeUniquePosts(primary: FeedPost[], secondary: FeedPost[]): FeedPost[] {
  const seen = new Set<number>()
  const merged: FeedPost[] = []
  for (const post of [...primary, ...secondary]) {
    if (seen.has(post.id)) continue
    seen.add(post.id)
    merged.push(post)
  }
  return merged
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

  const text = post.title ? `${post.title}\n\n${postText(post)}` : postText(post)
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
          <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 600, color: srcInfo?.color ?? 'var(--primary)' }}>
            {sourceLabel(post.source)}
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
  const [selectedTicker, setSelectedTicker] = useState('all')
  const [source, setSource] = useState('all')
  const [sentiment, setSentiment] = useState<'all' | SentimentLabel>('all')
  const [search, setSearch] = useState('')
  const [showCount, setShowCount] = useState(30)
  const [visiblePosts, setVisiblePosts] = useState<FeedPost[]>([])
  const [pendingPosts, setPendingPosts] = useState<FeedPost[]>([])
  const [notifyEnabled, setNotifyEnabled] = useState(true)
  const [checking, setChecking] = useState(false)
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null)
  const knownIdsRef = useRef<Set<number>>(new Set())

  const path = selectedTicker !== 'all'
    ? `/api/social/feed/?symbol=${encodeURIComponent(selectedTicker)}`
    : '/api/social/feed/'
  const { state, refetch } = useData<FeedPost[]>(path, [selectedTicker])

  useEffect(() => {
    if (state.status !== 'success') return
    setVisiblePosts(state.data)
    setPendingPosts([])
    knownIdsRef.current = new Set(state.data.map(post => post.id))
    setLastCheckedAt(new Date())
  }, [state, path])

  const { state: tickers } = useData<Array<{ id: number; symbol: string; name?: string }>>('/api/tickers/')
  const tickerItems = useMemo(() => {
    if (tickers.status !== 'success') return []
    return [...tickers.data].sort((a, b) => a.symbol.localeCompare(b.symbol))
  }, [tickers])
  const symbolByTickerId = useMemo(() => {
    if (tickers.status !== 'success') return new Map<number, string>()
    return new Map(tickers.data.map(t => [t.id, t.symbol]))
  }, [tickers])

  const quickTickers = useMemo(() => {
    const seen = new Set<string>()
    const fromPosts = visiblePosts
      .map(post => symbolByTickerId.get(post.ticker))
      .filter((symbol): symbol is string => !!symbol)
      .filter(symbol => {
        if (seen.has(symbol)) return false
        seen.add(symbol)
        return true
      })
    return fromPosts.length > 0 ? fromPosts.slice(0, 10) : tickerItems.slice(0, 10).map(t => t.symbol)
  }, [symbolByTickerId, tickerItems, visiblePosts])

  const checkForNewPosts = useCallback(async (announce = true) => {
    if (checking) return
    setChecking(true)
    try {
      const latest = await api.get<FeedPost[]>(path)
      const newItems = latest.filter(post => !knownIdsRef.current.has(post.id))
      setLastCheckedAt(new Date())
      if (newItems.length === 0) return
      for (const post of newItems) knownIdsRef.current.add(post.id)
      setPendingPosts(prev => mergeUniquePosts(newItems, prev))
      if (announce && notifyEnabled) {
        const scope = selectedTicker === 'all' ? 'feed' : selectedTicker
        toast.info(`${newItems.length} new ${newItems.length === 1 ? 'post' : 'posts'} in ${scope}`, {
          action: {
            label: 'Show',
            onClick: () => {
              setVisiblePosts(current => mergeUniquePosts(newItems, current))
              setPendingPosts(current => current.filter(post => !newItems.some(item => item.id === post.id)))
              setShowCount(30)
            },
          },
        })
      }
    } catch {
      // Keep polling quiet; the visible error state handles initial load failures.
    } finally {
      setChecking(false)
    }
  }, [checking, notifyEnabled, path, selectedTicker])

  useEffect(() => {
    if (state.status !== 'success') return
    const id = window.setInterval(() => {
      checkForNewPosts(true)
    }, POLL_MS)
    return () => window.clearInterval(id)
  }, [checkForNewPosts, state.status])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return visiblePosts.filter(p => {
      const displayText = postText(p).toLowerCase()
      if (source !== 'all'    && p.source         !== source)    return false
      if (sentiment !== 'all' && p.sentiment_label !== sentiment) return false
      if (q && !displayText.includes(q) && !(p.title ?? '').toLowerCase().includes(q)) return false
      return true
    })
  }, [visiblePosts, source, sentiment, search])

  // Reset show count when filters change
  useEffect(() => { setShowCount(30) }, [source, sentiment, search, selectedTicker])

  const visible = filtered.slice(0, showCount)
  const showPendingPosts = () => {
    setVisiblePosts(current => mergeUniquePosts(pendingPosts, current))
    setPendingPosts([])
    setShowCount(30)
  }

  return (
    <div className="p-6 stack stack-5">
      <PageHeader
        title="Social Feed"
        subtitle={selectedTicker === 'all' ? 'Live cross-ticker stream.' : `Tracking ${selectedTicker} posts.`}
        actions={
          <div className="cluster cluster-2" style={{ flexWrap: 'wrap' as const, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className={`btn btn-sm ${notifyEnabled ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setNotifyEnabled(v => !v)}
              aria-pressed={notifyEnabled}
              title="Toggle new-post alerts"
            >
              <Icons.Bell size={15} />
              {notifyEnabled ? 'Alerts on' : 'Alerts off'}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => checkForNewPosts(false)}
              disabled={checking}
              title="Check for new posts"
            >
              <Icons.RefreshCw size={15} />
              {checking ? 'Checking' : 'Check now'}
            </button>
          </div>
        }
      />

      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-4)', alignItems: 'start' }}>
        <div className="stack stack-3">
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label-pro)' }}>
            Ticker
          </span>
          <Select value={selectedTicker} onValueChange={(value) => { if (value) setSelectedTicker(value) }}>
            <SelectTrigger className="w-full" style={{ fontFamily: selectedTicker === 'all' ? undefined : 'var(--font-mono)', fontWeight: 700 }}>
              <SelectValue placeholder="All tickers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tickers</SelectItem>
              {tickerItems.map(t => (
                <SelectItem key={t.symbol} value={t.symbol}>
                  {t.symbol}{t.name ? ` — ${t.name}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setSelectedTicker('all')}
              className={`btn btn-sm ${selectedTicker === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              All
            </button>
            {quickTickers.map(symbol => (
              <button
                key={symbol}
                type="button"
                onClick={() => setSelectedTicker(symbol)}
                className={`btn btn-sm ${selectedTicker === symbol ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-mono)' }}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        <div className="stack stack-3">
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 180 }}
            />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              color: pendingPosts.length > 0 ? 'var(--secondary)' : 'var(--on-surface-muted)',
              fontSize: 'var(--text-label-sm)',
              fontWeight: 700,
            }}>
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: pendingPosts.length > 0 ? 'var(--secondary)' : checking ? 'var(--warning)' : 'var(--on-surface-muted)',
                  boxShadow: pendingPosts.length > 0 ? '0 0 0 4px color-mix(in srgb, var(--secondary) 16%, transparent)' : undefined,
                }}
              />
              {pendingPosts.length > 0 ? `${pendingPosts.length} new` : checking ? 'Checking' : lastCheckedAt ? `Checked ${lastCheckedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Waiting'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
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

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
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
                {filtered.length} of {visiblePosts.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Live stats strip */}
      {state.status === 'success' && filtered.length > 0 && (
        <SentimentStats posts={filtered} />
      )}

      {state.status === 'success' && pendingPosts.length > 0 && (
        <button
          type="button"
          onClick={showPendingPosts}
          className="btn btn-secondary"
          style={{ alignSelf: 'stretch', justifyContent: 'center', borderRadius: 'var(--radius-lg)' }}
        >
          <Icons.ArrowUp size={16} />
          Show {pendingPosts.length} new {pendingPosts.length === 1 ? 'post' : 'posts'}
        </button>
      )}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={refetch} />}
      {(state.status === 'idle' || state.status === 'loading') && (
        <div className="stack stack-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      )}
      {state.status === 'success' && filtered.length === 0 && (
        <EmptyState
          title={visiblePosts.length === 0 ? 'No posts yet' : 'No matches'}
          description={visiblePosts.length === 0 ? 'Posts will appear after the next pipeline run.' : 'Adjust filters to see more.'}
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
