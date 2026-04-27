import { useEffect, useRef, useCallback, useState } from 'react'
import * as d3 from 'd3'

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

export interface OHLCBar {
  date: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface PriceChartProps {
  data: OHLCBar[]
  /** Fixed width — omit to enable responsive auto-sizing via ResizeObserver */
  width?: number
  height?: number
  /** Show volume sub-chart (default true) */
  showVolume?: boolean
  /** Show 20-period SMA line (default true) */
  showSMA?: boolean
  /** Show Bollinger Bands shaded area (default false) */
  showBollinger?: boolean
  /** Show interactive crosshair + tooltip (default true) */
  showCrosshair?: boolean
}

/* ═══════════════════════════════════════════════════════════════════════════
   Constants — CrowdSignal Design Tokens
   ═══════════════════════════════════════════════════════════════════════════ */

const COLOR_BULL       = 'hsl(158, 60%, 35%)'
const COLOR_BULL_LIGHT = 'hsla(158, 60%, 35%, 0.28)'
const COLOR_BEAR       = 'hsl(4, 68%, 50%)'
const COLOR_BEAR_LIGHT = 'hsla(4, 68%, 50%, 0.28)'
const COLOR_FLAT       = 'hsl(220, 10%, 58%)'
const COLOR_GRID       = 'hsla(220, 15%, 45%, 0.15)'
const COLOR_TEXT_MUTED  = 'hsl(220, 10%, 58%)'
const COLOR_SMA        = 'hsl(243, 72%, 60%)'
const COLOR_BB_FILL    = 'hsla(243, 72%, 60%, 0.07)'
const COLOR_BB_STROKE  = 'hsla(243, 72%, 60%, 0.30)'
const COLOR_CROSSHAIR  = 'hsla(220, 20%, 14%, 0.35)'

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

function candleColor(d: OHLCBar) {
  if (d.close > d.open) return COLOR_BULL
  if (d.close < d.open) return COLOR_BEAR
  return COLOR_FLAT
}

function volumeColor(d: OHLCBar) {
  return d.close >= d.open ? COLOR_BULL_LIGHT : COLOR_BEAR_LIGHT
}

function volumeStroke(d: OHLCBar) {
  return d.close >= d.open ? COLOR_BULL : COLOR_BEAR
}

/** Compute simple moving average */
function computeSMA(data: OHLCBar[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += data[j].close
    return sum / period
  })
}

/** Compute Bollinger Bands */
function computeBollinger(data: OHLCBar[], period: number, mult = 2) {
  const sma = computeSMA(data, period)
  return data.map((_, i) => {
    const m = sma[i]
    if (m === null) return null
    let variance = 0
    for (let j = i - period + 1; j <= i; j++) {
      variance += (data[j].close - m) ** 2
    }
    const std = Math.sqrt(variance / period)
    return { upper: m + mult * std, middle: m, lower: m - mult * std }
  })
}

/** Select an existing group, or create it if it doesn't exist. */
function ensureGroup(
  parent: d3.Selection<SVGGElement | SVGSVGElement, unknown, null, undefined>,
  className: string,
  insertBefore?: string,
): d3.Selection<SVGGElement, unknown, null, undefined> {
  let g = parent.select<SVGGElement>(`g.${className}`)
  if (g.empty()) {
    g = insertBefore
      ? parent.insert<SVGGElement>('g', insertBefore).attr('class', className)
      : parent.append<SVGGElement>('g').attr('class', className)
  }
  return g
}

/* ═══════════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════════ */

export function PriceChart({
  data,
  width: fixedWidth,
  height = 480,
  showVolume = true,
  showSMA = true,
  showBollinger = false,
  showCrosshair = true,
}: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef       = useRef<SVGSVGElement>(null)
  const tooltipRef   = useRef<HTMLDivElement>(null)
  const [autoWidth, setAutoWidth] = useState(fixedWidth ?? 928)

  // Track whether this is the first render (for entrance animations)
  const isFirstRender = useRef(true)

  // ── Responsive observer ──────────────────────────────────────────────────
  useEffect(() => {
    if (fixedWidth || !containerRef.current) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width
        if (w > 0) setAutoWidth(Math.round(w))
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [fixedWidth])

  const width = fixedWidth ?? autoWidth

  // ── Main D3 render ───────────────────────────────────────────────────────
  const renderChart = useCallback(() => {
    if (!svgRef.current || data.length === 0) return

    const svg = d3.select(svgRef.current)
    const margin = { top: 16, right: 64, bottom: 28, left: 56 }
    const volumeRatio = showVolume ? 0.18 : 0
    const candleH = Math.round(height * (1 - volumeRatio) - margin.top - margin.bottom)
    const volumeH = Math.round(height * volumeRatio)
    const innerW  = width - margin.left - margin.right

    const firstRender = isFirstRender.current
    // Duration: full animation on first render, instant on subsequent updates
    const dur = firstRender ? 500 : 0

    // ── Scales ─────────────────────────────────────────────────────────────
    const dateKeys = data.map(d => d.date.toISOString())

    const x = d3.scaleBand<string>()
      .domain(dateKeys)
      .range([margin.left, width - margin.right])
      .padding(0.25)

    const y = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.low)! * 0.998,
        d3.max(data, d => d.high)! * 1.002,
      ])
      .range([margin.top + candleH, margin.top])

    const yVol = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.volume)! * 1.2])
      .range([height - margin.bottom, height - margin.bottom - volumeH])

    // ── Defs (clip path) — create once ─────────────────────────────────────
    let defs = svg.select<SVGDefsElement>('defs')
    if (defs.empty()) defs = svg.append('defs')

    let clipRect = defs.select<SVGRectElement>('#pc-clip rect')
    if (clipRect.empty()) {
      defs.append('clipPath').attr('id', 'pc-clip').append('rect')
      clipRect = defs.select<SVGRectElement>('#pc-clip rect')
    }
    clipRect
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', innerW)
      .attr('height', height - margin.top - margin.bottom)

    // ── Grid lines ─────────────────────────────────────────────────────────
    const gridG = ensureGroup(svg as any, 'pc-grid')
    const yTicks = y.ticks(6)
    gridG.selectAll<SVGLineElement, number>('line')
      .data(yTicks)
      .join('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', COLOR_GRID)
      .attr('shape-rendering', 'crispEdges')

    // ── Clipped content group ──────────────────────────────────────────────
    const clip = ensureGroup(svg as any, 'pc-clip-content')
    clip.attr('clip-path', 'url(#pc-clip)')

    // ── Bollinger Bands ────────────────────────────────────────────────────
    // Remove old BB paths, then re-draw if enabled
    clip.selectAll('.pc-bb').remove()

    if (showBollinger) {
      const bb = computeBollinger(data, 20)
      const validBB = data
        .map((d, i) => ({ d, bb: bb[i] }))
        .filter(v => v.bb !== null) as { d: OHLCBar; bb: { upper: number; middle: number; lower: number } }[]

      if (validBB.length > 1) {
        const bbG = clip.insert<SVGGElement>('g', ':first-child').attr('class', 'pc-bb')

        const area = d3.area<typeof validBB[0]>()
          .x(v => (x(v.d.date.toISOString()) ?? 0) + x.bandwidth() / 2)
          .y0(v => y(v.bb.lower))
          .y1(v => y(v.bb.upper))
          .curve(d3.curveCatmullRom.alpha(0.5))

        bbG.append('path').datum(validBB).attr('d', area).attr('fill', COLOR_BB_FILL)

        const lineUpper = d3.line<typeof validBB[0]>()
          .x(v => (x(v.d.date.toISOString()) ?? 0) + x.bandwidth() / 2)
          .y(v => y(v.bb.upper))
          .curve(d3.curveCatmullRom.alpha(0.5))

        bbG.append('path').datum(validBB).attr('d', lineUpper)
          .attr('fill', 'none').attr('stroke', COLOR_BB_STROKE)
          .attr('stroke-width', 1).attr('stroke-dasharray', '4,3')

        const lineLower = d3.line<typeof validBB[0]>()
          .x(v => (x(v.d.date.toISOString()) ?? 0) + x.bandwidth() / 2)
          .y(v => y(v.bb.lower))
          .curve(d3.curveCatmullRom.alpha(0.5))

        bbG.append('path').datum(validBB).attr('d', lineLower)
          .attr('fill', 'none').attr('stroke', COLOR_BB_STROKE)
          .attr('stroke-width', 1).attr('stroke-dasharray', '4,3')
      }
    }

    // ── Candles (proper enter/update/exit join) ────────────────────────────
    const candlesG = ensureGroup(clip, 'pc-candles')
    candlesG.attr('stroke-linecap', 'round')

    const bw = x.bandwidth()

    const candle = candlesG
      .selectAll<SVGGElement, OHLCBar>('g.candle')
      .data(data, d => d.date.toISOString())
      .join(
        enter => {
          const g = enter.append('g').attr('class', 'candle')

          // Wick
          g.append('line').attr('class', 'wick')
            .attr('x1', bw / 2).attr('x2', bw / 2)
            .attr('stroke-width', 1)

          // Body
          g.append('rect').attr('class', 'body')
            .attr('x', 0).attr('width', bw)
            .attr('rx', Math.min(bw * 0.15, 2))

          return g
        },
        update => update,
        exit => exit.remove(),
      )

    // Position every candle group (enter + update)
    candle.attr('transform', d => `translate(${x(d.date.toISOString())},0)`)

    // Update wick positions immediately (no animation on data updates)
    candle.select<SVGLineElement>('line.wick')
      .attr('x1', bw / 2).attr('x2', bw / 2)
      .attr('y1', d => y(d.high))
      .attr('y2', d => y(d.low))
      .attr('stroke', d => candleColor(d))

    // Update body positions immediately
    candle.select<SVGRectElement>('rect.body')
      .attr('width', bw)
      .attr('y', d => y(Math.max(d.open, d.close)))
      .attr('height', d => Math.max(1, Math.abs(y(d.open) - y(d.close))))
      .attr('fill', d => candleColor(d))

    // ── SMA line ───────────────────────────────────────────────────────────
    clip.selectAll('.pc-sma').remove()

    if (showSMA) {
      const sma = computeSMA(data, 20)
      const smaData = data
        .map((d, i) => ({ d, val: sma[i] }))
        .filter(v => v.val !== null) as { d: OHLCBar; val: number }[]

      if (smaData.length > 1) {
        const line = d3.line<typeof smaData[0]>()
          .x(v => (x(v.d.date.toISOString()) ?? 0) + x.bandwidth() / 2)
          .y(v => y(v.val))
          .curve(d3.curveCatmullRom.alpha(0.5))

        const smaPath = clip.append('path')
          .attr('class', 'pc-sma')
          .datum(smaData)
          .attr('fill', 'none')
          .attr('stroke', COLOR_SMA)
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.85)
          .attr('d', line)

        // Animate draw-in only on first render
        if (firstRender) {
          const totalLen = smaPath.node()?.getTotalLength() ?? 0
          smaPath
            .attr('stroke-dasharray', `${totalLen} ${totalLen}`)
            .attr('stroke-dashoffset', totalLen)
            .transition()
            .duration(dur + data.length * 8)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0)
        }
      }
    }

    // ── Volume bars ────────────────────────────────────────────────────────
    if (showVolume) {
      const volG = ensureGroup(clip, 'pc-volume')

      volG.selectAll<SVGRectElement, OHLCBar>('rect')
        .data(data, d => d.date.toISOString())
        .join(
          enter => enter.append('rect')
            .attr('y', yVol(0))
            .attr('height', 0),
          update => update,
          exit => exit.remove(),
        )
        .attr('x', d => x(d.date.toISOString()) ?? 0)
        .attr('width', bw)
        .attr('fill', d => volumeColor(d))
        .attr('stroke', d => volumeStroke(d))
        .attr('stroke-width', 0.5)
        .attr('stroke-opacity', 0.4)
        .attr('rx', Math.min(bw * 0.15, 2))
        .attr('y', d => yVol(d.volume))
        .attr('height', d => Math.max(0, yVol(0) - yVol(d.volume)))
    } else {
      clip.selectAll('.pc-volume').remove()
    }

    // Volume label
    svg.selectAll('.pc-vol-label').remove()
    if (showVolume) {
      svg.append('text')
        .attr('class', 'pc-vol-label')
        .attr('x', margin.left + 4)
        .attr('y', height - margin.bottom - volumeH + 10)
        .attr('fill', COLOR_TEXT_MUTED)
        .attr('font-size', '9px')
        .attr('font-family', "'JetBrains Mono', monospace")
        .attr('letter-spacing', '0.05em')
        .text('VOL')
    }

    // ── Latest price line ──────────────────────────────────────────────────
    svg.selectAll('.pc-latest-group').remove()

    const lastBar = data[data.length - 1]
    const lastColor = lastBar.close >= lastBar.open ? COLOR_BULL : COLOR_BEAR

    const latestG = svg.append('g').attr('class', 'pc-latest-group')

    latestG.append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', y(lastBar.close))
      .attr('y2', y(lastBar.close))
      .attr('stroke', lastColor)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '6,4')
      .attr('opacity', 0.6)

    latestG.append('rect')
      .attr('x', width - margin.right + 2)
      .attr('y', y(lastBar.close) - 10)
      .attr('width', 56)
      .attr('height', 20)
      .attr('rx', 4)
      .attr('fill', lastColor)

    latestG.append('text')
      .attr('x', width - margin.right + 30)
      .attr('y', y(lastBar.close) + 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '10.5px')
      .attr('font-weight', '600')
      .attr('font-family', "'JetBrains Mono', monospace")
      .text(`$${d3.format('.2f')(lastBar.close)}`)

    // ── Axes (select-or-create, then update) ──────────────────────────────
    const tickEvery = data.length > 120 ? 20 : data.length > 60 ? 10 : 5
    const xTickValues = dateKeys.filter((_, i) => i % tickEvery === 0)

    // X axis
    let xAxisG = svg.select<SVGGElement>('g.pc-x-axis')
    if (xAxisG.empty()) xAxisG = svg.append('g').attr('class', 'pc-x-axis')

    xAxisG
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x)
          .tickValues(xTickValues)
          .tickFormat(d => d3.utcFormat('%-m/%-d')(new Date(d as string)))
          .tickSize(0)
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('text')
        .attr('fill', COLOR_TEXT_MUTED)
        .attr('font-size', '10px')
        .attr('font-family', "'JetBrains Mono', monospace")
        .attr('dy', '1em')
      )

    // Y axis
    let yAxisG = svg.select<SVGGElement>('g.pc-y-axis')
    if (yAxisG.empty()) yAxisG = svg.append('g').attr('class', 'pc-y-axis')

    yAxisG
      .attr('transform', `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(y)
          .tickFormat(d => `$${d3.format(',.0f')(d as number)}`)
          .tickValues(yTicks)
          .tickSize(0)
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('text')
        .attr('fill', COLOR_TEXT_MUTED)
        .attr('font-size', '10px')
        .attr('font-family', "'JetBrains Mono', monospace")
        .attr('dx', '-0.5em')
      )

    // ── Crosshair + Tooltip ────────────────────────────────────────────────
    // Remove and rebuild the crosshair overlay each time so it's always on top
    svg.selectAll('.pc-crosshair').remove()
    svg.selectAll('.pc-overlay').remove()

    if (showCrosshair) {
      const crossG = svg.append('g')
        .attr('class', 'pc-crosshair')
        .style('display', 'none')

      const crossV = crossG.append('line')
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .attr('stroke', COLOR_CROSSHAIR)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')

      const crossH = crossG.append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('stroke', COLOR_CROSSHAIR)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')

      // Y readout badge
      const yBadge = crossG.append('g')
      yBadge.append('rect')
        .attr('width', 52).attr('height', 18).attr('rx', 3)
        .attr('fill', 'hsl(220, 20%, 14%)')
      const yBadgeText = yBadge.append('text')
        .attr('x', 26).attr('y', 13).attr('text-anchor', 'middle')
        .attr('fill', '#fff').attr('font-size', '9.5px')
        .attr('font-weight', '600').attr('font-family', "'JetBrains Mono', monospace")

      // X readout badge
      const xBadge = crossG.append('g')
      xBadge.append('rect')
        .attr('width', 46).attr('height', 16).attr('rx', 3)
        .attr('fill', 'hsl(220, 20%, 14%)')
      const xBadgeText = xBadge.append('text')
        .attr('x', 23).attr('y', 12).attr('text-anchor', 'middle')
        .attr('fill', '#fff').attr('font-size', '9px')
        .attr('font-weight', '500').attr('font-family', "'JetBrains Mono', monospace")

      const tooltip = tooltipRef.current
      const fmtPrice = d3.format(',.2f')
      const fmtVol   = d3.format('.2s')
      const fmtPct   = d3.format('+.2%')
      const fmtDate  = d3.utcFormat('%b %-d, %Y')

      // Invisible overlay — must be on top to capture mouse
      svg.append('rect')
        .attr('class', 'pc-overlay')
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', innerW)
        .attr('height', height - margin.top - margin.bottom)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseenter', () => {
          crossG.style('display', null)
          if (tooltip) tooltip.style.opacity = '1'
        })
        .on('mouseleave', () => {
          crossG.style('display', 'none')
          if (tooltip) tooltip.style.opacity = '0'
        })
        .on('mousemove', (event: MouseEvent) => {
          const [mx, my] = d3.pointer(event)

          // Find nearest candle by x position
          const bandStep = x.step()
          const idx = Math.min(
            data.length - 1,
            Math.max(0, Math.floor((mx - margin.left) / bandStep))
          )
          const bar = data[idx]
          if (!bar) return

          const cx = (x(bar.date.toISOString()) ?? 0) + bw / 2
          const priceAtMouse = y.invert(my)

          crossV.attr('x1', cx).attr('x2', cx)
          crossH.attr('y1', my).attr('y2', my)

          yBadge.attr('transform', `translate(${margin.left - 54},${my - 9})`)
          yBadgeText.text(`$${fmtPrice(priceAtMouse)}`)

          xBadge.attr('transform', `translate(${cx - 23},${height - margin.bottom + 2})`)
          xBadgeText.text(d3.utcFormat('%-m/%-d')(bar.date))

          if (tooltip) {
            const chg   = (bar.close - bar.open) / bar.open
            const color = bar.close >= bar.open ? COLOR_BULL : COLOR_BEAR

            tooltip.innerHTML = `
              <div class="price-chart-tooltip-date">${fmtDate(bar.date)}</div>
              <div class="price-chart-tooltip-grid">
                <span class="price-chart-tooltip-label">O</span>
                <span class="price-chart-tooltip-val">$${fmtPrice(bar.open)}</span>
                <span class="price-chart-tooltip-label">H</span>
                <span class="price-chart-tooltip-val">$${fmtPrice(bar.high)}</span>
                <span class="price-chart-tooltip-label">L</span>
                <span class="price-chart-tooltip-val">$${fmtPrice(bar.low)}</span>
                <span class="price-chart-tooltip-label">C</span>
                <span class="price-chart-tooltip-val" style="color:${color}">$${fmtPrice(bar.close)}</span>
              </div>
              <div class="price-chart-tooltip-footer">
                <span style="color:${color};font-weight:600">${fmtPct(chg)}</span>
                <span class="price-chart-tooltip-vol">Vol ${fmtVol(bar.volume)}</span>
              </div>
            `

            const rect = containerRef.current?.getBoundingClientRect()
            if (rect) {
              const tx = event.clientX - rect.left + 16
              const ty = event.clientY - rect.top - 10
              tooltip.style.left = `${Math.min(tx, rect.width - 170)}px`
              tooltip.style.top  = `${Math.max(0, ty)}px`
            }
          }
        })
    }

    // Mark first render done
    if (firstRender) isFirstRender.current = false

  }, [data, width, height, showVolume, showSMA, showBollinger, showCrosshair])

  useEffect(() => { renderChart() }, [renderChart])

  if (data.length === 0) {
    return (
      <div className="price-chart-container price-chart-empty" style={{ height }}>
        <div className="price-chart-empty-inner">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span>No price data available</span>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="price-chart-container" style={{ height }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="price-chart-svg"
        aria-label="Interactive candlestick price chart"
      />
      {showCrosshair && (
        <div ref={tooltipRef} className="price-chart-tooltip" />
      )}
    </div>
  )
}
