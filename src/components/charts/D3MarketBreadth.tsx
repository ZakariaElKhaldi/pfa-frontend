import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'

export interface SignalEntry {
  signal: 'BUY' | 'SELL' | 'HOLD'
  created_at: string
}

interface Props {
  data: SignalEntry[]
  days?: number
  height?: number
  forecastData?: number[]
}

interface BreadthPoint {
  date: string
  buy: number
  sell: number
  net: number
  cumulative: number
  isForecast?: boolean
}

interface TooltipState extends BreadthPoint {
  x: number
  y: number
  state: string
}

type MarketRegime =
  | 'Expansion'
  | 'Contraction'
  | 'Exhaustion'
  | 'Recovery'
  | 'Neutral'

const POSITIVE = 'hsl(160, 72%, 45%)'
const NEGATIVE = 'hsl(0, 72%, 56%)'

export function D3MarketBreadth({
  data,
  days = 30,
  height = 340,
  forecastData,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const [width, setWidth] = useState(900)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  // ─────────────────────────────────────────────
  // Responsive
  // ─────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })

    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  // ─────────────────────────────────────────────
  // Process data
  // ─────────────────────────────────────────────
    const { breadthData, currentBreadth, insightText, combinedSeries, analysis } = useMemo(() => {
      const cutoff = Date.now() - days * 86_400_000
      const filtered = data.filter(d => new Date(d.created_at).getTime() >= cutoff)
  
      const byDay: Record<string, { BUY: number; SELL: number }> = {}
      for (const d of filtered) {
        const day = new Date(d.created_at).toISOString().slice(0, 10)
        if (!byDay[day]) byDay[day] = { BUY: 0, SELL: 0 }
        if (d.signal === 'BUY') byDay[day].BUY++
        if (d.signal === 'SELL') byDay[day].SELL++
      }
  
      let cumulative = 0
      const processed: BreadthPoint[] = Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, counts]) => {
          const net = counts.BUY - counts.SELL
          cumulative += net
          return {
            date,
            buy: counts.BUY,
            sell: counts.SELL,
            net,
            cumulative,
          }
        })
        
      // Prepare combined series with forecast dates
      let combined: BreadthPoint[] = [...processed]
      if (forecastData && forecastData.length > 0 && processed.length > 0) {
        const lastDate = new Date(processed[processed.length - 1].date)
        const forecastSeries = forecastData.map((val, i) => {
          const d = new Date(lastDate)
          d.setDate(d.getDate() + i + 1)
          return {
            date: d.toISOString().slice(0, 10),
            buy: 0,
            sell: 0,
            net: 0,
            cumulative: val,
            isForecast: true
          }
        })
        combined = [...combined, ...forecastSeries]
      }
        
      // Calculate current stats based on the last 5 days
      const recent = processed.slice(-5)
      const recentNet = d3.sum(recent, d => d.net)
      const momentum = recent.length >= 2 ? recent[recent.length - 1].net - recent[0].net : 0
      
      let insight = "Market breadth is neutral. Participation is balanced between buyers and sellers."
      let headline = "Mixed Participation"
      let regime: MarketRegime = "Neutral"

      if (forecastData && forecastData.length > 0) {
        const firstF = forecastData[0]
        const lastF = forecastData[forecastData.length - 1]
        const forecastTrend = lastF - firstF
        
        if (forecastTrend > 10) {
          insight = "TimesFM projects a strong market expansion. The A/D line is expected to break higher, signaling robust underlying participation."
          headline = "Projected Expansion"
          regime = "Expansion"
        } else if (forecastTrend < -10) {
          insight = "TimesFM projects market breadth deterioration. Risk-off behavior is likely to accelerate, prepare for distribution."
          headline = "Projected Contraction"
          regime = "Contraction"
        } else {
          insight = "TimesFM projects sideways breadth. The market lacks clear directional participation in the near term."
          headline = "Projected Neutral"
          regime = "Neutral"
        }
      } else {
        if (recentNet > 10 && momentum > 0) {
          insight = "Strong Bullish Breadth: Buying pressure is expanding across the market. A healthy sign for continued uptrend."
          headline = "Market Expansion"
          regime = "Expansion"
        } else if (recentNet > 10 && momentum <= 0) {
          insight = "Bullish but Fading: Buyers are still in control, but momentum is slowing. Watch for a potential rotation."
          headline = "Buying Exhaustion"
          regime = "Exhaustion"
        } else if (recentNet < -10 && momentum < 0) {
          insight = "Strong Bearish Breadth: Broad-based selling pressure. The market is in a risk-off phase."
          headline = "Market Contraction"
          regime = "Contraction"
        } else if (recentNet < -10 && momentum >= 0) {
          insight = "Bearish but Improving: Sellers are exhausted. Breadth is negative but starting to curl upwards."
          headline = "Bearish Recovery"
          regime = "Recovery"
        }
      }
      
      return {
        breadthData: processed,
        combinedSeries: combined,
        currentBreadth: {
          recentNet,
          currentCum: processed.length > 0 ? processed[processed.length - 1].cumulative : 0,
          trend: momentum > 0 ? 'Improving' : momentum < 0 ? 'Deteriorating' : 'Flat'
        },
        insightText: insight,
        analysis: { headline, regime }
      }
    }, [data, days, forecastData])

  // ─────────────────────────────────────────────
  // Chart
  // ─────────────────────────────────────────────
  useEffect(() => {
    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()

    if (breadthData.length < 2) return

    const margin = {
      top: 24,
      right: 56,
      bottom: 30,
      left: 40,
    }

    const innerW =
      width - margin.left - margin.right

    const innerH =
      height - margin.top - margin.bottom

    svg.attr('width', width).attr('height', height)

    const g = svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left},${margin.top})`
      )

    const x = d3
      .scalePoint<string>()
      .domain(combinedSeries.map(d => d.date))
      .range([0, innerW])
      .padding(0.5)

    const maxNet =
      d3.max(breadthData, d => Math.abs(d.net)) ??
      10

    const yBars = d3
      .scaleLinear()
      .domain([-maxNet * 1.3, maxNet * 1.3])
      .range([innerH, 0])

    const minCum =
      d3.min(
        combinedSeries,
        d => d.cumulative
      ) ?? 0

    const maxCum =
      d3.max(
        combinedSeries,
        d => d.cumulative
      ) ?? 10

    const yLine = d3
      .scaleLinear()
      .domain([
        minCum - 5,
        maxCum + 5,
      ])
      .range([innerH, 0])

    // ─────────────────────────────────────────
    // Shaded forecast zone
    // ─────────────────────────────────────────
    if (forecastData && forecastData.length > 0 && breadthData.length > 0) {
      const forecastStartX = x(breadthData[breadthData.length - 1].date) ?? 0
      
      g.append('rect')
        .attr('x', forecastStartX)
        .attr('y', 0)
        .attr('width', innerW - forecastStartX)
        .attr('height', innerH)
        .attr('fill', 'hsla(280, 70%, 50%, 0.05)')
        
      g.append('line')
        .attr('x1', forecastStartX)
        .attr('x2', forecastStartX)
        .attr('y1', 0)
        .attr('y2', innerH)
        .attr('stroke', 'hsl(280, 70%, 50%)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4 4')
        .attr('opacity', 0.5)
        
      g.append('text')
        .attr('x', forecastStartX + 6)
        .attr('y', 14)
        .attr('fill', 'hsl(280, 70%, 50%)')
        .attr('font-size', 9)
        .attr('font-weight', 700)
        .attr('letter-spacing', '0.05em')
        .attr('opacity', 0.8)
        .text('AI FORECAST')
    }

    // ─────────────────────────────────────────
    // Background zero line
    // ─────────────────────────────────────────
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerW)
      .attr('y1', yBars(0))
      .attr('y2', yBars(0))
      .attr('stroke', 'var(--outline-variant)')
      .attr('stroke-dasharray', '4 4')

    // ─────────────────────────────────────────
    // Histogram
    // ─────────────────────────────────────────
    const barWidth = Math.max(
      3,
      Math.min(
        10,
        innerW / combinedSeries.length - 3
      )
    )

    g.selectAll('.bar')
      .data(breadthData)
      .join('rect')
      .attr('x', d => (x(d.date) ?? 0) - barWidth / 2)
      .attr('y', d =>
        d.net >= 0
          ? yBars(d.net)
          : yBars(0)
      )
      .attr('width', barWidth)
      .attr(
        'height',
        d =>
          Math.abs(yBars(d.net) - yBars(0))
      )
      .attr(
        'fill',
        d => (d.net >= 0 ? POSITIVE : NEGATIVE)
      )
      .attr('opacity', 0.22)
      .attr('rx', 2)

    // ─────────────────────────────────────────
    // Cumulative line
    // ─────────────────────────────────────────
    const line = d3
      .line<any>()
      .x(d => x(d.date) ?? 0)
      .y(d => yLine(d.cumulative))
      .curve(d3.curveMonotoneX)

    // Historical Line
    g.append('path')
      .datum(breadthData)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'var(--primary)')
      .attr('stroke-width', 8)
      .attr('opacity', 0.08)
      .style('filter', 'blur(6px)')

    g.append('path')
      .datum(breadthData)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'var(--primary)')
      .attr('stroke-width', 2.5)

    // Forecast Line
    if (forecastData && forecastData.length > 0) {
      // Connect history to forecast
      const forecastLineData = [
        breadthData[breadthData.length - 1],
        ...combinedSeries.slice(breadthData.length)
      ]
      
      g.append('path')
        .datum(forecastLineData)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'hsl(280, 70%, 50%)')
        .attr('stroke-width', 6)
        .attr('opacity', 0.15)
        .style('filter', 'blur(4px)')

      g.append('path')
        .datum(forecastLineData)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'hsl(280, 70%, 50%)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '6 4')
    }

    // ─────────────────────────────────────────
    // End label
    // ─────────────────────────────────────────
    const last =
      combinedSeries[combinedSeries.length - 1]

    g.append('text')
      .attr('x', innerW + 8)
      .attr('y', yLine(last.cumulative))
      .attr('fill', last.isForecast ? 'hsl(280, 70%, 50%)' : 'var(--primary)')
      .attr('font-size', 11)
      .attr('font-weight', 700)
      .text('A/D')

    // ─────────────────────────────────────────
    // X axis
    // ─────────────────────────────────────────
    const every = Math.max(
      1,
      Math.floor(combinedSeries.length / 6)
    )

    g.append('g')
      .attr(
        'transform',
        `translate(0,${innerH})`
      )
      .call(
        d3
          .axisBottom(x)
          .tickValues(
            combinedSeries
              .filter((_, i) => i % every === 0)
              .map(d => d.date)
          )
          .tickFormat(d => {
            const dt = new Date(
              d + 'T00:00:00'
            )

            return dt.toLocaleDateString(
              'en-US',
              {
                month: 'short',
                day: 'numeric',
              }
            )
          })
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove())
      .call(g =>
        g
          .selectAll('.tick text')
          .attr(
            'fill',
            'var(--on-surface-muted)'
          )
          .attr('font-size', 10)
      )

    // ─────────────────────────────────────────
    // Hover
    // ─────────────────────────────────────────
    const hoverLine = g
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerH)
      .attr('stroke', 'var(--outline)')
      .attr('stroke-dasharray', '3 3')
      .style('display', 'none')

    const hoverDot = g
      .append('circle')
      .attr('r', 4)
      .attr('fill', 'var(--primary)')
      .style('display', 'none')

    g.append('rect')
      .attr('width', innerW)
      .attr('height', innerH)
      .attr('fill', 'transparent')
      .on('mousemove', event => {
        const [mx] = d3.pointer(event)

        const domain = x.domain()

        const step =
          x.step?.() ?? innerW / domain.length

        const idx = Math.max(
          0,
          Math.min(
            domain.length - 1,
            Math.round(mx / step)
          )
        )

        const d = combinedSeries[idx]

        const px = x(d.date) ?? 0

        hoverLine
          .attr('x1', px)
          .attr('x2', px)
          .style('display', null)

        hoverDot
          .attr('cx', px)
          .attr('cy', yLine(d.cumulative))
          .style('display', null)

        let state = 'Mixed participation'

        if (d.isForecast) {
          state = 'AI Forecast'
        } else {
          if (d.net > 15)
            state = 'Broad participation'
  
          if (d.net < -15)
            state = 'Distribution pressure'
        }

        setTooltip({
          ...d,
          x: px + margin.left,
          y: yLine(d.cumulative) + margin.top,
          state,
        })
      })
      .on('mouseleave', () => {
        hoverLine.style('display', 'none')
        hoverDot.style('display', 'none')
        setTooltip(null)
      })
  }, [breadthData, combinedSeries, width, height, forecastData])

  if (breadthData.length < 2) return null

  const netColor = currentBreadth.recentNet >= 0 ? POSITIVE : NEGATIVE
  const regimeColor =
    analysis.regime === 'Expansion'
      ? POSITIVE
      : analysis.regime === 'Contraction'
        ? NEGATIVE
        : analysis.regime === 'Recovery'
          ? 'hsl(45, 90%, 50%)'
          : analysis.regime === 'Exhaustion'
            ? 'hsl(30, 90%, 55%)'
            : 'var(--on-surface-muted)'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        padding: 20,
        borderRadius: 24,
        overflow: 'hidden',
        border:
          '1px solid var(--outline-variant)',
        background:
          analysis.regime === 'Expansion'
            ? 'linear-gradient(to bottom, rgba(16,185,129,.08), transparent)'
            : analysis.regime ===
              'Contraction'
              ? 'linear-gradient(to bottom, rgba(239,68,68,.08), transparent)'
              : 'var(--surface)',
      }}
    >
      {/* ───────────────────────────────────── */}
      {/* Header */}
      {/* ───────────────────────────────────── */}

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'flex-start',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                padding:
                  '6px 10px',
                borderRadius: 999,
                background:
                  'color-mix(in srgb, ' +
                  regimeColor +
                  ' 18%, transparent)',
                color: regimeColor,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing:
                  '.04em',
                textTransform:
                  'uppercase',
              }}
            >
              {analysis.regime}
            </div>

            <span
              style={{
                fontSize: 12,
                color:
                  'var(--on-surface-muted)',
              }}
            >
              {days} day breadth
            </span>
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            {analysis.headline}
          </div>

          <div
            style={{
              maxWidth: 680,
              color:
                'var(--on-surface-muted)',
              lineHeight: 1.6,
              fontSize: 14,
            }}
          >
            {insightText}
          </div>
        </div>

        {/* Metrics */}

        <div
          style={{
            display: 'flex',
            gap: 16,
          }}
        >
          <Metric
            label='5D Net'
            value={`${currentBreadth.recentNet > 0 ? '+' : ''}${currentBreadth.recentNet}`}
            color={netColor}
          />

          <Metric
            label='Momentum'
            value={currentBreadth.trend}
            color={currentBreadth.trend === 'Improving' ? POSITIVE : currentBreadth.trend === 'Deteriorating' ? NEGATIVE : 'var(--on-surface)'}
          />
        </div>
      </div>

      {/* ───────────────────────────────────── */}
      {/* Chart */}
      {/* ───────────────────────────────────── */}

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        <svg ref={svgRef} />

        {tooltip && (
          <div
            style={{
              position: 'absolute',
              left: Math.min(
                tooltip.x + 18,
                width - 220
              ),
              top: 20,
              width: 210,
              padding: 14,
              borderRadius: 16,
              backdropFilter:
                'blur(18px)',
              background:
                'var(--surface)',
              border:
                '1px solid var(--outline-variant)',
              boxShadow:
                '0 10px 30px rgba(0,0,0,.15)',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection:
                  'column',
                gap: 2,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  textTransform:
                    'uppercase',
                  letterSpacing:
                    '.05em',
                  color:
                    'var(--on-surface-muted)',
                }}
              >
                {new Date(
                  tooltip.date +
                  'T00:00:00'
                ).toLocaleDateString(
                  'en-US',
                  {
                    month: 'long',
                    day: 'numeric',
                  }
                )}
              </span>

              <span
                style={{
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                {tooltip.state}
              </span>
            </div>

            {/* Tooltip Content inside the map */}
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
              }}
            >
              <span
                style={{
                  color:
                    'var(--on-surface-muted)',
                }}
              >
                Net breadth
              </span>

              <span
                style={{
                  fontWeight: 800,
                  color: tooltip.isForecast ? 'var(--on-surface-muted)' :
                    tooltip.net >= 0
                      ? POSITIVE
                      : NEGATIVE,
                }}
              >
                {tooltip.isForecast ? 'N/A' : (tooltip.net > 0
                  ? '+'
                  : '') + tooltip.net}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
              }}
            >
              <span
                style={{
                  color:
                    'var(--on-surface-muted)',
                }}
              >
                A/D line
              </span>

              <span
                style={{
                  fontWeight: 800,
                  color: tooltip.isForecast ? 'hsl(280, 70%, 50%)' : 'var(--on-surface)',
                }}
              >
                {Math.round(tooltip.cumulative)}
              </span>
            </div>

            <div
              style={{
                paddingTop: 8,
                borderTop:
                  '1px solid var(--outline-variant)',
                fontSize: 12,
                lineHeight: 1.5,
                color:
                  'var(--on-surface-muted)',
              }}
            >
              {tooltip.state ===
                'AI Forecast'
                ? 'Projected underlying momentum.'
                : tooltip.state ===
                'Broad participation'
                ? 'Buying pressure expanded across the market.'
                : tooltip.state ===
                  'Distribution pressure'
                  ? 'Selling pressure intensified beneath the surface.'
                  : 'Participation remained mixed without strong confirmation.'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Metric({
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
        gap: 4,
        minWidth: 120,
      }}
    >
      <span
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '.04em',
          color:
            'var(--on-surface-muted)',
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontSize: 22,
          fontWeight: 800,
          color:
            color ??
            'var(--on-surface)',
          lineHeight: 1,
          fontVariantNumeric:
            'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}
