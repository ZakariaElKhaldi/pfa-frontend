import { useRef, useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'

export interface SignalEntry {
  ticker_symbol: string
  signal: 'BUY' | 'SELL' | 'HOLD'
  created_at: string
}

interface Props {
  data: SignalEntry[]
  days?: number
  height?: number
}

const SIG_COLOR: Record<string, string> = {
  BUY:  'hsl(158, 60%, 38%)',
  SELL: 'hsl(4, 68%, 50%)',
  HOLD: 'hsl(38, 50%, 48%)',
}

interface TooltipState { x: number; y: number; ticker: string; date: string; signal: string }

/**
 * D3 heatmap grid: rows = tickers, columns = dates, cell color = dominant signal.
 * Gives an analyst a bird's-eye view of the entire market signal history.
 */
export function D3SignalHeatmap({ data, days = 14, height: fixedHeight }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [width, setWidth] = useState(800)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(e.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Build grid data: { ticker → { dateStr → dominant signal } }
  const { tickers, dates, grid } = useMemo(() => {
    const cutoff = Date.now() - days * 86_400_000
    const filtered = data.filter(d => new Date(d.created_at).getTime() >= cutoff)

    // Count signals per ticker per day
    const counts: Record<string, Record<string, Record<string, number>>> = {}
    for (const d of filtered) {
      const day = new Date(d.created_at).toISOString().slice(0, 10)
      if (!counts[d.ticker_symbol]) counts[d.ticker_symbol] = {}
      if (!counts[d.ticker_symbol][day]) counts[d.ticker_symbol][day] = { BUY: 0, SELL: 0, HOLD: 0 }
      counts[d.ticker_symbol][day][d.signal]++
    }

    // Dominant signal per cell
    const grid: Record<string, Record<string, string>> = {}
    for (const [ticker, byDay] of Object.entries(counts)) {
      grid[ticker] = {}
      for (const [day, sigs] of Object.entries(byDay)) {
        const dominant = Object.entries(sigs).sort((a, b) => b[1] - a[1])[0]
        grid[ticker][day] = dominant[0]
      }
    }

    // Sort tickers by total BUY ratio (most bullish at top)
    const tickers = Object.keys(counts).sort((a, b) => {
      const aTotal = Object.values(counts[a]).reduce((s, d) => s + (d.BUY ?? 0), 0)
      const bTotal = Object.values(counts[b]).reduce((s, d) => s + (d.BUY ?? 0), 0)
      return bTotal - aTotal
    })

    // Generate date columns
    const dates: string[] = []
    for (let i = days - 1; i >= 0; i--) {
      dates.push(new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10))
    }

    return { tickers, dates, grid }
  }, [data, days])

  const cellSize = Math.min(28, Math.max(14, (width - 70) / dates.length))
  const rowH = Math.min(22, cellSize)
  const marginLeft = 56
  const marginTop = 24
  const computedH = fixedHeight ?? marginTop + tickers.length * rowH + 10

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    if (tickers.length === 0 || dates.length === 0) return

    svg.attr('width', width).attr('height', computedH)
    const g = svg.append('g').attr('transform', `translate(${marginLeft},${marginTop})`)

    // Date labels (top)
    const showEvery = Math.max(1, Math.floor(dates.length / 7))
    g.selectAll('.date-label')
      .data(dates.filter((_d, i) => i % showEvery === 0))
      .enter().append('text')
      .attr('x', d => dates.indexOf(d) * cellSize + cellSize / 2)
      .attr('y', -6)
      .attr('text-anchor', 'middle')
      .attr('fill', 'hsl(220,10%,58%)')
      .attr('font-size', '9px')
      .text(d => {
        const dt = new Date(d + 'T00:00:00')
        return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })

    // Ticker labels (left)
    g.selectAll('.ticker-label')
      .data(tickers)
      .enter().append('text')
      .attr('x', -6)
      .attr('y', (_d, i) => i * rowH + rowH / 2 + 1)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'central')
      .attr('fill', 'var(--on-surface-muted)')
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono)')
      .attr('font-weight', '600')
      .text(d => d)

    // Cells
    for (let ri = 0; ri < tickers.length; ri++) {
      const ticker = tickers[ri]
      for (let ci = 0; ci < dates.length; ci++) {
        const date = dates[ci]
        const sig = grid[ticker]?.[date]
        g.append('rect')
          .attr('x', ci * cellSize)
          .attr('y', ri * rowH)
          .attr('width', cellSize - 1.5)
          .attr('height', rowH - 1.5)
          .attr('rx', 3)
          .attr('fill', sig ? SIG_COLOR[sig] : 'var(--surface-container-high)')
          .attr('opacity', sig ? 0.85 : 0.3)
          .attr('cursor', sig ? 'pointer' : 'default')
          .on('mouseenter', function(event) {
            if (!sig) return
            d3.select(this).attr('opacity', 1).attr('stroke', 'var(--on-surface)').attr('stroke-width', 1.5)
            const [mx, my] = d3.pointer(event, containerRef.current)
            setTooltip({ x: mx, y: my, ticker, date, signal: sig })
          })
          .on('mouseleave', function() {
            d3.select(this).attr('opacity', sig ? 0.85 : 0.3).attr('stroke', 'none')
            setTooltip(null)
          })
      }
    }
  }, [tickers, dates, grid, width, computedH, cellSize, rowH])

  if (tickers.length === 0) return null

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <svg ref={svgRef} />
      {tooltip && (
        <div style={{
          position: 'absolute', left: Math.min(tooltip.x + 12, width - 150), top: tooltip.y - 8,
          background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)',
          borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-label-sm)', pointerEvents: 'none', zIndex: 10, boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{tooltip.ticker}</div>
          <div style={{ color: 'var(--on-surface-muted)' }}>{new Date(tooltip.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          <div style={{ color: SIG_COLOR[tooltip.signal], fontWeight: 700 }}>{tooltip.signal}</div>
        </div>
      )}
    </div>
  )
}
