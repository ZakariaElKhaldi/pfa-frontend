import { useEffect, useRef, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { M, C_BULL, C_BEAR, C_PRICE, C_HOLD, CMUT, CGRID, SIG_COL } from './constants'
import { ChartTooltip } from './ChartTooltip'
import type { SentimentPriceChartProps, SentimentPricePoint, Tip } from './types'

export type { SentimentPricePoint, SentimentPriceChartProps }

export function SentimentPriceChart({ data, ticker, width = 720, height = 320 }: SentimentPriceChartProps) {
  const ref = useRef<SVGSVGElement>(null)
  const [tip, setTip] = useState<Tip | null>(null)

  const parsed = useMemo(() =>
    [...data].map(d => ({ ...d, date: new Date(d.time) })).sort((a, b) => +a.date - +b.date),
    [data],
  )

  const iW = width  - M.left - M.right
  const iH = height - M.top  - M.bottom

  useEffect(() => {
    if (!ref.current || parsed.length === 0) return
    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()
    const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`)

    const x      = d3.scaleTime().domain(d3.extent(parsed, d => d.date) as [Date, Date]).range([0, iW])
    const sMin   = Math.min(0, d3.min(parsed, d => d.sentimentScore) ?? -1)
    const sMax   = Math.max(0, d3.max(parsed, d => d.sentimentScore) ??  1)
    const sSym   = Math.max(Math.abs(sMin), Math.abs(sMax))
    const ySent  = d3.scaleLinear().domain([-sSym, sSym]).nice().range([iH, 0])
    const pMin   = d3.min(parsed, d => d.price) ?? 0
    const pMax   = d3.max(parsed, d => d.price) ?? 1
    const pPad   = (pMax - pMin) * 0.06
    const yPrice = d3.scaleLinear().domain([pMin - pPad, pMax + pPad]).range([iH, 0])

    const zeroFrac = ySent(0) / iH
    const defs = svg.append('defs')
    defs.append('linearGradient').attr('id', 'sent-fill').attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', M.left).attr('y1', M.top).attr('x2', M.left).attr('y2', M.top + iH)
      .selectAll('stop')
      .data([
        { off: '0%',                   col: C_BULL, op: 0.30 },
        { off: `${zeroFrac * 100}%`,   col: C_BULL, op: 0.04 },
        { off: `${zeroFrac * 100}%`,   col: C_BEAR, op: 0.04 },
        { off: '100%',                 col: C_BEAR, op: 0.30 },
      ])
      .join('stop').attr('offset', d => d.off).attr('stop-color', d => d.col).attr('stop-opacity', d => d.op)

    g.append('g').selectAll<SVGLineElement, number>('line.hg').data(ySent.ticks(6)).join('line')
      .attr('x1', 0).attr('x2', iW).attr('y1', v => ySent(v)).attr('y2', v => ySent(v))
      .attr('stroke', v => v === 0 ? 'hsla(220,15%,45%,0.50)' : CGRID)
      .attr('stroke-dasharray', v => v === 0 ? '6,4' : '3,3')
      .attr('stroke-width', v => v === 0 ? 1.5 : 1)

    const sentArea = d3.area<typeof parsed[0]>().x(d => x(d.date)).y0(ySent(0)).y1(d => ySent(d.sentimentScore)).curve(d3.curveCatmullRom.alpha(0.5))
    const sentLine = d3.line<typeof parsed[0]>().x(d => x(d.date)).y(d => ySent(d.sentimentScore)).curve(d3.curveCatmullRom.alpha(0.5))
    const priceLine = d3.line<typeof parsed[0]>().x(d => x(d.date)).y(d => yPrice(d.price)).curve(d3.curveCatmullRom.alpha(0.5))

    g.append('path').datum(parsed).attr('fill', 'url(#sent-fill)').attr('d', d => sentArea(d) ?? '')
    g.append('path').datum(parsed).attr('fill', 'none').attr('stroke', d3.interpolateRgb(C_BULL, C_BEAR)(0.5)).attr('stroke-width', 1.5).attr('stroke-opacity', 0.7).attr('d', d => sentLine(d) ?? '')
    g.append('path').datum(parsed).attr('fill', 'none').attr('stroke', C_PRICE).attr('stroke-width', 2.5).attr('stroke-linejoin', 'round').attr('d', d => priceLine(d) ?? '')

    const symGen = d3.symbol().size(52)
    g.selectAll<SVGPathElement, typeof parsed[0]>('.sig-marker').data(parsed.filter(d => d.signal != null)).join('path')
      .attr('class', 'sig-marker')
      .attr('d', d => symGen.type(d.signal === 'HOLD' ? d3.symbolCircle : d3.symbolTriangle)() ?? '')
      .attr('fill', d => SIG_COL[d.signal!]).attr('stroke', 'var(--surface)').attr('stroke-width', 1)
      .attr('transform', d => `translate(${x(d.date)},${yPrice(d.price)}) rotate(${d.signal === 'SELL' ? 180 : 0})`)

    g.append('g').attr('transform', `translate(0,${iH})`).call(d3.axisBottom(x).ticks(7).tickSize(0).tickPadding(8))
      .call(gg => gg.select('.domain').attr('stroke', CGRID)).call(gg => gg.selectAll<SVGTextElement, unknown>('text').attr('fill', CMUT).attr('font-size', 11))
    g.append('g').call(d3.axisLeft(ySent).ticks(6).tickSize(0).tickPadding(6).tickFormat(v => (+v).toFixed(2)))
      .call(gg => gg.select('.domain').remove()).call(gg => gg.selectAll<SVGTextElement, unknown>('text').attr('fill', CMUT).attr('font-size', 11))
    g.append('g').attr('transform', `translate(${iW},0)`).call(d3.axisRight(yPrice).ticks(6).tickSize(0).tickPadding(6).tickFormat(v => `$${(+v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`))
      .call(gg => gg.select('.domain').remove()).call(gg => gg.selectAll<SVGTextElement, unknown>('text').attr('fill', C_PRICE).attr('font-size', 11))

    g.append('text').attr('x', -iH / 2).attr('y', -M.left + 14).attr('transform', 'rotate(-90)').attr('text-anchor', 'middle').attr('fill', CMUT).attr('font-size', 10).text('sentiment score')
    g.append('text').attr('x', iW + M.right - 10).attr('y', -8).attr('text-anchor', 'end').attr('fill', C_PRICE).attr('font-size', 10).text('price')

    const bx    = d3.bisector<typeof parsed[0], Date>(d => d.date).left
    const vline = g.append('line').attr('y1', 0).attr('y2', iH).attr('stroke', CMUT).attr('stroke-width', 1).attr('stroke-dasharray', '4,3').attr('pointer-events', 'none').attr('display', 'none')

    g.append('rect').attr('width', iW).attr('height', iH).attr('fill', 'none').attr('pointer-events', 'all')
      .on('mousemove', function (event) {
        const [mx] = d3.pointer(event)
        vline.attr('display', null).attr('x1', mx).attr('x2', mx)
        const pt = parsed[Math.min(bx(parsed, x.invert(mx)), parsed.length - 1)]
        setTip({ svgX: M.left + mx, svgY: M.top + yPrice(pt.price), label: pt.date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), price: pt.price, sent: pt.sentimentScore, signal: pt.signal })
      })
      .on('mouseleave', function () { vline.attr('display', 'none'); setTip(null) })
  }, [parsed, iW, iH])

  if (data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CMUT, fontSize: 'var(--text-body-sm)' }}>No data available</div>
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-2)', flexWrap: 'wrap', fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-variant)', alignItems: 'center' }}>
        {ticker && <span style={{ fontWeight: 600, color: 'var(--on-surface)', marginRight: 'var(--space-2)' }}>{ticker}</span>}
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><svg width={14} height={4} aria-hidden><rect width={14} height={3} rx={1.5} fill={C_PRICE} /></svg>Price</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><svg width={14} height={4} aria-hidden><rect width={14} height={3} rx={1.5} fill={C_BULL} /></svg>Sentiment</span>
        {([['BUY', C_BULL], ['SELL', C_BEAR], ['HOLD', C_HOLD]] as const).map(([sig, col]) => (
          <span key={sig} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width={8} height={8} aria-hidden>
              <polygon points="4,0 8,8 0,8" fill={col} transform={sig === 'SELL' ? 'rotate(180,4,4)' : undefined} />
              {sig === 'HOLD' && <circle cx={4} cy={4} r={3.5} fill={col} />}
            </svg>
            {sig}
          </span>
        ))}
      </div>
      <svg ref={ref} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }} aria-label="Sentiment vs price correlation chart" />
      {tip && <ChartTooltip tip={tip} width={width} height={height} />}
    </div>
  )
}
