import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useResolveAlert } from '@/hooks/useAlerts'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const TYPE_COLORS = {
  divergence:        'text-signal-hold bg-signal-hold-container',
  extreme_sentiment: 'text-signal-sell bg-signal-sell-container',
}

const TYPE_LABELS = {
  divergence:        'Divergence',
  extreme_sentiment: 'Extreme Sentiment',
}

export default function AlertCard({ alert }) {
  const { id, ticker_symbol, type, sentiment, momentum, consistency, created_at, resolved } = alert
  const resolve  = useResolveAlert()
  const { isAdmin } = useAuth()

  return (
    <div className={cn(
      'flex items-start gap-4 rounded-lg px-5 py-4 border',
      resolved
        ? 'bg-surface border-container opacity-60'
        : 'bg-container border-transparent'
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-semibold text-sm text-max-text">{ticker_symbol}</span>
          <Badge className={cn('text-[10px]', TYPE_COLORS[type] ?? '')}>
            {TYPE_LABELS[type] ?? type}
          </Badge>
          {resolved && (
            <Badge className="text-[10px] bg-surface-low text-muted">
              Resolved
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2 text-[11px] text-subtle font-mono">
          <span>S: {sentiment?.toFixed(2) ?? '—'}</span>
          <span>M: {momentum?.toFixed(2) ?? '—'}</span>
          <span>C: {consistency?.toFixed(2) ?? '—'}</span>
          <span className="text-muted">
            {created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true }) : ''}
          </span>
        </div>
      </div>

      {isAdmin && !resolved && (
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-subtle hover:text-signal-buy shrink-0"
          title="Mark resolved"
          onClick={() => resolve.mutate(id)}
          disabled={resolve.isPending}
        >
          <CheckCircle size={14} />
        </Button>
      )}
    </div>
  )
}
