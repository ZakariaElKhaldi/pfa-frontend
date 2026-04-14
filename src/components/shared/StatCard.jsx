import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export default function StatCard({ label, value, sub, icon: Icon, trend, className }) {
  const trendColor =
    trend > 0 ? 'text-signal-buy' :
    trend < 0 ? 'text-signal-sell' :
    'text-subtle'

  return (
    <Card className={cn(
      'bg-container border-0 p-4 flex flex-col gap-2',
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-subtle uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <span className="text-muted">
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="font-data text-2xl font-semibold text-max-text">
        {value}
      </div>
      {(sub || trend != null) && (
        <div className={cn('text-xs flex items-center gap-1', trendColor)}>
          {trend != null && (
            <span>{trend >= 0 ? '▲' : '▼'}</span>
          )}
          <span className="text-subtle">{sub}</span>
        </div>
      )}
    </Card>
  )
}
