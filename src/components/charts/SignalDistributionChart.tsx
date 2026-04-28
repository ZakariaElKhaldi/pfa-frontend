import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export interface SignalDistPoint {
  /** Time bucket label (e.g. "Jan 3", "Week 12") */
  label: string
  buy:   number
  hold:  number
  sell:  number
}

export interface SignalDistributionChartProps {
  data:          SignalDistPoint[]
  defaultMode?:  'count' | 'percent'
  height?:       number
}

type Mode = 'count' | 'percent'

// ── colors ───────────────────────────────────────────────────────────────────
const C_BUY  = 'hsl(158,60%,38%)'
const C_HOLD = 'hsl(220,10%,52%)'
const C_SELL = 'hsl(4,68%,50%)'
const CMUT   = 'hsl(220,10%,58%)'
const CGRID  = 'hsla(220,15%,45%,0.18)'

// ── helpers ───────────────────────────────────────────────────────────────────
function toPercent(d: SignalDistPoint) {
  const total = d.buy + d.hold + d.sell
  if (total === 0) return { label: d.label, buy: 0, hold: 0, sell: 0 }
  return {
    label: d.label,
    buy:   (d.buy  / total) * 100,
    hold:  (d.hold / total) * 100,
    sell:  (d.sell / total) * 100,
  }
}

function fmtTick(mode: Mode) {
  return (v: number) => mode === 'percent' ? `${v.toFixed(0)}%` : String(v)
}

function fmtTooltip(mode: Mode) {
  return (value: number) =>
    mode === 'percent'
      ? `${value.toFixed(1)}%`
      : `${value} signals`
}

// ── custom legend ─────────────────────────────────────────────────────────────
function ChartLegend({ mode, onToggle }: { mode: Mode; onToggle: () => void }) {
  const items = [
    { key: 'buy',  col: C_BUY,  label: 'BUY'  },
    { key: 'hold', col: C_HOLD, label: 'HOLD' },
    { key: 'sell', col: C_SELL, label: 'SELL' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', fontSize: 'var(--text-label-sm)' }}>
      {items.map(({ key, col, label }) => (
        <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--on-surface-variant)' }}>
          <svg width={10} height={10} aria-hidden><rect width={10} height={10} rx={2} fill={col} /></svg>
          {label}
        </span>
      ))}
      <button
        type="button"
        onClick={onToggle}
        style={{
          marginLeft:   'auto',
          padding:      '2px 10px',
          borderRadius: 'var(--radius-full)',
          border:       '1px solid var(--outline-variant)',
          background:   'var(--surface-container)',
          color:        'var(--on-surface-variant)',
          fontSize:     'var(--text-label-sm)',
          cursor:       'pointer',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {mode === 'count' ? '% view' : '# view'}
      </button>
    </div>
  )
}

// ── custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, mode }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  mode: Mode
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + p.value, 0)
  return (
    <div style={{
      background:   'var(--surface-container-high)',
      border:       '1px solid var(--outline-variant)',
      borderRadius: 'var(--radius-md)',
      padding:      'var(--space-2) var(--space-3)',
      fontSize:     'var(--text-label-sm)',
      color:        'var(--on-surface)',
      minWidth:     130,
    }}>
      <div style={{ color: 'var(--on-surface-muted)', marginBottom: 'var(--space-1)' }}>{label}</div>
      {[...payload].reverse().map(p => (
        <div key={p.name} style={{ color: p.color, fontVariantNumeric: 'tabular-nums' }}>
          {p.name.toUpperCase()}·· {fmtTooltip(mode)(p.value)}
        </div>
      ))}
      {mode === 'count' && (
        <div style={{ borderTop: '1px solid var(--outline-variant)', marginTop: 'var(--space-1)', paddingTop: 'var(--space-1)', color: CMUT }}>
          Total: {total.toFixed(0)}
        </div>
      )}
    </div>
  )
}

// ── component ─────────────────────────────────────────────────────────────────
export function SignalDistributionChart({
  data,
  defaultMode = 'count',
  height      = 240,
}: SignalDistributionChartProps) {
  const [mode, setMode] = useState<Mode>(defaultMode)

  const chartData = useMemo(
    () => mode === 'percent' ? data.map(toPercent) : data,
    [data, mode],
  )

  if (data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CMUT, fontSize: 'var(--text-body-sm)' }}>
        No signal data available
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <ChartLegend mode={mode} onToggle={() => setMode(m => m === 'count' ? 'percent' : 'count')} />

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke={CGRID} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: CMUT }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtTick(mode)}
            tick={{ fontSize: 11, fill: CMUT }}
            axisLine={false}
            tickLine={false}
            domain={mode === 'percent' ? [0, 100] : [0, 'auto']}
          />
          <Tooltip
            content={<ChartTooltip mode={mode} />}
            cursor={{ fill: 'hsla(220,15%,50%,0.08)' }}
          />
          <Bar dataKey="sell" stackId="a" fill={C_SELL} radius={[0, 0, 0, 0]} isAnimationActive>
            {chartData.map((_, i) => <Cell key={i} fill={C_SELL} />)}
          </Bar>
          <Bar dataKey="hold" stackId="a" fill={C_HOLD} isAnimationActive>
            {chartData.map((_, i) => <Cell key={i} fill={C_HOLD} />)}
          </Bar>
          <Bar dataKey="buy" stackId="a" fill={C_BUY} radius={[4, 4, 0, 0]} isAnimationActive>
            {chartData.map((_, i) => <Cell key={i} fill={C_BUY} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
