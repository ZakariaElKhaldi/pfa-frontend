import { cn } from '@/lib/utils'

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3 py-16 text-center',
      className
    )}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-[--color-surface-low] flex items-center justify-center text-[--color-muted]">
          <Icon size={22} />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-[--color-secondary]">{title}</p>
        {description && (
          <p className="text-xs text-[--color-subtle] mt-1 max-w-xs">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
