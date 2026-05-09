import { Skeleton } from '@/components/ui/skeleton'

export interface SkeletonGridProps {
  /** Number of skeleton tiles to render */
  count?: number
  /** Minimum width of each tile (CSS value) */
  minWidth?: string
  /** Fixed height of each tile (CSS value) */
  height?: string
  /** Gap between tiles (CSS value) */
  gap?: string
  /** Optional extra className on the grid wrapper */
  className?: string
}

/**
 * Responsive auto-fill skeleton grid — used as a loading placeholder
 * for all card/tile grids (Watchlist, Alerts, Trending, etc.).
 *
 * Matches the same `repeat(auto-fill, minmax(..., 1fr))` pattern used
 * by the actual grids so the layout doesn't shift when data arrives.
 */
export function SkeletonGrid({
  count     = 4,
  minWidth  = '180px',
  height    = '96px',
  gap       = 'var(--space-3)',
  className,
}: SkeletonGridProps) {
  return (
    <div
      className={className}
      style={{
        display:             'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
        gap,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          style={{
            height,
            borderRadius: 'var(--radius-lg)',
            // Stagger the shimmer opacity slightly per tile
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  )
}
