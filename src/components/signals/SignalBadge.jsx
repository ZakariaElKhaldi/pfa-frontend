import { cn, signalClass } from '@/lib/utils'

export default function SignalBadge({ signal, size = 'sm' }) {
  if (!signal) return null

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-semibold rounded-md uppercase tracking-wide leading-none',
        signalClass(signal),
        size === 'sm' && 'px-2 py-1 text-[10px]',
        size === 'md' && 'px-2.5 py-1 text-[11px]',
        size === 'lg' && 'px-3 py-1.5 text-xs',
      )}
    >
      {signal}
    </span>
  )
}
