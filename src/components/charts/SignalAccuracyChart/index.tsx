import { useEffect, useRef, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { M, C1H, C24H, CMUT, CGRID } from './constants'
import { roll } from './utils'
import { ChartTooltip } from './ChartTooltip'
import type { AccuracyRecord, SignalAccuracyChartProps, RolledPt, Tip } from './types'

export type { AccuracyRecord, SignalAccuracyChartProps }

export function SignalAccuracyChart({ data, rollWindow = 12, width = 640, height = 260 }: SignalAccuracyChartProps) {
  const ref = useRef<SVGSVGElement>(null)
  const [tip, setTip] = useState<Tip | null>(null)

  const parsed = useMemo(() =>
    [...data]
      .map(d => ({ date: new Date(d.evaluatedAt), acc1h: d.accuracy1h, acc24h: d.accuracy24h }))
      .sort((a, b) => +a.date - +b.date),
    [data],
  )

  const rolled1h  = useMemo(() => roll(parsed.map(d => ({ date: d.date, v: d.acc1h  })), rollWindow), [parsed, rollWindow])
  const rolled24h = useMemo(() => roll(parsed.map(d => ({ date: d.date, v: d.acc24h })), rollWindow), [parsed, rollWindow])
  const v1h  = useMemo(() => rolled1h.filter((d): d is RolledPt  => d !== null), [rolled1h])
  const v24h = useMemo(() => rolled24h.filter((d): d is RolledPt => d !== null), [rolled24h])

  const iW = width  - M.left - M.right
  const iH = height - M.top  - M.bottom

  useEffect(() => {
    if (!ref.current || parsed.length === 0) return
    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()
    const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`)

    const x = d3.scaleTime().domain(d3.extent(parsed, d => d.date) as [Date, Date]).range([0, iW])
    const y = d3.scaleLinear().domain([0, 1]).range([iH, 0])

    g.append('g')
      .selectAll<SVGLineElement, number>('line.hg')
      .data([0, 0.25, 0.5, 0.75, 1.0])
      .join('line')
        .attr('x1', 0).attr('x2', iW)
        .attr('y1', v => y(v)).attr('y2', v => y(v))
        .attr('stroke', v => v === 0.5 ? 'hsla(220,15%,45%,0.45)' : CGRID)
        .attr('stroke-dasharray', v => v === 0.5 ? '8,5' : '3,3')
        .attr('stroke-width', v => v === 0.5 ? 1.5 : 1)

    g.append('text').attr('x', iW + 4).attr('y', y(0.5) + 4).attr('fill', CMUT).attr('font-size', 10).text('50%')

    const curve  = d3.curveCatmullRom.alpha(0.5)
    const areaGen = d3.area<RolledPt>().x(d => x(d.date)).y0(d => y(d.lo)).y1(d => y(d.hi)).curve(curve)
    const lineGen = d3.line<RolledPt>().x(d => x(d.date)).y(d => y(d.p)).curve(curve)

    ;([{ pts: v1h, col: C1H }, { pts: v24h, col: C24H }] as const).forEach(({ pts, col }) => {
      if (pts.length < 2) return
      g.append('path').datum(pts).attr('fill', col).attr('fill-opacity', 0.12).attr('d', d => areaGen(d) ?? '')
      g.append('path').datum(pts).attr('fill', 'none').attr('stroke', col).attr('stroke-width', 2.5).attr('stroke-linejoin', 'round').attr('d', d => lineGen(d) ?? '')
    })

    g.append('g').attr('transform', `translate(0,${iH})`).call(d3.axisBottom(x).ticks(6).tickSize(0).tickPadding(8))
      .call(gg => gg.select('.domain').attr('stroke', CGRID))
      .call(gg => gg.selectAll<SVGTextElement, unknown>('text').attr('fill', CMUT).attr('font-size', 11))

    g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(v => `${(+v * 100).toFixed(0)}%`).tickSize(0).tickPadding(6))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll<SVGTextElement, unknown>('text').attr('fill', CMUT).attr('font-size', 11))

    const bx1  = d3.bisector<RolledPt, Date>(d => d.date).left
    const bx24 = d3.bisector<RolledPt, Date>(d => d.date).left
    const vline = g.append('line').attr('y1', 0).attr('y2', iH).attr('stroke', CMUT).attr('stroke-width', 1).attr('stroke-dasharray', '4,3').attr('pointer-events', 'none').attr('display', 'none')

    g.append('rect').attr('width', iW).attr('height', iH).attr('fill', 'none').attr('pointer-events', 'all')
      .on('mousemove', function (event) {
        const [mx] = d3.pointer(event)
        vline.attr('display', null).attr('x1', mx).attr('x2', mx)
        const hd  = x.invert(mx)
        const n1  = v1h[Math.min(bx1(v1h, hd), v1h.length - 1)]
        const n24 = v24h[Math.min(bx24(v24h, hd), v24h.length - 1)]
        setTip({ svgX: M.left + mx, svgY: M.top + (n1 ? y(n1.p) : iH / 2), p1h: n1?.p ?? null, p24h: n24?.p ?? null, label: hd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) })
      })
      .on('mouseleave', function () { vline.attr('display', 'none'); setTip(null) })
  }, [parsed, v1h, v24h, iW, iH])

  if (data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CMUT, fontSize: 'var(--text-body-sm)' }}>No accuracy data yet</div>
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-2)', flexWrap: 'wrap', fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-variant)' }}>
        {([{ col: C1H, label: '1-hour accuracy' }, { col: C24H, label: '24-hour accuracy' }] as const).map(({ col, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width={14} height={4} aria-hidden><rect width={14} height={3} rx={1.5} fill={col} /></svg>
            {label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', color: 'var(--on-surface-muted)', fontStyle: 'italic' }}>
          Wilson 90% CI · {rollWindow}-pt window
        </span>
      </div>
      <svg ref={ref} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }} aria-label="Signal prediction accuracy trend" />
      {tip && <ChartTooltip tip={tip} width={width} height={height} />}
    </div>
  )
}
