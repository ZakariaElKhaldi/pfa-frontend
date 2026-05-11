import { useMemo, useState } from 'react'
import { PageHeader }       from '@/components/layout/PageHeader'
import { ErrorState }       from '@/components/layout/ErrorState'
import { EmptyState }       from '@/components/layout/EmptyState'
import { Skeleton }         from '@/components/ui/skeleton'
import { useData }          from '@/hooks/useApi'
import { api }              from '@/lib/api'
import { toast }            from 'sonner'
import { Icons, SectionLabel } from '@/components/design-system'
import { ManipulationFlagCard } from '@/components/cards/ManipulationFlagCard'
import type { PatternType }    from '@/components/cards/ManipulationFlagCard'
import { RetrainLogRow }       from '@/components/cards/RetrainLogRow'
import type { RetrainLogEntry } from '@/components/cards/RetrainLogRow'
import { MoodCard }            from '@/components/cards/MoodCard'
import type { Mood }           from '@/components/design-system/MoodBadge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'

// ── Backend response shapes ───────────────────────────────────────────────────

interface ManipulationFlagResponse {
  id:           number
  ticker_symbol: string
  pattern_type: PatternType
  confidence:   number
  evidence:     Record<string, unknown>
  detected_at:  string
  reviewed:     boolean
}

interface RetrainLogResponse {
  id:               number
  ticker_symbol:    string | null
  trigger_reason:   string
  old_accuracy:     number
  new_accuracy:     number | null
  model_version:    string
  training_samples: number
  started_at:       string
  completed_at:     string | null
  status:           'running' | 'success' | 'failed'
}

interface MoodSnapshotResponse {
  id:            number
  ticker_symbol: string
  dominant_mood: string
  confidence:    number
  window_start:  string
  window_end:    string
  created_at:    string
}

// ── Quick-stat card ───────────────────────────────────────────────────────────

function StatChip({
  icon,
  label,
  value,
  accent,
}: {
  icon:    React.ReactNode
  label:   string
  value:   string | number
  accent?: 'positive' | 'negative' | 'warning'
}) {
  const accentColor =
    accent === 'positive' ? 'var(--secondary)' :
    accent === 'negative' ? 'var(--tertiary)'  :
    accent === 'warning'  ? 'var(--warning)'   :
    'var(--on-surface)'

  return (
    <div style={{
      background:   'var(--surface-container)',
      borderRadius: 'var(--radius-xl)',
      padding:      'var(--space-4) var(--space-5)',
      display:      'flex',
      alignItems:   'center',
      gap:          'var(--space-3)',
      flex:         '1 1 0',
      minWidth:     0,
    }}>
      <div style={{
        width:        36,
        height:       36,
        borderRadius: 'var(--radius-lg)',
        background:   `color-mix(in srgb, ${accentColor} 12%, transparent)`,
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        color:        accentColor,
        flexShrink:   0,
      }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{
          fontSize:   'var(--text-label-sm)',
          color:      'var(--on-surface-muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-label-pro)',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
        <span style={{
          fontSize:           'var(--text-mono-lg)',
          fontFamily:         'var(--font-mono)',
          fontWeight:         700,
          color:              accentColor,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </span>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function IntelligencePage() {
  const { user } = useAuth()
  const { state: retrainState, refetch: refetchRetrain } =
    useData<RetrainLogResponse[]>('/api/intelligence/retrain-logs/')

  const { state: flagsState, refetch: refetchFlags } =
    useData<ManipulationFlagResponse[]>('/api/intelligence/flags/')

  const { state: moodState } =
    useData<MoodSnapshotResponse[]>('/api/intelligence/mood/')
  const [tickerFilter, setTickerFilter] = useState('')
  const [flagState, setFlagState] = useState<'all' | 'pending' | 'reviewed'>('pending')
  const [retrainFilter, setRetrainFilter] = useState<'all' | 'running' | 'success' | 'failed'>('all')
  const [moodFilter, setMoodFilter] = useState<'all' | Mood>('all')
  const isAdmin = user?.role === 'admin'

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleReviewFlag = async (id: number) => {
    try {
      await api.patch(`/api/intelligence/flags/${id}/review/`, {})
      toast.success('Flag marked as reviewed')
      refetchFlags()
    } catch {
      toast.error('Failed to review flag')
    }
  }

  // ── derived data ──────────────────────────────────────────────────────────

  const retrainEntries = useMemo<RetrainLogEntry[]>(() => {
    if (retrainState.status !== 'success') return []
    return retrainState.data.filter(r => {
      if (retrainFilter !== 'all' && r.status !== retrainFilter) return false
      if (tickerFilter.trim() && !(r.ticker_symbol ?? '').includes(tickerFilter.trim().toUpperCase())) return false
      return true
    }).map(r => ({
      id:              r.id,
      ticker:          r.ticker_symbol ?? undefined,
      triggerReason:   r.trigger_reason,
      oldAccuracy:     r.old_accuracy,
      newAccuracy:     r.new_accuracy ?? r.old_accuracy,
      modelVersion:    r.model_version || '—',
      trainingSamples: r.training_samples,
      startedAt:       new Date(r.started_at).toLocaleString(),
      completedAt:     r.completed_at ? new Date(r.completed_at).toLocaleString() : undefined,
      status:          r.status,
    }))
  }, [retrainState, retrainFilter, tickerFilter])

  const pendingFlags = useMemo(() =>
    flagsState.status === 'success'
      ? flagsState.data.filter(f => !f.reviewed && (!tickerFilter.trim() || f.ticker_symbol.includes(tickerFilter.trim().toUpperCase())))
      : [],
  [flagsState, tickerFilter])

  const resolvedFlags = useMemo(() =>
    flagsState.status === 'success'
      ? flagsState.data.filter(f => f.reviewed && (!tickerFilter.trim() || f.ticker_symbol.includes(tickerFilter.trim().toUpperCase())))
      : [],
  [flagsState, tickerFilter])

  // quick-stat helpers
  const latestRetrain = retrainState.status === 'success' ? retrainState.data[0] : null
  const latestDelta   = latestRetrain && latestRetrain.new_accuracy != null
    ? ((latestRetrain.new_accuracy - latestRetrain.old_accuracy) * 100)
    : null

  const moodSnapshots = moodState.status === 'success'
    ? moodState.data.filter(m => {
        if (tickerFilter.trim() && !m.ticker_symbol.includes(tickerFilter.trim().toUpperCase())) return false
        if (moodFilter !== 'all' && m.dominant_mood !== moodFilter) return false
        return true
      })
    : []
  const visiblePendingFlags = flagState === 'reviewed' ? [] : pendingFlags
  const visibleResolvedFlags = flagState === 'pending' ? [] : resolvedFlags

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 stack stack-6">

      <PageHeader
        title="Intelligence"
        subtitle="Monitor model retraining, manipulation alerts, and market mood snapshots."
      />

      <div className="card cluster cluster-3" style={{ alignItems: 'end', flexWrap: 'wrap' }}>
        <div className="stack stack-1" style={{ minWidth: 180 }}>
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>Ticker</span>
          <Input value={tickerFilter} onChange={e => setTickerFilter(e.target.value.toUpperCase())} placeholder="All tickers" />
        </div>
        <Select value={flagState} onValueChange={v => setFlagState(v as typeof flagState)}>
          <SelectTrigger style={{ width: 170 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All flags</SelectItem>
            <SelectItem value="pending">Pending flags</SelectItem>
            <SelectItem value="reviewed">Reviewed flags</SelectItem>
          </SelectContent>
        </Select>
        <Select value={retrainFilter} onValueChange={v => setRetrainFilter(v as typeof retrainFilter)}>
          <SelectTrigger style={{ width: 170 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All retrains</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={moodFilter} onValueChange={v => setMoodFilter(v as typeof moodFilter)}>
          <SelectTrigger style={{ width: 170 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All moods</SelectItem>
            {(['bullish', 'bearish', 'euphoric', 'panic', 'uncertain'] as const).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* ── Quick Stats ── */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <StatChip
          icon={<Icons.Flag size={18} />}
          label="Pending Flags"
          value={pendingFlags.length}
          accent={pendingFlags.length > 0 ? 'negative' : 'positive'}
        />
        <StatChip
          icon={<Icons.RefreshCw size={18} />}
          label="Retrain Runs"
          value={retrainState.status === 'success' ? retrainState.data.length : '—'}
        />
        <StatChip
          icon={<Icons.TrendingUp size={18} />}
          label="Latest Accuracy Δ"
          value={latestDelta != null
            ? `${latestDelta >= 0 ? '+' : ''}${latestDelta.toFixed(1)}pp`
            : '—'}
          accent={
            latestDelta == null  ? undefined  :
            latestDelta > 0      ? 'positive' :
            latestDelta < 0      ? 'negative' : undefined
          }
        />
        <StatChip
          icon={<Icons.Brain size={18} />}
          label="Mood Snapshots"
          value={moodState.status === 'success' ? moodState.data.length : '—'}
        />
      </div>

      {/* ── Main Grid: Retrain + Flags ── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
        gap:                 'var(--space-6)',
        alignItems:          'start',
      }}>

        {/* Left: Retrain Log */}
        <section className="stack stack-3">
          <SectionLabel as="h2">Model Retrain Log</SectionLabel>

          {retrainState.status === 'error' && (
            <ErrorState message={retrainState.message} onRetry={refetchRetrain} />
          )}
          {(retrainState.status === 'idle' || retrainState.status === 'loading') && (
            <Skeleton className="h-48 w-full" />
          )}
          {retrainState.status === 'success' && retrainEntries.length === 0 && (
            <EmptyState
              icon={<Icons.RefreshCw size={32} />}
              title="No retrain logs yet"
              description="Model retraining events will appear here once the retrainer runs."
            />
          )}
          {retrainState.status === 'success' && retrainEntries.length > 0 && (
            <RetrainLogRow entries={retrainEntries} />
          )}
        </section>

        {/* Right: Manipulation Flags */}
        <section className="stack stack-3">
          <SectionLabel
            as="h2"
            action={
              pendingFlags.length > 0 ? (
                <span style={{
                  fontSize:   'var(--text-label-sm)',
                  fontWeight: 700,
                  color:      'var(--tertiary)',
                  background: 'var(--tertiary-container)',
                  padding:    '2px 8px',
                  borderRadius: 'var(--radius-full)',
                }}>
                  {pendingFlags.length} pending
                </span>
              ) : undefined
            }
          >
            Manipulation Flags
          </SectionLabel>

          {flagsState.status === 'error' && (
            <ErrorState message={flagsState.message} onRetry={refetchFlags} />
          )}
          {(flagsState.status === 'idle' || flagsState.status === 'loading') && (
            <Skeleton className="h-64 w-full" />
          )}
          {flagsState.status === 'success' && flagsState.data.length === 0 && (
            <EmptyState
              icon={<Icons.ShieldCheck size={32} />}
              title="No flags detected"
              description="The system hasn't flagged any suspicious market activity."
            />
          )}

          {/* Pending flags */}
          {visiblePendingFlags.length > 0 && (
            <div className="stack stack-2">
              {visiblePendingFlags.map(f => <FlagWithEvidence key={f.id} flag={f} onReview={isAdmin ? () => handleReviewFlag(f.id) : undefined} />)}
            </div>
          )}

          {/* Resolved flags */}
          {visibleResolvedFlags.length > 0 && (
            <div className="stack stack-2" style={{ marginTop: 'var(--space-4)' }}>
              <SectionLabel as="h3">Recently Reviewed</SectionLabel>
              {visibleResolvedFlags.slice(0, 8).map(f => <FlagWithEvidence key={f.id} flag={f} />)}
            </div>
          )}
        </section>
      </div>

      {/* ── Market Mood Snapshots ── */}
      <section className="stack stack-3">
        <SectionLabel as="h2">Market Mood Snapshots</SectionLabel>

        {moodState.status === 'error' && (
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--on-surface-muted)' }}>
            Could not load mood data.
          </p>
        )}
        {(moodState.status === 'idle' || moodState.status === 'loading') && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        )}
        {moodState.status === 'success' && moodSnapshots.length === 0 && (
          <EmptyState
            icon={<Icons.Activity size={32} />}
            title="No mood snapshots"
            description="Market mood data will appear once the intelligence engine runs."
          />
        )}
        {moodState.status === 'success' && moodSnapshots.length > 0 && (
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap:                 'var(--space-3)',
          }}>
            {moodSnapshots.map(m => (
              <MoodCard
                key={m.id}
                symbol={m.ticker_symbol}
                mood={m.dominant_mood as Mood}
                confidence={m.confidence}
                windowStart={new Date(m.window_start).toLocaleString()}
                windowEnd={new Date(m.window_end).toLocaleString()}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

function FlagWithEvidence({ flag, onReview }: { flag: ManipulationFlagResponse; onReview?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="stack stack-2">
      <ManipulationFlagCard
        symbol={flag.ticker_symbol}
        patternType={flag.pattern_type}
        confidence={flag.confidence}
        detectedAt={new Date(flag.detected_at).toLocaleString()}
        reviewed={flag.reviewed}
        onMarkReviewed={onReview}
      />
      <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(v => !v)} style={{ alignSelf: 'flex-start' }}>
        {open ? 'Hide evidence' : 'Show evidence'}
      </button>
      {open && (
        <pre style={{
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-container)',
          fontSize: 'var(--text-mono-sm)',
          color: 'var(--on-surface)',
        }}>{JSON.stringify(flag.evidence, null, 2)}</pre>
      )}
    </div>
  )
}
