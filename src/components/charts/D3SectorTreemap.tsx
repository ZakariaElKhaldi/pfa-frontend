import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

export interface SectorTreemapItem {
  sector: string
  ticker_count: number
  avg_signal: number        // normalized_index avg, -1 to 1
  avg_sentiment: number     // -1 to 1
}

interface Props {
  data: SectorTreemapItem[]
  height?: number
}

// Diverging color scale: red (bearish) → neutral → green (bullish)
const colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([-0.4, 0.4])

interface TooltipState {
  x: number
  y: number
  sector: string
  tickers: number
  signal: number
  sentiment: number
}

export function D3SectorTreemap({ data, height = 300 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [width, setWidth] = useState(800)

  // Responsive width
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    if (data.length === 0 || width < 100) return

    // Build hierarchy
    const root = d3.hierarchy({
      name: 'root',
      children: data.map(d => ({
        name: d.sector,
        value: Math.max(d.ticker_count, 1),
        signal: d.avg_signal,
        sentiment: d.avg_sentiment,
        tickers: d.ticker_count,
      })),
    })
    .sum(d => (d as any).value ?? 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

    const treemap = d3.treemap<any>()
      .size([width, height])
      .padding(3)
      .round(true)

    treemap(root)

    const nodes = svg
      .attr('width', width)
      .attr('height', height)
      .selectAll('g')
      .data(root.leaves() as d3.HierarchyRectangularNode<any>[])
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`)

    // Rects
    nodes.append('rect')
      .attr('width', d => Math.max(0, d.x1 - d.x0))
      .attr('height', d => Math.max(0, d.y1 - d.y0))
      .attr('rx', 6)
      .attr('fill', d => colorScale((d.data as any).signal ?? 0))
      .attr('stroke', 'var(--surface-container)')
      .attr('stroke-width', 1.5)
      .attr('cursor', 'pointer')
      .style('opacity', 0)
      .transition().duration(500).delay((_d, i) => i * 60)
      .style('opacity', 1)

    // Labels — only if cell is large enough
    nodes.each(function(d) {
      const w = d.x1 - d.x0
      const h = d.y1 - d.y0
      const g = d3.select(this)
      const dd = d.data as any

      if (w > 60 && h > 40) {
        g.append('text')
          .attr('x', 8).attr('y', 18)
          .attr('fill', 'rgba(0,0,0,0.75)')
          .attr('font-size', '11px')
          .attr('font-weight', '600')
          .attr('letter-spacing', '0.04em')
          .text(dd.name.length > 16 ? dd.name.slice(0, 14) + '…' : dd.name)
      }

      if (w > 70 && h > 55) {
        g.append('text')
          .attr('x', 8).attr('y', 34)
          .attr('fill', 'rgba(0,0,0,0.55)')
          .attr('font-size', '10px')
          .text(`${dd.tickers} tickers`)
      }

      if (w > 70 && h > 70) {
        const sig = dd.signal ?? 0
        const pct = (sig * 100).toFixed(0)
        g.append('text')
          .attr('x', 8).attr('y', h - 8)
          .attr('fill', 'rgba(0,0,0,0.7)')
          .attr('font-size', '16px')
          .attr('font-weight', '800')
          .attr('font-family', 'var(--font-mono)')
          .text(`${sig >= 0 ? '+' : ''}${pct}%`)
      }
    })

    // Hover events
    nodes.selectAll('rect')
      .on('mouseenter', function(event, d) {
        const dd = (d as any).data
        d3.select(this).attr('stroke', 'var(--on-surface)').attr('stroke-width', 2)
        const [mx, my] = d3.pointer(event, containerRef.current)
        setTooltip({
          x: mx, y: my,
          sector: dd.name,
          tickers: dd.tickers,
          signal: dd.signal,
          sentiment: dd.sentiment,
        })
      })
      .on('mouseleave', function() {
        d3.select(this).attr('stroke', 'var(--surface-container)').attr('stroke-width', 1.5)
        setTooltip(null)
      })

  }, [data, width, height])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} />
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.x + 12,
          top: tooltip.y - 10,
          background: 'var(--surface-container-high)',
          border: '1px solid var(--outline-variant)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-label-sm)',
          pointerEvents: 'none',
          zIndex: 10,
          minWidth: 140,
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{tooltip.sector}</div>
          <div style={{ color: 'var(--on-surface-muted)' }}>{tooltip.tickers} tickers</div>
          <div style={{ color: tooltip.signal >= 0 ? 'hsl(158,60%,38%)' : 'hsl(4,68%,50%)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            Signal: {tooltip.signal >= 0 ? '+' : ''}{(tooltip.signal * 100).toFixed(1)}%
          </div>
          <div style={{ color: tooltip.sentiment >= 0 ? 'hsl(158,60%,38%)' : 'hsl(4,68%,50%)', fontFamily: 'var(--font-mono)' }}>
            Sentiment: {tooltip.sentiment >= 0 ? '+' : ''}{(tooltip.sentiment * 100).toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  )
}
