import { useEffect, useRef } from 'react'
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts'
import { useLivePrice } from '@/hooks/useLivePrice'
import LiveDot from '@/components/shared/LiveDot'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

const CHART_COLORS = {
  background:   '#0F172A',
  text:         '#94A3B8',
  grid:         '#1F2937',
  bullCandle:   '#00E676',
  bearCandle:   '#FF5252',
  bullWick:     '#00E676',
  bearWick:     '#FF5252',
  crosshair:    '#475569',
}

export default function CandlestickChart({ symbol, data, isLoading }) {
  const containerRef = useRef(null)
  const chartRef     = useRef(null)
  const seriesRef    = useRef(null)

  /* Build chart once */
  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: CHART_COLORS.background },
        textColor:  CHART_COLORS.text,
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines:  { color: CHART_COLORS.grid },
        horzLines:  { color: CHART_COLORS.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: CHART_COLORS.crosshair, labelBackgroundColor: '#334155' },
        horzLine: { color: CHART_COLORS.crosshair, labelBackgroundColor: '#334155' },
      },
      rightPriceScale: {
        borderVisible:  false,
        textColor:      CHART_COLORS.text,
      },
      timeScale: {
        borderVisible:  false,
        timeVisible:    true,
        secondsVisible: false,
      },
      handleScroll:  true,
      handleScale:   true,
    })

    const series = chart.addCandlestickSeries({
      upColor:      CHART_COLORS.bullCandle,
      downColor:    CHART_COLORS.bearCandle,
      borderUpColor:   CHART_COLORS.bullWick,
      borderDownColor: CHART_COLORS.bearWick,
      wickUpColor:     CHART_COLORS.bullWick,
      wickDownColor:   CHART_COLORS.bearWick,
    })

    chartRef.current  = chart
    seriesRef.current = series

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: containerRef.current.clientWidth })
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
    }
  }, [])

  /* Load historical data */
  useEffect(() => {
    if (!seriesRef.current || !data?.length) return
    seriesRef.current.setData(data)
    chartRef.current?.timeScale().fitContent()
  }, [data])

  /* Subscribe to live ticks */
  useLivePrice(symbol, (tick) => {
    seriesRef.current?.update(tick)
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold text-[--color-max-text] uppercase">{symbol}</span>
        <div className="flex items-center gap-1.5">
          <LiveDot />
          <span className="text-[10px] text-[--color-subtle]">Live</span>
        </div>
      </div>
      <div className="relative rounded-lg overflow-hidden" style={{ height: 360 }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[--color-surface] z-10">
            <LoadingSpinner size={24} />
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  )
}
