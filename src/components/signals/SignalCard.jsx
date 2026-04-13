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
    <Card className="bg-[--color-surface-low] border-0 p-4 flex flex-col gap-3 hover:bg-[--color-container] transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-[--color-max-text] text-sm">
            {ticker_symbol ?? '—'}
          </span>
          <SignalBadge signal={type} />
        </div>
        <div className="flex items-center gap-1.5">
          {prediction_method && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-[--color-container] text-[--color-muted] font-mono"
            >
              {prediction_method === 'ml' ? 'ML' : 'Rule'}
            </Badge>
          )}
          <span className="text-[10px] text-[--color-muted]">
            {created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true }) : '—'}
          </span>
        </div>
      </div>

      {confidencePct != null && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[--color-muted] w-20 shrink-0">Confidence</span>
          <div className="flex-1 h-1.5 rounded-full bg-[--color-container] overflow-hidden">
            <div
              className="h-full rounded-full bg-[--color-action]"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[--color-subtle] w-8 text-right">
            {confidencePct}%
          </span>
        </div>
      )}

      <div className="flex gap-4 text-[10px] font-mono text-[--color-muted]">
        {sentiment != null && <span>S {sentiment.toFixed(2)}</span>}
        {momentum  != null && <span>M {momentum.toFixed(2)}</span>}
      </div>
    </Card>
  )
}
