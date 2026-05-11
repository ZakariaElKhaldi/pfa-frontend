import { useMemo } from 'react'
import { PriceChart } from '@/components/charts/PriceChart'
import { useOHLCData } from '@/hooks/useOHLCData'
import { useMarketClock } from '@/hooks/useMarketClock'
import { SectionLabel } from '@/components/design-system/SectionLabel'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/layout/ErrorState'

export function FeaturedMarketChart({ symbol = 'AAPL' }: { symbol?: string }) {
  const { bars, loading, error, status } = useOHLCData(symbol)
  const { clock } = useMarketClock()

  const lastBar = bars.length > 0 ? bars[bars.length - 1] : null
  const prevBar = bars.length > 1 ? bars[bars.length - 2] : null
  
  const change = useMemo(() => {
    if (!lastBar || !prevBar) return null
    return lastBar.close - prevBar.close
  }, [lastBar, prevBar])

  const changePct = useMemo(() => {
    if (!lastBar || !prevBar || prevBar.close === 0) return null
    return (change! / prevBar.close) * 100
  }, [change, prevBar])

  return (
    <div className="card stack stack-2">
      <div className="cluster cluster-3" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionLabel>Market Overview ({symbol})</SectionLabel>
        
        <div className="cluster cluster-2" style={{ alignItems: 'center' }}>
          {lastBar && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-body-lg)', fontWeight: 600 }}>
                ${lastBar.close.toFixed(2)}
              </span>
              {changePct !== null && (
                <span style={{ 
                  fontSize: 'var(--text-body-sm)', 
                  fontWeight: 500,
                  color: change! >= 0 ? 'var(--positive)' : 'var(--negative)' 
                }}>
                  {change! >= 0 ? '+' : ''}{change!.toFixed(2)} ({change! >= 0 ? '+' : ''}{changePct.toFixed(2)}%)
                </span>
              )}
            </div>
          )}
          
          <div className="cluster cluster-1" style={{ alignItems: 'center', fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', marginLeft: 'var(--space-4)' }}>
            <span
              aria-hidden
              style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                background:
                  clock && !clock.is_open
                    ? 'var(--on-surface-muted)'
                    : status === 'connected'
                    ? 'var(--secondary)'
                    : status === 'unavailable'
                      ? 'var(--on-surface-muted)'
                      : 'var(--warning)',
                animation: clock && !clock.is_open
                  ? 'none'
                  : status === 'connected' || status === 'connecting' || status === 'disconnected'
                  ? 'ws-pulse 1.8s ease-in-out infinite'
                  : 'none',
              }}
            />
            <span>
              {clock && !clock.is_open
                ? 'Market closed'
                : status === 'connected'
                  ? 'Live'
                  : status === 'unavailable'
                    ? 'Live unavailable'
                    : 'Reconnecting…'}
            </span>
          </div>
        </div>
      </div>

      {loading && <Skeleton className="w-full" style={{ height: 320, borderRadius: 'var(--radius-md)' }} />}
      {error && !loading && <ErrorState message={error} />}
      {!loading && !error && bars.length > 0 && (
        <PriceChart 
          data={bars} 
          height={320} 
          showVolume 
          showSMA 
          showBollinger={false} 
          showCrosshair 
        />
      )}
      {!loading && !error && bars.length === 0 && (
        <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-muted)' }}>
          No data available
        </div>
      )}
    </div>
  )
}
