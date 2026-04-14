import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-container', className)}
      {...props}
    />
  )
}

export { Skeleton }
