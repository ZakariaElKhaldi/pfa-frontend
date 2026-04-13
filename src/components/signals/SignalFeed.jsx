import { useLatestSignals } from '@/hooks/useSignals'
import SignalCard from './SignalCard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import LiveDot from '@/components/shared/LiveDot'
import { Zap } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

/**
 * Renders the latest signal list.
 * Callers are responsible for mounting useSignalStream() so a single
 * WebSocket connection is shared across the page.
 */
export default function SignalFeed({ limit = 20 }) {
  const { data: signals, isLoading, error } = useLatestSignals(limit)

  if (isLoading) return (
    <div className="flex justify-center py-8">
      <LoadingSpinner size={20} />
    </div>
  )

  if (error) return (
    <EmptyState icon={Zap} title="Failed to load signals" />
  )

  if (!signals?.length) return (
    <EmptyState icon={Zap} title="No signals yet" description="Signals appear here in real-time." />
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <LiveDot />
        <span className="text-xs text-[--color-subtle]">Live feed</span>
      </div>
      <ScrollArea className="h-[480px] pr-1">
        <div className="flex flex-col gap-2">
          {signals.map((s) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
