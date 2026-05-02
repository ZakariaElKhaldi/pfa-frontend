import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { EmptyState } from '@/components/layout/EmptyState'
import { ManipulationFlagCard, type PatternType } from '@/components/cards/ManipulationFlagCard'
import { RetrainLogRow, type RetrainLogEntry, type RetrainStatus } from '@/components/cards/RetrainLogRow'
import { MoodCard } from '@/components/cards/MoodCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useData } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { Mood } from '@/components/design-system/MoodBadge'

interface FlagItem {
  id: number; ticker_symbol: string; pattern_type: string; confidence: number
  detected_at: string; reviewed: boolean
  evidence?: Record<string, unknown>
}
interface LogItem {
  id: number; ticker_symbol: string | null; trigger_reason: string; old_accuracy: number | null
  new_accuracy: number | null; model_version: string; training_samples: number
  started_at: string; completed_at: string | null; status: RetrainStatus
}
interface MoodItem {
  id: number; ticker_symbol: string; dominant_mood: Mood; confidence: number
  window_start: string; window_end: string
}

export function IntelligencePage() {
  const navigate = useNavigate()
  const { state: flags,    refetch: refetchFlags }  = useData<FlagItem[]>('/api/intelligence/flags/?reviewed=false')
  const { state: logs,     refetch: refetchLogs }   = useData<LogItem[]>('/api/intelligence/retrain-logs/')
  const { state: moods }                            = useData<MoodItem[]>('/api/intelligence/mood/')
  const [reviewing, setReviewing] = useState<Set<number>>(new Set())
  const [selectedFlag, setSelectedFlag] = useState<FlagItem | null>(null)

  const handleReview = useCallback(async (id: number) => {
    setReviewing(s => new Set(s).add(id))
    try {
      await api.patch(`/api/intelligence/flags/${id}/review/`, {})
      toast.success('Flag marked as reviewed')
      refetchFlags()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Review failed')
    } finally {
      setReviewing(s => { const n = new Set(s); n.delete(id); return n })
    }
  }, [refetchFlags])

  const logEntries: RetrainLogEntry[] = logs.status === 'success'
    ? logs.data.map(l => ({
        id:              l.id,
        ticker:          l.ticker_symbol ?? undefined,
        triggerReason:   l.trigger_reason,
        oldAccuracy:     l.old_accuracy ?? 0,
        newAccuracy:     l.new_accuracy ?? 0,
        modelVersion:    l.model_version,
        trainingSamples: l.training_samples,
        startedAt:       new Date(l.started_at).toLocaleString(),
        completedAt:     l.completed_at ? new Date(l.completed_at).toLocaleString() : undefined,
        status:          l.status,
      }))
    : []

  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Intelligence" subtitle="Manipulation flags, mood snapshots, and retrain logs." />

      {/* Manipulation Flags */}
      <div className="stack stack-3">
        <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
          Manipulation Flags
        </span>
        {flags.status === 'error' && <ErrorState message={flags.message} onRetry={refetchFlags} />}
        {(flags.status === 'idle' || flags.status === 'loading') && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
        )}
        {flags.status === 'success' && flags.data.length === 0 && (
          <EmptyState title="No unreviewed flags" description="All manipulation flags have been reviewed." />
        )}
        {flags.status === 'success' && flags.data.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {flags.data.map(f => (
              <div
                key={f.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedFlag(f)}
                onKeyDown={e => e.key === 'Enter' && setSelectedFlag(f)}
                style={{ cursor: 'pointer' }}
              >
                <ManipulationFlagCard
                  symbol={f.ticker_symbol}
                  patternType={f.pattern_type as PatternType}
                  confidence={f.confidence}
                  detectedAt={new Date(f.detected_at).toLocaleString()}
                  reviewed={f.reviewed}
                  onMarkReviewed={reviewing.has(f.id) ? undefined : () => handleReview(f.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Market Mood */}
      <div className="stack stack-3">
        <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
          Market Mood
        </span>
        {(moods.status === 'idle' || moods.status === 'loading') && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        )}
        {moods.status === 'success' && moods.data.length === 0 && (
          <EmptyState title="No mood snapshots" description="Mood data will appear after the next pipeline run." />
        )}
        {moods.status === 'success' && moods.data.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
            {moods.data.slice(0, 6).map(m => (
              <MoodCard
                key={m.id}
                symbol={m.ticker_symbol}
                mood={m.dominant_mood}
                confidence={m.confidence}
                windowStart={new Date(m.window_start).toLocaleDateString()}
                windowEnd={new Date(m.window_end).toLocaleDateString()}
              />
            ))}
          </div>
        )}
      </div>

      {/* Retrain Logs */}
      <div className="stack stack-3">
        <span style={{ fontSize: 'var(--text-label-md)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
          Retrain Logs
        </span>
        {logs.status === 'error' && <ErrorState message={logs.message} onRetry={refetchLogs} />}
        {(logs.status === 'idle' || logs.status === 'loading') && <Skeleton className="h-32 w-full" />}
        {logs.status === 'success' && logEntries.length === 0 && (
          <EmptyState title="No retrain logs" description="No model retraining has occurred yet." />
        )}
        {logEntries.length > 0 && <RetrainLogRow entries={logEntries} />}
      </div>

      {/* Flag detail modal */}
      <Dialog open={selectedFlag !== null} onOpenChange={o => !o && setSelectedFlag(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedFlag && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedFlag.ticker_symbol} · {selectedFlag.pattern_type.replace(/_/g, ' ')}
                </DialogTitle>
                <DialogDescription>
                  Detected {new Date(selectedFlag.detected_at).toLocaleString()} ·
                  Confidence {(selectedFlag.confidence * 100).toFixed(1)}% ·
                  {selectedFlag.reviewed ? ' Reviewed' : ' Unreviewed'}
                </DialogDescription>
              </DialogHeader>

              <div className="stack stack-3" style={{ marginTop: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-label-sm)', fontWeight: 500, letterSpacing: 'var(--tracking-label-pro)', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
                  Evidence
                </span>
                <pre
                  style={{
                    fontSize:     'var(--text-body-sm)',
                    fontFamily:   'var(--font-mono)',
                    background:   'var(--surface-container-lowest)',
                    border:       '1px solid var(--outline-variant)',
                    borderRadius: 'var(--radius-md)',
                    padding:      'var(--space-3)',
                    maxHeight:    320,
                    overflow:     'auto',
                    whiteSpace:   'pre-wrap',
                    wordBreak:    'break-word',
                    color:        'var(--on-surface)',
                  }}
                >
                  {selectedFlag.evidence
                    ? JSON.stringify(selectedFlag.evidence, null, 2)
                    : '(No evidence payload provided.)'}
                </pre>
              </div>

              <div className="cluster cluster-2" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                <Button variant="outline" onClick={() => navigate(`/tickers/${selectedFlag.ticker_symbol}`)}>
                  View ticker
                </Button>
                {!selectedFlag.reviewed && (
                  <Button
                    onClick={() => {
                      handleReview(selectedFlag.id)
                      setSelectedFlag(null)
                    }}
                    disabled={reviewing.has(selectedFlag.id)}
                  >
                    Mark as reviewed
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function IntelligencePagePreview() {
  const flags: FlagItem[] = [
    { id: 1, ticker_symbol: 'AMC',  pattern_type: 'pump_dump',         confidence: 0.91, detected_at: new Date().toISOString(), reviewed: false },
    { id: 2, ticker_symbol: 'BBBY', pattern_type: 'coordinated_spam', confidence: 0.74, detected_at: new Date(Date.now() - 3600000).toISOString(), reviewed: false },
  ]
  const logs: RetrainLogEntry[] = [
    { id: 1, ticker: 'AAPL', triggerReason: 'accuracy_drop', oldAccuracy: 0.62, newAccuracy: 0.74, modelVersion: 'v2.1', trainingSamples: 4200, startedAt: '2024-01-15 02:00', completedAt: '2024-01-15 02:14', status: 'success' },
    { id: 2,                  triggerReason: 'scheduled',     oldAccuracy: 0.70, newAccuracy: 0.71, modelVersion: 'v2.2', trainingSamples: 9800, startedAt: '2024-01-14 02:00', completedAt: '2024-01-14 02:22', status: 'success' },
  ]
  return (
    <div className="p-6 stack stack-6">
      <PageHeader title="Intelligence" subtitle="Manipulation flags, mood snapshots, and retrain logs." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {flags.map(f => (
          <ManipulationFlagCard key={f.id} symbol={f.ticker_symbol} patternType={f.pattern_type} confidence={f.confidence} detectedAt={new Date(f.detected_at).toLocaleString()} reviewed={f.reviewed} onMarkReviewed={() => {}} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
        <MoodCard symbol="AAPL" mood="bullish" confidence={0.82} windowStart="Jan 14" windowEnd="Jan 15" />
        <MoodCard symbol="TSLA" mood="panic"   confidence={0.71} windowStart="Jan 14" windowEnd="Jan 15" />
      </div>
      <RetrainLogRow entries={logs} />
    </div>
  )
}
