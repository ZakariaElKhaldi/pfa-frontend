import { useState } from 'react'
import { useLatestSignals, useSignalAccuracy, useSymbolSignalHistory } from '@/hooks/useSignals'
import { useSignalStream } from '@/hooks/useSignalStream'
import SignalCard from '@/components/signals/SignalCard'
import SectionCard from '@/components/shared/SectionCard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import { Input } from '@/components/ui/input'
import { Zap } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'

const SIGNAL_COLORS = { BUY: '#00E676', SELL: '#FF5252', HOLD: '#FFB300' }
const CHART_STYLE = {
  grid:    'var(--color-surface-low)',
  axis:    'var(--color-muted)',
  tooltip: { background: 'var(--color-container)', border: 'none', borderRadius: 8, fontSize: 12 },
}

export default function SignalsPage() {
  const [symbolFilter, setSymbolFilter] = useState('')

  const { data: recent, isLoading } = useLatestSignals(50)
  const { data: bySymbol }          = useSymbolSignalHistory(symbolFilter.toUpperCase() || undefined)
  const { data: accuracy }          = useSignalAccuracy()
  useSignalStream()

  const signals = symbolFilter.length >= 1 ? (bySymbol ?? []) : (recent ?? [])

  const accuracyData = accuracy?.by_signal
    ? Object.entries(accuracy.by_signal).map(([signal, pct]) => ({ signal, pct }))
    : []

  return (
    <div className="flex flex-col gap-4">
      {accuracyData.length > 0 && (
        <SectionCard title="Signal Accuracy (30d)">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={accuracyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} vertical={false} />
              <XAxis
                dataKey="signal"
                tick={{ fill: CHART_STYLE.axis, fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: CHART_STYLE.axis, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={CHART_STYLE.tooltip}
                formatter={(v) => [`${v}%`, 'Accuracy']}
              />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                {accuracyData.map((d) => (
                  <Cell key={d.signal} fill={SIGNAL_COLORS[d.signal] ?? '#2979FF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-primary-text">Signals</h2>
        <Input
          value={symbolFilter}
          onChange={(e) => setSymbolFilter(e.target.value)}
          placeholder="Filter by symbol…"
          className="h-8 w-36 text-xs font-mono bg-container border-container placeholder:text-muted"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size={24} /></div>
      ) : !signals.length ? (
        <EmptyState icon={Zap} title="No signals found" />
      ) : (
        <div className="flex flex-col gap-2">
          {signals.map((s) => <SignalCard key={s.id} signal={s} />)}
        </div>
      )}
    </div>
  )
}
