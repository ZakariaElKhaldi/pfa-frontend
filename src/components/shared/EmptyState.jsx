import { cn } from '@/lib/utils'

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3 py-16 text-center',
      className
    )}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-container flex items-center justify-center text-muted">
          <Icon size={22} />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-secondary">{title}</p>
        {description && (
          <p className="text-xs text-subtle mt-1 max-w-xs">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
