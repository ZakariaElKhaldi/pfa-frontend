import { useEffect, useRef, useMemo, useState } from 'react'
import * as d3 from 'd3'

export interface AccuracyRecord {
  evaluatedAt:     string
  predicted:       'BUY' | 'SELL' | 'HOLD'
  actualDirection: 'UP' | 'DOWN' | 'FLAT'
  accuracy1h:      boolean | null
  accuracy24h:     boolean | null
}

export interface SignalAccuracyChartProps {
  data:        AccuracyRecord[]
  rollWindow?: number   // rolling average window — default 12
  width?:      number
  height?:     number
}

// ── constants ────────────────────────────────────────────────────────────────
const M     = { top: 20, right: 44, bottom: 38, left: 52 }
const C1H   = 'hsl(243,72%,60%)'   // primary
const C24H  = 'hsl(158,60%,38%)'   // secondary
const CMUT  = 'hsl(220,10%,58%)'
const CGRID = 'hsla(220,15%,45%,0.18)'

// ── Wilson 90 % confidence interval (z = 1.645) ──────────────────────────────
// Scientifically accurate CI for a proportion; avoids extreme values at n→0
function wilson90(k: number, n: number): [number, number] {
  const z = 1.645
  if (n === 0) return [0, 1]
  const p = k / n
  const d = 1 + (z * z) / n
  const c = (p + (z * z) / (2 * n)) / d
  const e = (z / d) * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))
  return [Math.max(0, c - e), Math.min(1, c + e)]
}

type RolledPt = { date: Date; p: number; lo: number; hi: number }

function roll(
  pts: { date: Date; v: boolean | null }[],
  w: number,
): (RolledPt | null)[] {
  return pts.map((_, i) => {
    const slice = pts.slice(Math.max(0, i - w + 1), i + 1)
    const valid = slice.filter(d => d.v !== null)
    if (valid.length < 3) return null  // need ≥ 3 for a meaningful CI
    const k = valid.filter(d => d.v === true).length
    const n = valid.length
    const [lo, hi] = wilson90(k, n)
    return { date: pts[i].date, p: k / n, lo, hi }
  })
}

// ── Tooltip state ────────────────────────────────────────────────────────────
type Tip = { svgX: number; svgY: number; p1h: number | null; p24h: number | null; label: string }

export function SignalAccuracyChart({
  data,
  rollWindow = 12,
  width      = 640,
  height     = 260,
}: SignalAccuracyChartProps) {
  const ref = useRef<SVGSVGElement>(null)
  const [tip, setTip] = useState<Tip | null>(null)

  const parsed = useMemo(() =>
    [...data]
      .map(d => ({
        date:   new Date(d.evaluatedAt),
        acc1h:  d.accuracy1h,
        acc24h: d.accuracy24h,
      }))
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

    const x = d3.scaleTime()
      .domain(d3.extent(parsed, d => d.date) as [Date, Date])
      .range([0, iW])
    const y = d3.scaleLinear().domain([0, 1]).range([iH, 0])

    // ── Horizontal grid lines ──────────────────────────────────────────────
    g.append('g')
      .selectAll<SVGLineElement, number>('line.hg')
      .data([0, 0.25, 0.5, 0.75, 1.0])
      .join('line')
        .attr('x1', 0).attr('x2', iW)
        .attr('y1', v => y(v)).attr('y2', v => y(v))
        .attr('stroke', v => v === 0.5 ? 'hsla(220,15%,45%,0.45)' : CGRID)
        .attr('stroke-dasharray', v => v === 0.5 ? '8,5' : '3,3')
        .attr('stroke-width', v => v === 0.5 ? 1.5 : 1)

    g.append('text')
      .attr('x', iW + 4).attr('y', y(0.5) + 4)
      .attr('fill', CMUT).attr('font-size', 10)
      .text('50%')

    // ── Curves ────────────────────────────────────────────────────────────
    const curve = d3.curveCatmullRom.alpha(0.5)

    const areaGen = d3.area<RolledPt>()
      .x(d => x(d.date)).y0(d => y(d.lo)).y1(d => y(d.hi)).curve(curve)
    const lineGen = d3.line<RolledPt>()
      .x(d => x(d.date)).y(d => y(d.p)).curve(curve)

    ;([{ pts: v1h, col: C1H }, { pts: v24h, col: C24H }] as const).forEach(({ pts, col }) => {
      if (pts.length < 2) return
      g.append('path').datum(pts)
        .attr('fill', col).attr('fill-opacity', 0.12)
        .attr('d', d => areaGen(d) ?? '')
      g.append('path').datum(pts)
        .attr('fill', 'none').attr('stroke', col).attr('stroke-width', 2.5).attr('stroke-linejoin', 'round')
        .attr('d', d => lineGen(d) ?? '')
    })

    // ── Axes ──────────────────────────────────────────────────────────────
    g.append('g')
      .attr('transform', `translate(0,${iH})`)
      .call(d3.axisBottom(x).ticks(6).tickSize(0).tickPadding(8))
      .call(gg => gg.select('.domain').attr('stroke', CGRID))
      .call(gg => gg.selectAll<SVGTextElement, unknown>('text').attr('fill', CMUT).attr('font-size', 11))

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(v => `${(+v * 100).toFixed(0)}%`).tickSize(0).tickPadding(6))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll<SVGTextElement, unknown>('text').attr('fill', CMUT).attr('font-size', 11))

    // ── Hover ─────────────────────────────────────────────────────────────
    const bx1  = d3.bisector<RolledPt, Date>(d => d.date).left
    const bx24 = d3.bisector<RolledPt, Date>(d => d.date).left

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
        const hd   = x.invert(mx)
        const n1   = v1h[Math.min(bx1(v1h, hd), v1h.length - 1)]
        const n24  = v24h[Math.min(bx24(v24h, hd), v24h.length - 1)]
        const yPos = n1 ? y(n1.p) : iH / 2
        setTip({
          svgX:  M.left + mx,
          svgY:  M.top + yPos,
          p1h:   n1  ? n1.p  : null,
          p24h:  n24 ? n24.p : null,
          label: hd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        })
      })
      .on('mouseleave', function () { vline.attr('display', 'none'); setTip(null) })
  }, [parsed, v1h, v24h, iW, iH])

  if (data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CMUT, fontSize: 'var(--text-body-sm)' }}>
        No accuracy data yet
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Legend */}
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

      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        aria-label="Signal prediction accuracy trend"
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
            minWidth:           120,
          }}
        >
          <div style={{ color: 'var(--on-surface-muted)', marginBottom: 'var(--space-1)' }}>{tip.label}</div>
          {tip.p1h  != null && <div style={{ color: C1H  }}>1h·· {(tip.p1h  * 100).toFixed(1)}%</div>}
          {tip.p24h != null && <div style={{ color: C24H }}>24h· {(tip.p24h * 100).toFixed(1)}%</div>}
        </div>
      )}
    </div>
  )
}
