import * as d3 from 'd3'
import { COLOR_BULL, COLOR_BULL_LIGHT, COLOR_BEAR, COLOR_BEAR_LIGHT, COLOR_FLAT } from './constants'
import type { OHLCBar } from './types'

export function candleColor(d: OHLCBar) {
  if (d.close > d.open) return COLOR_BULL
  if (d.close < d.open) return COLOR_BEAR
  return COLOR_FLAT
}

export function volumeColor(d: OHLCBar) {
  return d.close >= d.open ? COLOR_BULL_LIGHT : COLOR_BEAR_LIGHT
}

export function volumeStroke(d: OHLCBar) {
  return d.close >= d.open ? COLOR_BULL : COLOR_BEAR
}

export function computeSMA(data: OHLCBar[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += data[j].close
    return sum / period
  })
}

export function computeBollinger(data: OHLCBar[], period: number, mult = 2) {
  const sma = computeSMA(data, period)
  return data.map((_, i) => {
    const m = sma[i]
    if (m === null) return null
    let variance = 0
    for (let j = i - period + 1; j <= i; j++) variance += (data[j].close - m) ** 2
    const std = Math.sqrt(variance / period)
    return { upper: m + mult * std, middle: m, lower: m - mult * std }
  })
}

export function ensureGroup(
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
