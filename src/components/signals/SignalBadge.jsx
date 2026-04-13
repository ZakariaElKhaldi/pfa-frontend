import { cn, signalClass } from '@/lib/utils'

export default function SignalBadge({ signal, size = 'sm' }) {
  if (!signal) return null

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-semibold rounded-full uppercase tracking-wider',
        signalClass(signal),
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-3 py-1 text-xs',
        size === 'lg' && 'px-4 py-1.5 text-sm',
      )}
    >
      {signal}
    </span>
  )
}
