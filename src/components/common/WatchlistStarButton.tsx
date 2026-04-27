import { Icons } from '@/components/design-system'

export interface WatchlistStarButtonProps {
  /** Whether the ticker is currently in the watchlist */
  active:    boolean
  symbol:    string
  onToggle:  (symbol: string, active: boolean) => void
  loading?:  boolean
  size?:     'sm' | 'md'
}

export function WatchlistStarButton({
  active,
  symbol,
  onToggle,
  loading,
  size = 'md',
}: WatchlistStarButtonProps) {
  const iconSize  = size === 'sm' ? 14 : 18
  const btnSize   = size === 'sm' ? 28 : 36
  const color     = active ? 'var(--warning)' : 'var(--on-surface-muted)'
  const label     = active ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={loading}
      onClick={() => onToggle(symbol, !active)}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          btnSize,
        height:         btnSize,
        borderRadius:   'var(--radius-full)',
        background:     active ? 'color-mix(in srgb, var(--warning) 12%, transparent)' : 'transparent',
        border:         'none',
        cursor:         loading ? 'not-allowed' : 'pointer',
        color,
        transition:     'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-spring)',
        opacity:        loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--warning) 18%, transparent)'
          ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'
        }
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = active
          ? 'color-mix(in srgb, var(--warning) 12%, transparent)'
          : 'transparent'
        ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
      }}
    >
      <Icons.Star
        size={iconSize}
        fill={active ? 'var(--warning)' : 'none'}
        aria-hidden
      />
    </button>
  )
}
