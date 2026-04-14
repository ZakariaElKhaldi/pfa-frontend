import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import SignalBadge from '@/components/signals/SignalBadge'
import { useSignalExplain } from '@/hooks/useSignals'
import { cn, formatPct } from '@/lib/utils'
import { Brain, TrendingUp, Users, BarChart2, AlertCircle } from 'lucide-react'

/* ─── Confidence bar ─────────────────────────────────── */
function ConfidenceBar({ label, value, colorClass }) {
  const pct = Math.round((value ?? 0) * 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-container overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-data text-[10px] text-subtle w-9 text-right shrink-0">
        {pct}%
      </span>
    </div>
  )
}

/* ─── Feature importance row ─────────────────────────── */
function FeatureRow({ name, value }) {
  const pct    = Math.round(Math.abs(value ?? 0) * 100)
  const isPos  = (value ?? 0) >= 0
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-subtle flex-1 truncate">{name}</span>
      <div className="w-24 h-1 rounded-full bg-container overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full',
            isPos ? 'bg-signal-buy' : 'bg-signal-sell',
          )}
          style={{ width: `${Math.min(pct * 2, 100)}%` }}
        />
      </div>
      <span className={cn(
        'font-data w-12 text-right shrink-0',
        isPos ? 'text-signal-buy' : 'text-signal-sell',
      )}>
        {isPos ? '+' : ''}{(value ?? 0).toFixed(3)}
      </span>
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────── */
function ExplainSkeleton() {
  return (
    <div className="flex flex-col gap-4 mt-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full bg-container" />
      ))}
    </div>
  )
}

/* ─── Main component ─────────────────────────────────── */
export default function SignalExplanationModal({ symbol, open, onClose }) {
  const { data, isLoading, isError } = useSignalExplain(open ? symbol : null)

  const methodLabel = data?.prediction_method === 'ml' ? 'ML Model' : 'Rule-based'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-container border-container max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="font-mono text-max-text">
              {symbol}
            </DialogTitle>
            {data?.signal && <SignalBadge signal={data.signal} size="md" />}
            {data?.prediction_method && (
              <Badge
                variant="outline"
                className="text-[10px] border-container text-muted font-mono"
              >
                {methodLabel}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-subtle text-xs">
            Signal explanation — decision factors and confidence breakdown
          </DialogDescription>
        </DialogHeader>

        {isLoading && <ExplainSkeleton />}

        {isError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-signal-sell-container border border-signal-sell-border">
            <AlertCircle size={14} className="text-signal-sell shrink-0" />
            <p className="text-xs text-signal-sell">Could not load explanation.</p>
          </div>
        )}

        {data && !isLoading && (
          <div className="flex flex-col gap-5 mt-1">

            {/* Confidence scores */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Brain size={13} className="text-action" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
                  Confidence Scores
                </span>
              </div>
              <ConfidenceBar
                label="Overall"
                value={data.prediction_confidence}
                colorClass="bg-action"
              />
              {data.sentiment != null && (
                <ConfidenceBar
                  label="Sentiment"
                  value={(data.sentiment + 1) / 2}
                  colorClass={data.sentiment >= 0 ? 'bg-signal-buy' : 'bg-signal-sell'}
                />
              )}
              {data.momentum != null && (
                <ConfidenceBar
                  label="Momentum"
                  value={(data.momentum + 1) / 2}
                  colorClass={data.momentum >= 0 ? 'bg-signal-buy' : 'bg-signal-sell'}
                />
              )}
              {data.consistency != null && (
                <ConfidenceBar
                  label="Consistency"
                  value={data.consistency}
                  colorClass="bg-signal-hold"
                />
              )}
            </div>

            {/* Feature importances */}
            {data.feature_importances && Object.keys(data.feature_importances).length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <BarChart2 size={13} className="text-action" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
                    Feature Importances
                  </span>
                </div>
                {Object.entries(data.feature_importances)
                  .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                  .slice(0, 8)
                  .map(([name, value]) => (
                    <FeatureRow key={name} name={name} value={value} />
                  ))
                }
              </div>
            )}

            {/* Aggregation detail */}
            {data.aggregation_detail && (
              <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-surface border border-container">
                <div className="flex items-center gap-1.5 mb-1">
                  <Users size={13} className="text-action" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
                    Aggregation
                  </span>
                </div>
                {Object.entries(data.aggregation_detail).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[10px]">
                    <span className="text-muted capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className="font-data text-subtle">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
