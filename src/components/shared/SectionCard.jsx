import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

/**
 * Standard card used as a page section.
 * Provides consistent padding, background, and an optional heading row.
 */
export default function SectionCard({ title, action, children, className }) {
  return (
    <Card className={cn('bg-[--color-container] border-0 p-5 flex flex-col gap-4', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-xs font-semibold text-[--color-subtle] uppercase tracking-wider">
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
