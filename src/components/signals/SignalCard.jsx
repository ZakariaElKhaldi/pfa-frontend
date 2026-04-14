import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SignalBadge from './SignalBadge'
import { formatDistanceToNow } from 'date-fns'

export default function SignalCard({ signal }) {
  const {
    ticker_symbol,
    signal: type,
    prediction_confidence,
    prediction_method,
    sentiment,
    momentum,
    created_at,
  } = signal

  const confidencePct = prediction_confidence != null
    ? Math.round(prediction_confidence * 100)
    : null

  return (
    <Card className="bg-container border border-ghost p-5 flex flex-col gap-4 hover:border-ghost-strong transition-all cursor-pointer group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-max-text text-sm">
            {ticker_symbol ?? '—'}
          </span>
          <SignalBadge signal={type} />
        </div>
        <div className="flex items-center gap-2">
          {prediction_method && (
            <Badge variant="ghost" className="opacity-70 group-hover:opacity-100">
              {prediction_method === 'ml' ? 'ML' : 'Rule'}
            </Badge>
          )}
          <span className="text-[10px] text-muted">
            {created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true }) : '—'}
          </span>
        </div>
      </div>

      {confidencePct != null && (
        <div className="flex items-center gap-3 bg-void/60 rounded-md p-3 border border-ghost">
          <span className="text-[11px] text-subtle w-10 shrink-0 uppercase tracking-wide font-semibold">Conf</span>
          <div className="flex-1 h-1.5 rounded-full bg-container-high overflow-hidden">
            <div
              className={`h-full rounded-full ${type?.includes('BUY') ? 'bg-signal-buy' : type?.includes('SELL') ? 'bg-signal-sell' : 'bg-signal-hold'}`}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-primary-text w-8 text-right font-semibold">
            {confidencePct}%
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mt-1">
        <div className="flex gap-4 text-[11px] font-mono text-subtle">
          {sentiment != null && <span>S {sentiment.toFixed(2)}</span>}
          {momentum  != null && <span>M {momentum.toFixed(2)}</span>}
        </div>
        <button className="text-[10px] font-bold tracking-wider uppercase text-action hover:text-action-hover transition-colors">
          View Details →
        </button>
      </div>
    </Card>
  )
}
