import { useEffect, useRef, useMemo, useState } from 'react'
import * as d3 from 'd3'

export interface SentimentPricePoint {
  /** ISO timestamp */
  time:           string
  /** Closing / reference price */
  price:          number
  /** Composite sentiment score — any numeric range; chart auto-scales */
  sentimentScore: number
  /** Signal emitted at this timestamp, if any */
  signal?:        'BUY' | 'SELL' | 'HOLD'
}

export interface SentimentPriceChartProps {
  data:    SentimentPricePoint[]
  ticker?: string
  width?:  number
  height?: number
}

// ── constants ────────────────────────────────────────────────────────────────
const M        = { top: 24, right: 64, bottom: 40, left: 52 }
const C_BULL   = 'hsl(158,60%,38%)'
const C_BEAR   = 'hsl(4,68%,50%)'
const C_PRICE  = 'hsl(243,72%,60%)'
const C_HOLD   = 'hsl(220,10%,58%)'
const CMUT     = 'hsl(220,10%,58%)'
const CGRID    = 'hsla(220,15%,45%,0.18)'
const SIG_COL  = { BUY: C_BULL, SELL: C_BEAR, HOLD: C_HOLD } as const

// ── Tooltip ──────────────────────────────────────────────────────────────────
type Tip = {
  svgX:    number
  svgY:    number
  label:   string
  price:   number
  sent:    number
  signal?: 'BUY' | 'SELL' | 'HOLD'
}

export function SentimentPriceChart({
  data,
  ticker,
  width  = 720,
  height = 320,
}: SentimentPriceChartProps) {
  const ref = useRef<SVGSVGElement>(null)
  const [tip, setTip] = useState<Tip | null>(null)

  const parsed = useMemo(() =>
    [...data]
      .map(d => ({ ...d, date: new Date(d.time) }))
      .sort((a, b) => +a.date - +b.date),
    [data],
  )

  const iW = width  - M.left - M.right
  const iH = height - M.top  - M.bottom

  useEffect(() => {
    if (!ref.current || parsed.length === 0) return
    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()
    const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`)

    const dates  = parsed.map(d => d.date)
    const x      = d3.scaleTime().domain(d3.extent(dates) as [Date, Date]).range([0, iW])

    // Sentiment Y scale (left) — symmetric around zero when possible
    const sMin = Math.min(0, d3.min(parsed, d => d.sentimentScore) ?? -1)
    const sMax = Math.max(0, d3.max(parsed, d => d.sentimentScore) ??  1)
    const sSym = Math.max(Math.abs(sMin), Math.abs(sMax))
    const ySent = d3.scaleLinear().domain([-sSym, sSym]).nice().range([iH, 0])

    // Price Y scale (right)
    const pMin = d3.min(parsed, d => d.price) ?? 0
    const pMax = d3.max(parsed, d => d.price) ?? 1
    const pPad = (pMax - pMin) * 0.06
    const yPrice = d3.scaleLinear().domain([pMin - pPad, pMax + pPad]).range([iH, 0])

    // ── Defs: split gradient at y(0) ────────────────────────────────────────
    const zeroFrac = ySent(0) / iH
    const defs = svg.append('defs')
    defs.append('linearGradient')
      .attr('id', 'sent-fill')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', M.left).attr('y1', M.top).attr('x2', M.left).attr('y2', M.top + iH)
      .selectAll('stop')
      .data([
        { off: '0%',                          col: C_BULL, op: 0.30 },
        { off: `${zeroFrac * 100}%`,          col: C_BULL, op: 0.04 },
        { off: `${zeroFrac * 100}%`,          col: C_BEAR, op: 0.04 },
        { off: '100%',                        col: C_BEAR, op: 0.30 },
      ])
      .join('stop')
        .attr('offset',        d => d.off)
        .attr('stop-color',    d => d.col)
        .attr('stop-opacity',  d => d.op)

    // ── Grid ─────────────────────────────────────────────────────────────────
    g.append('g')
      .selectAll<SVGLineElement, number>('line.hg')
      .data(ySent.ticks(6))
      .join('line')
        .attr('x1', 0).attr('x2', iW)
        .attr('y1', v => ySent(v)).attr('y2', v => ySent(v))
        .attr('stroke', v => v === 0 ? 'hsla(220,15%,45%,0.50)' : CGRID)
        .attr('stroke-dasharray', v => v === 0 ? '6,4' : '3,3')
        .attr('stroke-width', v => v === 0 ? 1.5 : 1)

    // ── Sentiment area ───────────────────────────────────────────────────────
    const sentArea = d3.area<typeof parsed[0]>()
      .x(d => x(d.date))
      .y0(ySent(0))
      .y1(d => ySent(d.sentimentScore))
      .curve(d3.curveCatmullRom.alpha(0.5))

    g.append('path').datum(parsed)
      .attr('fill', 'url(#sent-fill)')
      .attr('d', d => sentArea(d) ?? '')

    const sentLine = d3.line<typeof parsed[0]>()
      .x(d => x(d.date))
      .y(d => ySent(d.sentimentScore))
      .curve(d3.curveCatmullRom.alpha(0.5))

    g.append('path').datum(parsed)
      .attr('fill', 'none')
      .attr('stroke', d3.interpolateRgb(C_BULL, C_BEAR)(0.5))
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.7)
      .attr('d', d => sentLine(d) ?? '')

    // ── Price line ───────────────────────────────────────────────────────────
    const priceLine = d3.line<typeof parsed[0]>()
      .x(d => x(d.date))
      .y(d => yPrice(d.price))
      .curve(d3.curveCatmullRom.alpha(0.5))

    g.append('path').datum(parsed)
      .attr('fill', 'none')
      .attr('stroke', C_PRICE)
      .attr('stroke-width', 2.5)
      .attr('stroke-linejoin', 'round')
      .attr('d', d => priceLine(d) ?? '')

    // ── Signal markers ───────────────────────────────────────────────────────
    const signalPts = parsed.filter(d => d.signal != null)
    const symGen    = d3.symbol().size(52)

    g.selectAll<SVGPathElement, typeof parsed[0]>('.sig-marker')
      .data(signalPts)
      .join('path')
        .attr('class', 'sig-marker')
        .attr('d', d => symGen.type(d.signal === 'HOLD' ? d3.symbolCircle : d3.symbolTriangle)() ?? '')
        .attr('fill', d => SIG_COL[d.signal!])
        .attr('stroke', 'var(--surface)')
        .attr('stroke-width', 1)
        .attr('transform', d => {
          const tx  = x(d.date)
          const ty  = yPrice(d.price)
          const rot = d.signal === 'SELL' ? 180 : 0
          return `translate(${tx},${ty}) rotate(${rot})`
        })

    // ── Axes ─────────────────────────────────────────────────────────────────
    g.append('g')
      .attr('transform', `translate(0,${iH})`)
      .call(d3.axisBottom(x).ticks(7).tickSize(0).tickPadding(8))
      .call(gg => gg.select('.domain').attr('stroke', CGRID))
      .call(gg => gg.selectAll<SVGTextElement, unknown>('text').attr('fill', CMUT).attr('font-size', 11))

    g.append('g')
      .call(d3.axisLeft(ySent).ticks(6).tickSize(0).tickPadding(6)
        .tickFormat(v => (+v).toFixed(2)))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll<SVGTextElement, unknown>('text').attr('fill', CMUT).attr('font-size', 11))

    g.append('g')
      .attr('transform', `translate(${iW},0)`)
      .call(d3.axisRight(yPrice).ticks(6).tickSize(0).tickPadding(6)
        .tickFormat(v => `$${(+v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll<SVGTextElement, unknown>('text').attr('fill', C_PRICE).attr('font-size', 11))

    // ── Axis labels ───────────────────────────────────────────────────────────
    g.append('text')
      .attr('x', -iH / 2).attr('y', -M.left + 14)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', CMUT).attr('font-size', 10)
      .text('sentiment score')

    g.append('text')
      .attr('x', iW + M.right - 10).attr('y', -8)
      .attr('text-anchor', 'end')
      .attr('fill', C_PRICE).attr('font-size', 10)
      .text('price')

    // ── Hover ─────────────────────────────────────────────────────────────────
    const bx  = d3.bisector<typeof parsed[0], Date>(d => d.date).left
    const vline = g.append('line')
      .attr('y1', 0).attr('y2', iH)
      .attr('stroke', CMUT).attr('stroke-width', 1).attr('stroke-dasharray', '4,3')
      .attr('pointer-events', 'none').attr('display', 'none')

    g.append('rect')
      .attr('width', iW).attr('height', iH)
      .attr('fill', 'none').attr('pointer-events', 'all')
      .on('mousemove', function (event) {
        const [mx] = d3.pointer(event)
        vline.attr('display', null).attr('x1', mx).attr('x2', mx)
        const hd  = x.invert(mx)
        const idx = Math.min(bx(parsed, hd), parsed.length - 1)
        const pt  = parsed[idx]
        setTip({
          svgX:   M.left + mx,
          svgY:   M.top + yPrice(pt.price),
          label:  pt.date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          price:  pt.price,
          sent:   pt.sentimentScore,
          signal: pt.signal,
        })
      })
      .on('mouseleave', function () { vline.attr('display', 'none'); setTip(null) })
  }, [parsed, iW, iH])

  if (data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CMUT, fontSize: 'var(--text-body-sm)' }}>
        No data available
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-2)', flexWrap: 'wrap', fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-variant)', alignItems: 'center' }}>
        {ticker && <span style={{ fontWeight: 600, color: 'var(--on-surface)', marginRight: 'var(--space-2)' }}>{ticker}</span>}
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width={14} height={4} aria-hidden><rect width={14} height={3} rx={1.5} fill={C_PRICE} /></svg>
          Price
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width={14} height={4} aria-hidden><rect width={14} height={3} rx={1.5} fill={C_BULL} /></svg>
          Sentiment
        </span>
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

      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        aria-label="Sentiment vs price correlation chart"
      />

      {tip && (
        <div
          role="tooltip"
          style={{
            position:           'absolute',
            left:               `${(tip.svgX / width) * 100}%`,
            top:                `${(tip.svgY / height) * 100}%`,
            transform:          'translate(10px,-50%)',
            background:         'var(--surface-container-high)',
            border:             '1px solid var(--outline-variant)',
            borderRadius:       'var(--radius-md)',
            padding:            'var(--space-2) var(--space-3)',
            fontSize:           'var(--text-label-sm)',
            pointerEvents:      'none',
            color:              'var(--on-surface)',
            zIndex:             10,
            whiteSpace:         'nowrap',
            fontVariantNumeric: 'tabular-nums',
            minWidth:           140,
          }}
        >
          <div style={{ color: 'var(--on-surface-muted)', marginBottom: 'var(--space-1)' }}>{tip.label}</div>
          <div style={{ color: C_PRICE }}>Price· ${tip.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div style={{ color: tip.sent >= 0 ? C_BULL : C_BEAR }}>Sent·· {tip.sent >= 0 ? '+' : ''}{tip.sent.toFixed(4)}</div>
          {tip.signal && <div style={{ color: SIG_COL[tip.signal], marginTop: 'var(--space-1)' }}>Signal: {tip.signal}</div>}
        </div>
      )}
    </div>
  )
}
