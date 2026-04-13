import { cn } from '@/lib/utils'

export default function LiveDot({ className }) {
  return (
    <span className={cn('live-dot inline-block', className)} aria-label="Live" />
  )
}
