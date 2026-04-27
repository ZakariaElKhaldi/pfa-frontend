import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'

export interface FeatureImportance {
  feature: string
  importance: number
}

interface FeatureImportanceChartProps {
  data: FeatureImportance[]
  width?: number
  height?: number
}

const MARGIN    = { top: 8, right: 120, bottom: 8, left: 8 }
const COLOR_PRI = 'hsl(243, 72%, 60%)'
const COLOR_MUT = 'hsl(220, 10%, 58%)'
const DURATION  = 500
const STAGGER   = 40

export function FeatureImportanceChart({ data, width = 480, height }: FeatureImportanceChartProps) {
  const sorted = useMemo(
    () => [...data].sort((a, b) => b.importance - a.importance),
    [data]
  )

  const rowH = 28
  const h = useMemo(
    () => height ?? sorted.length * rowH + MARGIN.top + MARGIN.bottom,
    [height, sorted.length]
  )

  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const svg = d3.select(ref.current)

    if (sorted.length === 0) {
      svg.selectAll('*').remove()
      return
    }

    const { top, right, bottom, left } = MARGIN
    const innerW = width - left - right

    const x = d3.scaleLinear()
      .domain([0, d3.max(sorted, d => d.importance)!])
      .range([0, innerW])

    const y = d3.scaleBand()
      .domain(sorted.map(d => d.feature))
      .range([top, h - bottom])
      .padding(0.35)

    // One shared transition — all groups start simultaneously, stagger via delay
    const tr = d3.transition<SVGSVGElement>()
      .duration(DURATION)
      .ease(d3.easeCubicOut)

    // ── Bars ──────────────────────────────────────────────────────────────
    let barsG = svg.select<SVGGElement>('g.fi-bars')
    if (barsG.empty()) barsG = svg.append('g').attr('class', 'fi-bars')

    barsG
      .selectAll<SVGRectElement, FeatureImportance>('rect')
      .data(sorted, d => d.feature)
      .join(
        enter => enter.append('rect')
          .attr('x', left)
          .attr('y', d => y(d.feature)!)
          .attr('width', 0)
          .attr('height', y.bandwidth())
          .attr('rx', 4)
          .attr('fill', COLOR_PRI)
          .attr('opacity', 0),
        update => update,
        exit => exit
          .transition(tr)
          .attr('width', 0)
          .attr('opacity', 0)
          .remove()
      )
      .transition(tr)
      .delay((_d, i) => i * STAGGER)
      .attr('y', d => y(d.feature)!)
      .attr('width', d => x(d.importance))
      .attr('height', y.bandwidth())
      .attr('fill', COLOR_PRI)
      .attr('opacity', (_d, i) => 1 - i * (0.5 / sorted.length))

    // ── Feature labels (inside bars) ──────────────────────────────────────
    let labG = svg.select<SVGGElement>('g.fi-labels')
    if (labG.empty()) labG = svg.append('g').attr('class', 'fi-labels')

    labG
      .selectAll<SVGTextElement, FeatureImportance>('text')
      .data(sorted, d => d.feature)
      .join(
        enter => enter.append('text')
          .attr('x', left + 8)
          .attr('y', d => y(d.feature)! + y.bandwidth() / 2)
          .attr('dy', '0.35em')
          .attr('fill', 'white')
          .attr('font-size', 11)
          .attr('font-weight', 600)
          .attr('opacity', 0)
          .text(d => d.feature),
        update => update.text(d => d.feature),
        exit => exit.transition(tr).attr('opacity', 0).remove()
      )
      .transition(tr)
      .delay((_d, i) => i * STAGGER)
      .attr('y', d => y(d.feature)! + y.bandwidth() / 2)
      .attr('opacity', 1)

    // ── Value labels (right of bars) ──────────────────────────────────────
    let valG = svg.select<SVGGElement>('g.fi-values')
    if (valG.empty()) valG = svg.append('g').attr('class', 'fi-values')

    valG
      .selectAll<SVGTextElement, FeatureImportance>('text')
      .data(sorted, d => d.feature)
      .join(
        enter => enter.append('text')
          .attr('x', d => left + x(d.importance) + 6)
          .attr('y', d => y(d.feature)! + y.bandwidth() / 2)
          .attr('dy', '0.35em')
          .attr('fill', COLOR_MUT)
          .attr('font-size', 11)
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('opacity', 0)
          .text(d => d.importance.toFixed(3)),
        update => update.text(d => d.importance.toFixed(3)),
        exit => exit.transition(tr).attr('opacity', 0).remove()
      )
      .transition(tr)
      .delay((_d, i) => i * STAGGER)
      .attr('x', d => left + x(d.importance) + 6)
      .attr('y', d => y(d.feature)! + y.bandwidth() / 2)
      .attr('opacity', 1)

  }, [sorted, width, h])

  if (sorted.length === 0) return null

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${h}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-label="Feature importance chart"
    />
  )
}
