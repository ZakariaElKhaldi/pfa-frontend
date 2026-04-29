import * as d3 from 'd3'
import type { RefObject } from 'react'
import type { OHLCBar } from './types'
import {
  COLOR_BULL, COLOR_BEAR, COLOR_GRID, COLOR_TEXT_MUTED,
  COLOR_SMA, COLOR_BB_FILL, COLOR_BB_STROKE, COLOR_CROSSHAIR,
} from './constants'
import { candleColor, volumeColor, volumeStroke, computeSMA, computeBollinger, ensureGroup } from './utils'

export type RenderCtx = {
  svg:    d3.Selection<SVGSVGElement, unknown, null, undefined>
  clip:   d3.Selection<SVGGElement, unknown, null, undefined>
  x:      d3.ScaleBand<string>
  y:      d3.ScaleLinear<number, number>
  yVol:   d3.ScaleLinear<number, number>
  data:   OHLCBar[]
  margin: { top: number; right: number; bottom: number; left: number }
  width:  number
  height: number
  innerW: number
  bw:     number
  dur:    number
  firstRender: boolean
}

export function drawGrid(ctx: RenderCtx, yTicks: number[]) {
  const { svg, margin, width, y } = ctx
  const gridG = ensureGroup(svg as any, 'pc-grid')
  gridG.selectAll<SVGLineElement, number>('line')
    .data(yTicks).join('line')
    .attr('x1', margin.left).attr('x2', width - margin.right)
    .attr('y1', d => y(d)).attr('y2', d => y(d))
    .attr('stroke', COLOR_GRID).attr('shape-rendering', 'crispEdges')
}

export function drawBollinger(ctx: RenderCtx) {
  const { clip, data, x, y } = ctx
  const bb = computeBollinger(data, 20)
  const validBB = data
    .map((d, i) => ({ d, bb: bb[i] }))
    .filter(v => v.bb !== null) as { d: OHLCBar; bb: { upper: number; middle: number; lower: number } }[]
  if (validBB.length <= 1) return

  const bbG = clip.insert<SVGGElement>('g', ':first-child').attr('class', 'pc-bb')
  const xMid = (v: typeof validBB[0]) => (x(v.d.date.toISOString()) ?? 0) + x.bandwidth() / 2

  bbG.append('path').datum(validBB)
    .attr('d', d3.area<typeof validBB[0]>().x(xMid).y0(v => y(v.bb.lower)).y1(v => y(v.bb.upper)).curve(d3.curveCatmullRom.alpha(0.5)))
    .attr('fill', COLOR_BB_FILL)

  for (const getter of [(v: typeof validBB[0]) => v.bb.upper, (v: typeof validBB[0]) => v.bb.lower]) {
    bbG.append('path').datum(validBB)
      .attr('d', d3.line<typeof validBB[0]>().x(xMid).y(v => y(getter(v))).curve(d3.curveCatmullRom.alpha(0.5)))
      .attr('fill', 'none').attr('stroke', COLOR_BB_STROKE).attr('stroke-width', 1).attr('stroke-dasharray', '4,3')
  }
}

export function drawCandles(ctx: RenderCtx) {
  const { clip, data, x, y, bw } = ctx
  const candlesG = ensureGroup(clip, 'pc-candles')
  candlesG.attr('stroke-linecap', 'round')

  const candle = candlesG
    .selectAll<SVGGElement, OHLCBar>('g.candle')
    .data(data, d => d.date.toISOString())
    .join(
      enter => {
        const g = enter.append('g').attr('class', 'candle')
        g.append('line').attr('class', 'wick').attr('x1', bw / 2).attr('x2', bw / 2).attr('stroke-width', 1)
        g.append('rect').attr('class', 'body').attr('x', 0).attr('width', bw).attr('rx', Math.min(bw * 0.15, 2))
        return g
      },
      update => update,
      exit => exit.remove(),
    )

  candle.attr('transform', d => `translate(${x(d.date.toISOString())},0)`)
  candle.select<SVGLineElement>('line.wick')
    .attr('x1', bw / 2).attr('x2', bw / 2)
    .attr('y1', d => y(d.high)).attr('y2', d => y(d.low))
    .attr('stroke', d => candleColor(d))
  candle.select<SVGRectElement>('rect.body')
    .attr('width', bw)
    .attr('y', d => y(Math.max(d.open, d.close)))
    .attr('height', d => Math.max(1, Math.abs(y(d.open) - y(d.close))))
    .attr('fill', d => candleColor(d))
}

export function drawSMA(ctx: RenderCtx) {
  const { clip, data, x, y, dur, firstRender } = ctx
  const sma = computeSMA(data, 20)
  const smaData = data.map((d, i) => ({ d, val: sma[i] })).filter(v => v.val !== null) as { d: OHLCBar; val: number }[]
  if (smaData.length <= 1) return

  const line = d3.line<typeof smaData[0]>()
    .x(v => (x(v.d.date.toISOString()) ?? 0) + x.bandwidth() / 2).y(v => y(v.val))
    .curve(d3.curveCatmullRom.alpha(0.5))

  const smaPath = clip.append('path').attr('class', 'pc-sma').datum(smaData)
    .attr('fill', 'none').attr('stroke', COLOR_SMA)
    .attr('stroke-width', 1.5).attr('stroke-opacity', 0.85).attr('d', line)

  if (firstRender) {
    const len = smaPath.node()?.getTotalLength() ?? 0
    smaPath.attr('stroke-dasharray', `${len} ${len}`).attr('stroke-dashoffset', len)
      .transition().duration(dur + data.length * 8).ease(d3.easeLinear).attr('stroke-dashoffset', 0)
  }
}

export function drawVolume(ctx: RenderCtx, volumeH: number) {
  const { clip, data, x, yVol, bw, margin, height, svg } = ctx
  const volG = ensureGroup(clip, 'pc-volume')
  volG.selectAll<SVGRectElement, OHLCBar>('rect')
    .data(data, d => d.date.toISOString())
    .join(enter => enter.append('rect').attr('y', yVol(0)).attr('height', 0), update => update, exit => exit.remove())
    .attr('x', d => x(d.date.toISOString()) ?? 0).attr('width', bw)
    .attr('fill', d => volumeColor(d)).attr('stroke', d => volumeStroke(d))
    .attr('stroke-width', 0.5).attr('stroke-opacity', 0.4).attr('rx', Math.min(bw * 0.15, 2))
    .attr('y', d => yVol(d.volume)).attr('height', d => Math.max(0, yVol(0) - yVol(d.volume)))

  svg.append('text').attr('class', 'pc-vol-label')
    .attr('x', margin.left + 4).attr('y', height - margin.bottom - volumeH + 10)
    .attr('fill', COLOR_TEXT_MUTED).attr('font-size', '9px')
    .attr('font-family', "'JetBrains Mono', monospace").attr('letter-spacing', '0.05em').text('VOL')
}

export function drawLatestPrice(ctx: RenderCtx) {
  const { svg, data, y, margin, width } = ctx
  const lastBar   = data[data.length - 1]
  const lastColor = lastBar.close >= lastBar.open ? COLOR_BULL : COLOR_BEAR
  const latestG   = svg.append('g').attr('class', 'pc-latest-group')

  latestG.append('line')
    .attr('x1', margin.left).attr('x2', width - margin.right)
    .attr('y1', y(lastBar.close)).attr('y2', y(lastBar.close))
    .attr('stroke', lastColor).attr('stroke-width', 1).attr('stroke-dasharray', '6,4').attr('opacity', 0.6)
  latestG.append('rect')
    .attr('x', width - margin.right + 2).attr('y', y(lastBar.close) - 10)
    .attr('width', 56).attr('height', 20).attr('rx', 4).attr('fill', lastColor)
  latestG.append('text')
    .attr('x', width - margin.right + 30).attr('y', y(lastBar.close) + 4)
    .attr('text-anchor', 'middle').attr('fill', '#fff')
    .attr('font-size', '10.5px').attr('font-weight', '600').attr('font-family', "'JetBrains Mono', monospace")
    .text(`$${d3.format('.2f')(lastBar.close)}`)
}

export function drawAxes(ctx: RenderCtx, dateKeys: string[], yTicks: number[]) {
  const { svg, x, y, data, margin, height } = ctx
  const tickEvery   = data.length > 120 ? 20 : data.length > 60 ? 10 : 5
  const xTickValues = dateKeys.filter((_, i) => i % tickEvery === 0)

  let xAxisG = svg.select<SVGGElement>('g.pc-x-axis')
  if (xAxisG.empty()) xAxisG = svg.append('g').attr('class', 'pc-x-axis')
  xAxisG.attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickValues(xTickValues).tickFormat(d => d3.utcFormat('%-m/%-d')(new Date(d as string))).tickSize(0))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('text').attr('fill', COLOR_TEXT_MUTED).attr('font-size', '10px').attr('font-family', "'JetBrains Mono', monospace").attr('dy', '1em'))

  let yAxisG = svg.select<SVGGElement>('g.pc-y-axis')
  if (yAxisG.empty()) yAxisG = svg.append('g').attr('class', 'pc-y-axis')
  yAxisG.attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat(d => `$${d3.format(',.0f')(d as number)}`).tickValues(yTicks).tickSize(0))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('text').attr('fill', COLOR_TEXT_MUTED).attr('font-size', '10px').attr('font-family', "'JetBrains Mono', monospace").attr('dx', '-0.5em'))
}

function buildTooltipContent(el: HTMLDivElement, bar: OHLCBar, fmtPrice: (n: number) => string, fmtPct: (n: number) => string, fmtVol: (n: number) => string, fmtDate: (d: Date) => string, color: string) {
  el.textContent = ''

  const dateDiv = document.createElement('div')
  dateDiv.className = 'price-chart-tooltip-date'
  dateDiv.textContent = fmtDate(bar.date)
  el.appendChild(dateDiv)

  const gridDiv = document.createElement('div')
  gridDiv.className = 'price-chart-tooltip-grid'
  const pairs: [string, number][] = [['O', bar.open], ['H', bar.high], ['L', bar.low], ['C', bar.close]]
  for (const [label, val] of pairs) {
    const lbl = document.createElement('span')
    lbl.className = 'price-chart-tooltip-label'
    lbl.textContent = label
    const v = document.createElement('span')
    v.className = 'price-chart-tooltip-val'
    v.textContent = `$${fmtPrice(val)}`
    if (label === 'C') v.style.color = color
    gridDiv.appendChild(lbl)
    gridDiv.appendChild(v)
  }
  el.appendChild(gridDiv)

  const footer = document.createElement('div')
  footer.className = 'price-chart-tooltip-footer'
  const chgSpan = document.createElement('span')
  chgSpan.style.color = color
  chgSpan.style.fontWeight = '600'
  chgSpan.textContent = fmtPct((bar.close - bar.open) / bar.open)
  const volSpan = document.createElement('span')
  volSpan.className = 'price-chart-tooltip-vol'
  volSpan.textContent = `Vol ${fmtVol(bar.volume)}`
  footer.appendChild(chgSpan)
  footer.appendChild(volSpan)
  el.appendChild(footer)
}

export function drawCrosshair(
  ctx: RenderCtx,
  containerRef: RefObject<HTMLDivElement | null>,
  tooltipRef: RefObject<HTMLDivElement | null>,
) {
  const { svg, data, x, y, margin, width, height, innerW, bw } = ctx

  const crossG = svg.append('g').attr('class', 'pc-crosshair').style('display', 'none')
  const crossV = crossG.append('line').attr('y1', margin.top).attr('y2', height - margin.bottom)
    .attr('stroke', COLOR_CROSSHAIR).attr('stroke-width', 1).attr('stroke-dasharray', '3,3')
  const crossH = crossG.append('line').attr('x1', margin.left).attr('x2', width - margin.right)
    .attr('stroke', COLOR_CROSSHAIR).attr('stroke-width', 1).attr('stroke-dasharray', '3,3')

  const yBadge     = crossG.append('g')
  yBadge.append('rect').attr('width', 52).attr('height', 18).attr('rx', 3).attr('fill', 'hsl(220, 20%, 14%)')
  const yBadgeText = yBadge.append('text').attr('x', 26).attr('y', 13).attr('text-anchor', 'middle')
    .attr('fill', '#fff').attr('font-size', '9.5px').attr('font-weight', '600').attr('font-family', "'JetBrains Mono', monospace")

  const xBadge     = crossG.append('g')
  xBadge.append('rect').attr('width', 46).attr('height', 16).attr('rx', 3).attr('fill', 'hsl(220, 20%, 14%)')
  const xBadgeText = xBadge.append('text').attr('x', 23).attr('y', 12).attr('text-anchor', 'middle')
    .attr('fill', '#fff').attr('font-size', '9px').attr('font-weight', '500').attr('font-family', "'JetBrains Mono', monospace")

  const tooltip  = tooltipRef.current
  const fmtPrice = d3.format(',.2f')
  const fmtVol   = d3.format('.2s')
  const fmtPct   = d3.format('+.2%')
  const fmtDate  = d3.utcFormat('%b %-d, %Y')

  svg.append('rect').attr('class', 'pc-overlay')
    .attr('x', margin.left).attr('y', margin.top).attr('width', innerW).attr('height', height - margin.top - margin.bottom)
    .attr('fill', 'none').attr('pointer-events', 'all')
    .on('mouseenter', () => { crossG.style('display', null); if (tooltip) tooltip.style.opacity = '1' })
    .on('mouseleave', () => { crossG.style('display', 'none'); if (tooltip) tooltip.style.opacity = '0' })
    .on('mousemove', (event: MouseEvent) => {
      const [mx, my] = d3.pointer(event)
      const idx = Math.min(data.length - 1, Math.max(0, Math.floor((mx - margin.left) / x.step())))
      const bar = data[idx]
      if (!bar) return

      const cx = (x(bar.date.toISOString()) ?? 0) + bw / 2
      crossV.attr('x1', cx).attr('x2', cx)
      crossH.attr('y1', my).attr('y2', my)
      yBadge.attr('transform', `translate(${margin.left - 54},${my - 9})`)
      yBadgeText.text(`$${fmtPrice(y.invert(my))}`)
      xBadge.attr('transform', `translate(${cx - 23},${height - margin.bottom + 2})`)
      xBadgeText.text(d3.utcFormat('%-m/%-d')(bar.date))

      if (tooltip) {
        const color = bar.close >= bar.open ? COLOR_BULL : COLOR_BEAR
        buildTooltipContent(tooltip, bar, fmtPrice, fmtPct, fmtVol, fmtDate, color)
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          tooltip.style.left = `${Math.min(event.clientX - rect.left + 16, rect.width - 170)}px`
          tooltip.style.top  = `${Math.max(0, event.clientY - rect.top - 10)}px`
        }
      }
    })
}
