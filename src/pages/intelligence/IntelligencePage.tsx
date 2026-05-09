import { useMemo } from 'react'
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
  const { state: retrainState, refetch: refetchRetrain } =
    useData<RetrainLogResponse[]>('/api/intelligence/retrain-logs/')

  const { state: flagsState, refetch: refetchFlags } =
    useData<ManipulationFlagResponse[]>('/api/intelligence/flags/')

  const { state: moodState } =
    useData<MoodSnapshotResponse[]>('/api/intelligence/mood/')

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
    return retrainState.data.map(r => ({
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
  }, [retrainState])

  const pendingFlags = useMemo(() =>
    flagsState.status === 'success'
      ? flagsState.data.filter(f => !f.reviewed)
      : [],
  [flagsState])

  const resolvedFlags = useMemo(() =>
    flagsState.status === 'success'
      ? flagsState.data.filter(f => f.reviewed)
      : [],
  [flagsState])

  // quick-stat helpers
  const latestRetrain = retrainState.status === 'success' ? retrainState.data[0] : null
  const latestDelta   = latestRetrain && latestRetrain.new_accuracy != null
    ? ((latestRetrain.new_accuracy - latestRetrain.old_accuracy) * 100)
    : null

  const moodSnapshots = moodState.status === 'success' ? moodState.data : []

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 stack stack-6">

      <PageHeader
        title="Intelligence"
        subtitle="Monitor model retraining, manipulation alerts, and market mood snapshots."
      />

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
          {pendingFlags.length > 0 && (
            <div className="stack stack-2">
              {pendingFlags.map(f => (
                <ManipulationFlagCard
                  key={f.id}
                  symbol={f.ticker_symbol}
                  patternType={f.pattern_type}
                  confidence={f.confidence}
                  detectedAt={new Date(f.detected_at).toLocaleString()}
                  reviewed={false}
                  onMarkReviewed={() => handleReviewFlag(f.id)}
                />
              ))}
            </div>
          )}

          {/* Resolved flags */}
          {resolvedFlags.length > 0 && (
            <div className="stack stack-2" style={{ marginTop: 'var(--space-4)' }}>
              <SectionLabel as="h3">Recently Reviewed</SectionLabel>
              {resolvedFlags.slice(0, 8).map(f => (
                <ManipulationFlagCard
                  key={f.id}
                  symbol={f.ticker_symbol}
                  patternType={f.pattern_type}
                  confidence={f.confidence}
                  detectedAt={new Date(f.detected_at).toLocaleString()}
                  reviewed
                />
              ))}
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
