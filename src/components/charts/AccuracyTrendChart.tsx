import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface AccuracyPoint {
  label: string
  accuracy: number
}

interface AccuracyTrendChartProps {
  data: AccuracyPoint[]
  height?: number
}

function barColor(accuracy: number): string {
  if (accuracy >= 0.7) return 'hsl(158, 60%, 35%)'
  if (accuracy >= 0.5) return 'hsl(38, 88%, 46%)'
  return 'hsl(4, 68%, 50%)'
}

export function AccuracyTrendChart({ data, height = 200 }: AccuracyTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsla(220,15%,45%,0.22)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(220,10%,58%)' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11, fill: 'hsl(220,10%,58%)' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => [`${((v as number) * 100).toFixed(1)}%`, 'Accuracy']}
          contentStyle={{ background: 'hsl(220,22%,89%)', border: '1px solid hsla(220,15%,45%,0.22)', borderRadius: 10, fontSize: 12 }}
        />
        <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={barColor(entry.accuracy)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
