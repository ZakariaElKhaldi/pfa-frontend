import { useRef, useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'

export interface BeeswarmDatum {
  ticker: string
  bullishRatio: number   // 0–1
  postCount: number
}

interface Props {
  data: BeeswarmDatum[]
  height?: number
}

interface TooltipState {
  x: number
  y: number
  ticker: string
  ratio: number
  posts: number
}

const COLOR_BEARISH = 'hsl(4, 68%, 50%)'
const COLOR_NEUTRAL = 'hsl(38, 88%, 50%)'
const COLOR_BULLISH = 'hsl(158, 60%, 38%)'

const sentimentColor = d3.scaleLinear<string>()
  .domain([0, 0.4, 0.6, 1])
  .range([COLOR_BEARISH, COLOR_NEUTRAL, COLOR_NEUTRAL, COLOR_BULLISH])

export function D3SentimentBeeswarm({ data, height = 200 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [width, setWidth] = useState(800)

  // Responsive
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) setWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Radius scale based on post count
  const radiusScale = useMemo(() => {
    const maxPosts = d3.max(data, d => d.postCount) ?? 100
    return d3.scaleSqrt().domain([0, maxPosts]).range([4, 18])
  }, [data])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    if (data.length === 0 || width < 100) return

    const margin = { top: 20, right: 30, bottom: 35, left: 30 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    svg.attr('width', width).attr('height', height)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // X scale: bullish ratio 0 → 1
    const x = d3.scaleLinear().domain([0, 1]).range([0, innerW])

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(
        d3.axisBottom(x)
          .ticks(5)
          .tickFormat(d => `${(+d * 100).toFixed(0)}%`)
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', 'hsla(220,15%,45%,0.2)'))
      .call(g => g.selectAll('.tick text').attr('fill', 'hsl(220,10%,58%)').attr('font-size', '11px'))

    // Axis label
    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 30)
      .attr('fill', 'var(--on-surface-muted)')
      .attr('font-size', '11px')
      .attr('text-anchor', 'middle')
      .text('← Bearish          Bullish Ratio          Bullish →')

    // Reference lines at 40% and 60%
    for (const threshold of [0.4, 0.6]) {
      g.append('line')
        .attr('x1', x(threshold)).attr('x2', x(threshold))
        .attr('y1', 0).attr('y2', innerH)
        .attr('stroke', 'hsla(220,15%,45%,0.25)')
        .attr('stroke-dasharray', '4 3')
    }

    // Neutral zone label
    g.append('text')
      .attr('x', x(0.5))
      .attr('y', -6)
      .attr('fill', 'hsl(220,10%,58%)')
      .attr('font-size', '9px')
      .attr('text-anchor', 'middle')
      .attr('letter-spacing', '0.06em')
      .text('NEUTRAL ZONE')

    // Force simulation to prevent overlap
    type SimNode = BeeswarmDatum & { x: number; y: number; r: number }
    const nodes: SimNode[] = data.map(d => ({
      ...d,
      x: x(d.bullishRatio),
      y: innerH / 2,
      r: radiusScale(d.postCount),
    }))

    const simulation = d3.forceSimulation(nodes)
      .force('x', d3.forceX<SimNode>(d => x(d.bullishRatio)).strength(1))
      .force('y', d3.forceY<SimNode>(innerH / 2).strength(0.12))
      .force('collide', d3.forceCollide<SimNode>(d => d.r + 1.5).iterations(3))
      .stop()

    // Run simulation synchronously
    for (let i = 0; i < 120; i++) simulation.tick()

    // Clamp y values
    nodes.forEach(n => {
      n.y = Math.max(n.r, Math.min(innerH - n.r, n.y))
    })

    // Draw circles
    const circles = g.selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 0)
      .attr('fill', d => sentimentColor(d.bullishRatio) as string)
      .attr('stroke', 'rgba(0,0,0,0.15)')
      .attr('stroke-width', 0.5)
      .attr('cursor', 'pointer')
      .style('opacity', 0.85)

    // Animate in
    circles.transition()
      .duration(500)
      .delay((_d, i) => i * 20)
      .attr('r', d => d.r)

    // Ticker labels for large dots
    g.selectAll('.ticker-label')
      .data(nodes.filter(n => n.r >= 10))
      .enter()
      .append('text')
      .attr('class', 'ticker-label')
      .attr('x', d => d.x)
      .attr('y', d => d.y + 1)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', 'rgba(0,0,0,0.7)')
      .attr('font-size', '9px')
      .attr('font-weight', '700')
      .attr('font-family', 'var(--font-mono)')
      .attr('pointer-events', 'none')
      .text(d => d.ticker)
      .style('opacity', 0)
      .transition().duration(400).delay((_d, i) => 300 + i * 30)
      .style('opacity', 1)

    // Hover
    circles
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .attr('stroke', 'var(--on-surface)')
          .attr('stroke-width', 2)
          .style('opacity', 1)
        const [mx, my] = d3.pointer(event, containerRef.current)
        setTooltip({ x: mx, y: my, ticker: d.ticker, ratio: d.bullishRatio, posts: d.postCount })
      })
      .on('mouseleave', function() {
        d3.select(this)
          .attr('stroke', 'rgba(0,0,0,0.15)')
          .attr('stroke-width', 0.5)
          .style('opacity', 0.85)
        setTooltip(null)
      })

  }, [data, width, height, radiusScale])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} />
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: Math.min(tooltip.x + 12, width - 160),
          top: tooltip.y - 10,
          background: 'var(--surface-container-high)',
          border: '1px solid var(--outline-variant)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-label-sm)',
          pointerEvents: 'none',
          zIndex: 10,
          minWidth: 130,
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{tooltip.ticker}</div>
          <div style={{ color: sentimentColor(tooltip.ratio) as string, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {(tooltip.ratio * 100).toFixed(0)}% bullish
          </div>
          <div style={{ color: 'var(--on-surface-muted)' }}>
            {tooltip.posts} posts
          </div>
        </div>
      )}
    </div>
  )
}
