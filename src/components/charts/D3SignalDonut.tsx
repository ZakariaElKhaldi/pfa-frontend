import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

export interface SignalDonutData {
  BUY: number
  SELL: number
  HOLD: number
}

interface Props {
  data: SignalDonutData
  size?: number
}

const COLORS: Record<string, string> = {
  BUY:  'hsl(158, 60%, 38%)',
  SELL: 'hsl(4, 68%, 50%)',
  HOLD: 'hsl(220, 10%, 52%)',
}

export function D3SignalDonut({ data, size = 220 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const total = data.BUY + data.SELL + data.HOLD

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    if (total === 0) return

    const radius = size / 2
    const innerRadius = radius * 0.62
    const outerRadius = radius - 8

    const g = svg
      .attr('width', size)
      .attr('height', size)
      .append('g')
      .attr('transform', `translate(${radius},${radius})`)

    const pie = d3.pie<[string, number]>()
      .value(d => d[1])
      .sort(null)
      .padAngle(0.03)

    const arc = d3.arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(4)

    const arcHover = d3.arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(innerRadius - 2)
      .outerRadius(outerRadius + 4)
      .cornerRadius(4)

    const entries: [string, number][] = [
      ['BUY', data.BUY],
      ['SELL', data.SELL],
      ['HOLD', data.HOLD],
    ].filter(d => d[1] > 0) as [string, number][]

    const arcs = g.selectAll('path')
      .data(pie(entries))
      .enter()
      .append('path')
      .attr('fill', d => COLORS[d.data[0]] ?? '#666')
      .attr('stroke', 'none')
      .attr('cursor', 'pointer')
      .style('transition', 'opacity 0.15s')

    // Animate in
    arcs.transition()
      .duration(600)
      .attrTween('d', function(d) {
        const i = d3.interpolate({ startAngle: d.startAngle, endAngle: d.startAngle } as d3.PieArcDatum<[string, number]>, d)
        return (t: number) => arc(i(t)) ?? ''
      })

    // Hover interactions
    arcs
      .on('mouseenter', function(_event, d) {
        setHovered(d.data[0])
        d3.select(this)
          .transition().duration(150)
          .attr('d', d2 => arcHover(d2 as d3.PieArcDatum<[string, number]>) ?? '')
      })
      .on('mouseleave', function() {
        setHovered(null)
        d3.select(this)
          .transition().duration(150)
          .attr('d', d2 => arc(d2 as d3.PieArcDatum<[string, number]>) ?? '')
      })

  }, [data, size, total])

  const centerLabel = hovered ?? 'Total'
  const centerValue = hovered ? data[hovered as keyof SignalDonutData] : total
  const centerPct = total > 0 && hovered ? ((centerValue / total) * 100).toFixed(0) + '%' : ''
  const centerColor = hovered ? COLORS[hovered] : 'var(--on-surface)'

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg ref={svgRef} />
      {/* Center text */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        <span style={{
          fontSize: 'var(--text-display-sm)', fontWeight: 800,
          color: centerColor, fontVariantNumeric: 'tabular-nums',
          lineHeight: 1, transition: 'color 0.15s',
        }}>
          {centerValue}
        </span>
        <span style={{
          fontSize: 'var(--text-label-sm)', fontWeight: 600,
          color: 'var(--on-surface-muted)', textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {centerLabel}
        </span>
        {centerPct && (
          <span style={{
            fontSize: 'var(--text-mono-sm)', fontFamily: 'var(--font-mono)',
            color: centerColor, fontWeight: 700,
          }}>
            {centerPct}
          </span>
        )}
      </div>
    </div>
  )
}
