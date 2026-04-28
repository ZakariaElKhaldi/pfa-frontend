import { useEffect, useRef, useCallback, useState } from 'react'
import * as d3 from 'd3'
import { ensureGroup } from './utils'
import {
  drawGrid, drawBollinger, drawCandles, drawSMA,
  drawVolume, drawLatestPrice, drawAxes, drawCrosshair,
  type RenderCtx,
} from './renderer'
import type { OHLCBar, PriceChartProps } from './types'

export type { OHLCBar, PriceChartProps }

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
  const isFirstRender = useRef(true)

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

  const renderChart = useCallback(() => {
    if (!svgRef.current || data.length === 0) return
    const svg = d3.select(svgRef.current)
    const margin      = { top: 16, right: 64, bottom: 28, left: 56 }
    const volumeRatio = showVolume ? 0.18 : 0
    const candleH     = Math.round(height * (1 - volumeRatio) - margin.top - margin.bottom)
    const volumeH     = Math.round(height * volumeRatio)
    const innerW      = width - margin.left - margin.right
    const firstRender = isFirstRender.current
    const dur         = firstRender ? 500 : 0
    const dateKeys    = data.map(d => d.date.toISOString())

    const x    = d3.scaleBand<string>().domain(dateKeys).range([margin.left, width - margin.right]).padding(0.25)
    const y    = d3.scaleLinear().domain([d3.min(data, d => d.low)! * 0.998, d3.max(data, d => d.high)! * 1.002]).range([margin.top + candleH, margin.top])
    const yVol = d3.scaleLinear().domain([0, d3.max(data, d => d.volume)! * 1.2]).range([height - margin.bottom, height - margin.bottom - volumeH])

    let defs = svg.select<SVGDefsElement>('defs')
    if (defs.empty()) defs = svg.append('defs')
    let clipRect = defs.select<SVGRectElement>('#pc-clip rect')
    if (clipRect.empty()) { defs.append('clipPath').attr('id', 'pc-clip').append('rect'); clipRect = defs.select<SVGRectElement>('#pc-clip rect') }
    clipRect.attr('x', margin.left).attr('y', margin.top).attr('width', innerW).attr('height', height - margin.top - margin.bottom)

    const clip = ensureGroup(svg as any, 'pc-clip-content')
    clip.attr('clip-path', 'url(#pc-clip)')
    const bw     = x.bandwidth()
    const yTicks = y.ticks(6)
    const ctx: RenderCtx = { svg, clip, x, y, yVol, data, margin, width, height, innerW, bw, dur, firstRender }

    drawGrid(ctx, yTicks)
    clip.selectAll('.pc-bb').remove()
    if (showBollinger) drawBollinger(ctx)
    drawCandles(ctx)
    clip.selectAll('.pc-sma').remove()
    if (showSMA) drawSMA(ctx)
    if (showVolume) drawVolume(ctx, volumeH)
    else clip.selectAll('.pc-volume').remove()
    svg.selectAll('.pc-vol-label').remove()
    svg.selectAll('.pc-latest-group').remove()
    drawLatestPrice(ctx)
    drawAxes(ctx, dateKeys, yTicks)
    svg.selectAll('.pc-crosshair').remove()
    svg.selectAll('.pc-overlay').remove()
    if (showCrosshair) drawCrosshair(ctx, containerRef, tooltipRef)

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
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="price-chart-svg" aria-label="Interactive candlestick price chart" />
      {showCrosshair && <div ref={tooltipRef} className="price-chart-tooltip" />}
    </div>
  )
}
