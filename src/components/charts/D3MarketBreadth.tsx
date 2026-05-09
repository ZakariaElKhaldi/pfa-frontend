import { useRef, useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'

export interface SignalEntry {
  signal: 'BUY' | 'SELL' | 'HOLD'
  created_at: string
}

interface Props {
  data: SignalEntry[]
  days?: number
  height?: number
}

/**
 * Market breadth area chart — shows % of signals that are BUY vs SELL over time.
 * When the green area dominates, the market is broadly bullish. When red takes over,
 * it's a risk-off environment. The crossover points are key inflection moments.
 */
export function D3MarketBreadth({ data, days = 30, height = 180 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(800)
  const [hoverInfo, setHoverInfo] = useState<{ x: number; date: string; buy: number; sell: number; hold: number } | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(e.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const breadthData = useMemo(() => {
    const cutoff = Date.now() - days * 86_400_000
    const filtered = data.filter(d => new Date(d.created_at).getTime() >= cutoff)

    const byDay: Record<string, { BUY: number; SELL: number; HOLD: number }> = {}
    for (const d of filtered) {
      const day = new Date(d.created_at).toISOString().slice(0, 10)
      if (!byDay[day]) byDay[day] = { BUY: 0, SELL: 0, HOLD: 0 }
      byDay[day][d.signal]++
    }

    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => {
        const total = counts.BUY + counts.SELL + counts.HOLD
        return {
          date,
          buyPct: total > 0 ? counts.BUY / total : 0,
          sellPct: total > 0 ? counts.SELL / total : 0,
          holdPct: total > 0 ? counts.HOLD / total : 0,
          buy: counts.BUY,
          sell: counts.SELL,
          hold: counts.HOLD,
          total,
        }
      })
  }, [data, days])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    if (breadthData.length < 2) return

    const margin = { top: 12, right: 16, bottom: 28, left: 36 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    svg.attr('width', width).attr('height', height)
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scalePoint<string>()
      .domain(breadthData.map(d => d.date))
      .range([0, innerW])

    const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0])

    // Grid lines
    g.selectAll('.grid-line')
      .data([0.25, 0.5, 0.75])
      .enter().append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', 'hsla(220,15%,45%,0.15)')
      .attr('stroke-dasharray', '3 3')

    // 50% reference
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', y(0.5)).attr('y2', y(0.5))
      .attr('stroke', 'hsla(220,15%,45%,0.4)')
      .attr('stroke-dasharray', '6 3')

    // Stacked areas: sell (bottom) → hold (middle) → buy (top)
    const areaSell = d3.area<typeof breadthData[0]>()
      .x(d => x(d.date) ?? 0)
      .y0(innerH)
      .y1(d => y(d.sellPct))
      .curve(d3.curveMonotoneX)

    const areaHold = d3.area<typeof breadthData[0]>()
      .x(d => x(d.date) ?? 0)
      .y0(d => y(d.sellPct))
      .y1(d => y(d.sellPct + d.holdPct))
      .curve(d3.curveMonotoneX)

    const areaBuy = d3.area<typeof breadthData[0]>()
      .x(d => x(d.date) ?? 0)
      .y0(d => y(d.sellPct + d.holdPct))
      .y1(d => y(1))
      .curve(d3.curveMonotoneX)

    g.append('path').datum(breadthData).attr('d', areaSell).attr('fill', 'hsl(4, 68%, 50%)').attr('opacity', 0.6)
    g.append('path').datum(breadthData).attr('d', areaHold).attr('fill', 'hsl(220, 10%, 52%)').attr('opacity', 0.4)
    g.append('path').datum(breadthData).attr('d', areaBuy).attr('fill', 'hsl(158, 60%, 38%)').attr('opacity', 0.6)

    // Buy % line on top
    const lineBuy = d3.line<typeof breadthData[0]>()
      .x(d => x(d.date) ?? 0)
      .y(d => y(1 - d.buyPct))
      .curve(d3.curveMonotoneX)

    g.append('path').datum(breadthData).attr('d', lineBuy)
      .attr('fill', 'none').attr('stroke', 'hsl(158, 60%, 35%)').attr('stroke-width', 2)

    // X axis
    const showEvery = Math.max(1, Math.floor(breadthData.length / 6))
    g.append('g').attr('transform', `translate(0,${innerH})`)
      .call(
        d3.axisBottom(x)
          .tickValues(breadthData.filter((_d, i) => i % showEvery === 0).map(d => d.date))
          .tickFormat(d => {
            const dt = new Date(d + 'T00:00:00')
            return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          })
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove())
      .call(g => g.selectAll('.tick text').attr('fill', 'hsl(220,10%,58%)').attr('font-size', '10px'))

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => `${(+d * 100).toFixed(0)}%`))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove())
      .call(g => g.selectAll('.tick text').attr('fill', 'hsl(220,10%,58%)').attr('font-size', '10px'))

    // Hover overlay
    const overlay = g.append('rect')
      .attr('width', innerW).attr('height', innerH)
      .attr('fill', 'transparent').attr('cursor', 'crosshair')

    const hoverLine = g.append('line')
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', 'var(--on-surface-muted)').attr('stroke-width', 1)
      .attr('stroke-dasharray', '3 2')
      .style('display', 'none')

    overlay.on('mousemove', function(event) {
      const [mx] = d3.pointer(event)
      const domain = x.domain()
      const step = x.step?.() ?? innerW / domain.length
      const idx = Math.round(mx / step)
      if (idx < 0 || idx >= domain.length) return
      const d = breadthData[idx]
      const px = x(d.date) ?? 0
      hoverLine.attr('x1', px).attr('x2', px).style('display', null)
      setHoverInfo({ x: px + margin.left, date: d.date, buy: d.buy, sell: d.sell, hold: d.hold })
    })
    overlay.on('mouseleave', () => {
      hoverLine.style('display', 'none')
      setHoverInfo(null)
    })

  }, [breadthData, width, height])

  if (breadthData.length < 2) return null

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} />
      {hoverInfo && (
        <div style={{
          position: 'absolute', left: Math.min(hoverInfo.x + 10, width - 140), top: 8,
          background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)',
          borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-label-sm)', pointerEvents: 'none', zIndex: 10, boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ color: 'var(--on-surface-muted)', marginBottom: 2 }}>
            {new Date(hoverInfo.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div style={{ color: 'hsl(158,60%,38%)', fontWeight: 700 }}>BUY: {hoverInfo.buy}</div>
          <div style={{ color: 'hsl(220,10%,52%)' }}>HOLD: {hoverInfo.hold}</div>
          <div style={{ color: 'hsl(4,68%,50%)', fontWeight: 700 }}>SELL: {hoverInfo.sell}</div>
        </div>
      )}
    </div>
  )
}
