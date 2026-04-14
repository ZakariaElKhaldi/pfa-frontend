import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

/**
 * Standard card used as a page section.
 * Provides consistent padding, background, and an optional heading row.
 */
export default function SectionCard({ title, action, children, className }) {
  return (
    <Card className={cn('bg-container border border-ghost p-6 flex flex-col gap-4', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between">
          {title && (
            <h2 className="text-[11px] font-semibold text-subtle uppercase tracking-wide">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </Card>
  )
}
