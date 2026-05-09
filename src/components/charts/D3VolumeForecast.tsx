import { useRef, useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { Skeleton } from '@/components/ui/skeleton'

export interface HistoricalVolume {
  date: string
  volume: number
}

interface Props {
  historicalData: HistoricalVolume[]
  forecastData: number[] | null
  isLoading: boolean
  error?: string | null
  height?: number
}

interface DataPoint {
  date: Date
  volume: number
  isForecast: boolean
}

interface TooltipState {
  x: number
  y: number
  d: DataPoint
  avgVolume: number
}

export function D3VolumeForecast({
  historicalData,
  forecastData,
  isLoading,
  error,
  height = 280,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(800)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  // ── Responsive observer ────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(e.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ── Pre-compute combined dataset & stats ───────────────────────
  const { combinedData, histData, fcData, avgVolume, forecastAvg, forecastTrend } =
    useMemo(() => {
      if (historicalData.length === 0)
        return {
          combinedData: [] as DataPoint[],
          histData: [] as DataPoint[],
          fcData: [] as DataPoint[],
          avgVolume: 0,
          forecastAvg: 0,
          forecastTrend: 'flat' as const,
        }

      const hist: DataPoint[] = historicalData.map((d) => ({
        date: new Date(d.date + 'T00:00:00'),
        volume: d.volume,
        isForecast: false,
      }))

      const lastHistDate = hist[hist.length - 1].date
      const fc: DataPoint[] = []

      if (forecastData && forecastData.length > 0) {
        forecastData.forEach((vol, i) => {
          const nextDate = new Date(lastHistDate)
          nextDate.setDate(nextDate.getDate() + i + 1)
          fc.push({ date: nextDate, volume: Math.max(0, vol), isForecast: true })
        })
      }

      // Connect forecast to last historical point for seamless line
      const fcWithBridge =
        fc.length > 0 ? [hist[hist.length - 1], ...fc] : []

      const combined = [...hist, ...fc]

      // Stats
      const histVolumes = hist.map((d) => d.volume)
      const avg = d3.mean(histVolumes) ?? 0
      const fcAvg = fc.length > 0 ? (d3.mean(fc.map((d) => d.volume)) ?? 0) : 0

      // Trend: compare first half of forecast to second half
      let trend: 'up' | 'down' | 'flat' = 'flat'
      if (fc.length >= 4) {
        const mid = Math.floor(fc.length / 2)
        const first = d3.mean(fc.slice(0, mid).map((d) => d.volume)) ?? 0
        const second = d3.mean(fc.slice(mid).map((d) => d.volume)) ?? 0
        const pctChange = first > 0 ? (second - first) / first : 0
        if (pctChange > 0.05) trend = 'up'
        else if (pctChange < -0.05) trend = 'down'
      }

      return {
        combinedData: combined,
        histData: hist,
        fcData: fcWithBridge,
        avgVolume: avg,
        forecastAvg: fcAvg,
        forecastTrend: trend,
      }
    }, [historicalData, forecastData])

  // ── D3 rendering ───────────────────────────────────────────────
  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    if (combinedData.length === 0 || width < 100) return

    const margin = { top: 16, right: 24, bottom: 32, left: 56 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    svg.attr('width', width).attr('height', height)

    // ── Gradient defs ──────────────────────────────────────────
    const defs = svg.append('defs')

    // Historical area gradient
    const histGrad = defs
      .append('linearGradient')
      .attr('id', 'vol-hist-grad')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1')
    histGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'hsl(220, 60%, 55%)')
      .attr('stop-opacity', 0.25)
    histGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'hsl(220, 60%, 55%)')
      .attr('stop-opacity', 0.02)

    // Forecast area gradient
    const fcGrad = defs
      .append('linearGradient')
      .attr('id', 'vol-fc-grad')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1')
    fcGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'hsl(160, 70%, 45%)')
      .attr('stop-opacity', 0.2)
    fcGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'hsl(160, 70%, 45%)')
      .attr('stop-opacity', 0.01)

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // ── Scales ──────────────────────────────────────────────────
    const x = d3
      .scaleTime()
      .domain(d3.extent(combinedData, (d) => d.date) as [Date, Date])
      .range([0, innerW])

    const yMax = (d3.max(combinedData, (d) => d.volume) ?? 0) * 1.12
    const y = d3.scaleLinear().domain([0, yMax]).range([innerH, 0])

    // ── Grid ────────────────────────────────────────────────────
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-innerW)
          .tickFormat(() => ''),
      )
      .call((sel) => sel.select('.domain').remove())
      .call((sel) =>
        sel
          .selectAll('.tick line')
          .attr('stroke', 'var(--outline-variant)')
          .attr('stroke-opacity', 0.25)
          .attr('stroke-dasharray', '2 4'),
      )

    // ── Axes ────────────────────────────────────────────────────
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(7).tickSizeOuter(0))
      .call((sel) => sel.select('.domain').remove())
      .call((sel) =>
        sel
          .selectAll('.tick text')
          .attr('fill', 'var(--on-surface-muted)')
          .attr('font-size', '11px'),
      )

    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => d3.format('~s')(d as number)),
      )
      .call((sel) => sel.select('.domain').remove())
      .call((sel) =>
        sel
          .selectAll('.tick text')
          .attr('fill', 'var(--on-surface-muted)')
          .attr('font-size', '11px'),
      )

    // ── Historical volume bars (subtle) ─────────────────────────
    const barWidth = Math.max(1, Math.min(6, innerW / histData.length - 1))
    g.selectAll('.vol-bar')
      .data(histData)
      .join('rect')
      .attr('class', 'vol-bar')
      .attr('x', (d) => x(d.date) - barWidth / 2)
      .attr('y', (d) => y(d.volume))
      .attr('width', barWidth)
      .attr('height', (d) => innerH - y(d.volume))
      .attr('fill', 'hsl(220, 60%, 55%)')
      .attr('fill-opacity', 0.18)
      .attr('rx', 1)

    // ── Historical area + line ──────────────────────────────────
    const area = d3
      .area<DataPoint>()
      .x((d) => x(d.date))
      .y0(innerH)
      .y1((d) => y(d.volume))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(histData)
      .attr('fill', 'url(#vol-hist-grad)')
      .attr('d', area)

    const line = d3
      .line<DataPoint>()
      .x((d) => x(d.date))
      .y((d) => y(d.volume))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(histData)
      .attr('fill', 'none')
      .attr('stroke', 'hsl(220, 60%, 55%)')
      .attr('stroke-width', 2)
      .attr('d', line)

    // ── Average volume line (20-day SMA) ────────────────────────
    if (avgVolume > 0) {
      const avgY = y(avgVolume)
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerW)
        .attr('y1', avgY)
        .attr('y2', avgY)
        .attr('stroke', 'hsl(220, 40%, 60%)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '6 4')
        .attr('stroke-opacity', 0.5)

      g.append('text')
        .attr('x', 4)
        .attr('y', avgY - 5)
        .attr('fill', 'hsl(220, 40%, 60%)')
        .attr('font-size', '9px')
        .attr('font-weight', '600')
        .text(`AVG ${d3.format('~s')(avgVolume)}`)
    }

    // ── Forecast zone ───────────────────────────────────────────
    if (fcData.length > 1) {
      const dividerX = x(histData[histData.length - 1].date)

      // Shaded forecast background
      g.append('rect')
        .attr('x', dividerX)
        .attr('y', 0)
        .attr('width', innerW - dividerX)
        .attr('height', innerH)
        .attr('fill', 'hsl(160, 70%, 45%)')
        .attr('fill-opacity', 0.04)

      // Forecast area
      g.append('path')
        .datum(fcData)
        .attr('fill', 'url(#vol-fc-grad)')
        .attr('d', area)

      // Forecast line
      g.append('path')
        .datum(fcData)
        .attr('fill', 'none')
        .attr('stroke', 'hsl(160, 70%, 45%)')
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '6 4')
        .attr('d', line)

      // Forecast data dots
      const fcOnly = fcData.filter((d) => d.isForecast)
      g.selectAll('.fc-dot')
        .data(fcOnly)
        .join('circle')
        .attr('class', 'fc-dot')
        .attr('cx', (d) => x(d.date))
        .attr('cy', (d) => y(d.volume))
        .attr('r', 3)
        .attr('fill', 'hsl(160, 70%, 45%)')
        .attr('fill-opacity', 0.6)

      // Divider line
      g.append('line')
        .attr('x1', dividerX)
        .attr('x2', dividerX)
        .attr('y1', 0)
        .attr('y2', innerH)
        .attr('stroke', 'var(--on-surface-variant)')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 3')

      // "TODAY" label at divider
      g.append('text')
        .attr('x', dividerX)
        .attr('y', -4)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--on-surface-muted)')
        .attr('font-size', '9px')
        .attr('font-weight', '700')
        .attr('letter-spacing', '0.08em')
        .text('TODAY')

      // "FORECAST" label in forecast zone
      g.append('text')
        .attr('x', dividerX + (innerW - dividerX) / 2)
        .attr('y', 14)
        .attr('text-anchor', 'middle')
        .attr('fill', 'hsl(160, 70%, 45%)')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('letter-spacing', '0.06em')
        .attr('fill-opacity', 0.7)
        .text('TIMESFM FORECAST')
    }

    // ── Hover interaction ───────────────────────────────────────
    const bisect = d3.bisector<DataPoint, Date>((d) => d.date).center

    const overlay = g
      .append('rect')
      .attr('width', innerW)
      .attr('height', innerH)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')

    const hoverLine = g
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerH)
      .attr('stroke', 'var(--on-surface-muted)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3 2')
      .style('display', 'none')

    const hoverCircle = g
      .append('circle')
      .attr('r', 5)
      .attr('fill', 'var(--surface)')
      .attr('stroke-width', 2.5)
      .style('display', 'none')

    overlay.on('mousemove', function (event) {
      const [mx] = d3.pointer(event)
      const hoverDate = x.invert(mx)
      const idx = bisect(combinedData, hoverDate)
      const d = combinedData[idx]
      if (!d) return

      const px = x(d.date)
      const py = y(d.volume)

      hoverLine.attr('x1', px).attr('x2', px).style('display', null)
      hoverCircle
        .attr('cx', px)
        .attr('cy', py)
        .attr(
          'stroke',
          d.isForecast ? 'hsl(160, 70%, 45%)' : 'hsl(220, 60%, 55%)',
        )
        .style('display', null)

      setTooltip({ x: px + margin.left, y: py + margin.top, d, avgVolume })
    })

    overlay.on('mouseleave', () => {
      hoverLine.style('display', 'none')
      hoverCircle.style('display', 'none')
      setTooltip(null)
    })
  }, [combinedData, histData, fcData, avgVolume, width, height])

  // ── Loading / error states ─────────────────────────────────────
  if (isLoading && historicalData.length === 0) {
    return <Skeleton className="w-full" style={{ height }} />
  }

  const pctVsAvg =
    forecastAvg > 0 && avgVolume > 0
      ? ((forecastAvg - avgVolume) / avgVolume) * 100
      : null

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* ── Summary stat chips ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-3)',
          alignItems: 'center',
        }}
      >
        {avgVolume > 0 && (
          <Chip label="Hist Avg" value={d3.format('~s')(avgVolume)} />
        )}
        {forecastData && forecastData.length > 0 && (
          <>
            <Chip
              label="Forecast Avg"
              value={d3.format('~s')(forecastAvg)}
              color="hsl(160, 70%, 45%)"
            />
            {pctVsAvg !== null && (
              <Chip
                label="vs Historical"
                value={`${pctVsAvg >= 0 ? '+' : ''}${pctVsAvg.toFixed(1)}%`}
                color={
                  pctVsAvg > 0
                    ? 'hsl(160, 70%, 45%)'
                    : 'hsl(0, 65%, 55%)'
                }
              />
            )}
            <Chip
              label="Trend"
              value={
                forecastTrend === 'up'
                  ? '↑ Rising'
                  : forecastTrend === 'down'
                    ? '↓ Declining'
                    : '→ Stable'
              }
              color={
                forecastTrend === 'up'
                  ? 'hsl(160, 70%, 45%)'
                  : forecastTrend === 'down'
                    ? 'hsl(0, 65%, 55%)'
                    : 'var(--on-surface-muted)'
              }
            />
          </>
        )}
        {isLoading && !forecastData && (
          <span
            style={{
              fontSize: 'var(--text-label-sm)',
              color: 'var(--on-surface-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--primary)',
                animation: 'ws-pulse 1.2s ease-in-out infinite',
              }}
            />
            Loading TimesFM forecast…
          </span>
        )}
        {error && (
          <span
            style={{
              fontSize: 'var(--text-label-sm)',
              color: 'hsl(0, 65%, 55%)',
            }}
          >
            ⚠ {error}
          </span>
        )}
      </div>

      {/* ── SVG chart ──────────────────────────────────────────── */}
      <svg ref={svgRef} />

      {/* ── Tooltip ────────────────────────────────────────────── */}
      {tooltip && <ChartTooltip tooltip={tooltip} width={width} />}

      {/* ── Legend ──────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-5)',
          marginTop: 'var(--space-2)',
          justifyContent: 'center',
          fontSize: '11px',
          color: 'var(--on-surface-muted)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span
            style={{
              width: 16,
              height: 3,
              borderRadius: 1,
              background: 'hsl(220, 60%, 55%)',
            }}
          />
          Historical
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span
            style={{
              width: 16,
              height: 3,
              borderRadius: 1,
              background: 'hsl(160, 70%, 45%)',
              backgroundImage:
                'repeating-linear-gradient(90deg, hsl(160,70%,45%) 0 6px, transparent 6px 10px)',
            }}
          />
          TimesFM Projection
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span
            style={{
              width: 16,
              height: 1.5,
              borderTop: '1.5px dashed hsl(220, 40%, 60%)',
            }}
          />
          Avg Volume
        </span>
      </div>
    </div>
  )
}

// ── Helper: stat chip ──────────────────────────────────────────────
function Chip({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-container)',
        border: '1px solid var(--outline-variant)',
        minWidth: 70,
      }}
    >
      <span
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase' as const,
          color: 'var(--on-surface-muted)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '14px',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: color ?? 'var(--on-surface)',
        }}
      >
        {value}
      </span>
    </div>
  )
}

// ── Helper: tooltip ────────────────────────────────────────────────
function ChartTooltip({
  tooltip,
  width,
}: {
  tooltip: TooltipState
  width: number
}) {
  const { d, avgVolume } = tooltip
  const pctVsAvg =
    avgVolume > 0 ? ((d.volume - avgVolume) / avgVolume) * 100 : 0

  return (
    <div
      style={{
        position: 'absolute',
        left: Math.min(tooltip.x + 15, width - 180),
        top: Math.max(10, tooltip.y - 30),
        background: 'var(--surface-container-high)',
        border: '1px solid var(--outline-variant)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-2) var(--space-3)',
        fontSize: 'var(--text-label-sm)',
        pointerEvents: 'none' as const,
        zIndex: 10,
        boxShadow: 'var(--shadow-md)',
        minWidth: 140,
      }}
    >
      <div
        style={{
          color: 'var(--on-surface-muted)',
          marginBottom: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {d.date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })}
        {d.isForecast && (
          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              color: 'hsl(160, 70%, 45%)',
              background: 'hsla(160, 70%, 45%, 0.12)',
              padding: '1px 5px',
              borderRadius: 'var(--radius-sm)',
              letterSpacing: '0.05em',
            }}
          >
            PROJ
          </span>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: d.isForecast
              ? 'hsl(160, 70%, 45%)'
              : 'var(--on-surface)',
            fontSize: '14px',
          }}
        >
          {d.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color:
              pctVsAvg > 0
                ? 'hsl(160, 70%, 45%)'
                : pctVsAvg < 0
                  ? 'hsl(0, 65%, 55%)'
                  : 'var(--on-surface-muted)',
          }}
        >
          {pctVsAvg >= 0 ? '+' : ''}
          {pctVsAvg.toFixed(1)}% avg
        </span>
      </div>
    </div>
  )
}
