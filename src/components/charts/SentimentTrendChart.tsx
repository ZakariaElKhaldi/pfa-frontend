import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface SentimentPoint {
  time: string
  bullish: number
  bearish: number
  neutral: number
}

interface SentimentTrendChartProps {
  data: SentimentPoint[]
  height?: number
}

export function SentimentTrendChart({ data, height = 240 }: SentimentTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="gradBull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="hsl(158, 60%, 35%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(158, 60%, 35%)" stopOpacity={0}   />
          </linearGradient>
          <linearGradient id="gradBear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="hsl(4, 68%, 50%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(4, 68%, 50%)" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsla(220,15%,45%,0.22)" />
        <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'hsl(220,10%,58%)' }} axisLine={false} tickLine={false} />
        <YAxis domain={[-1, 1]} tick={{ fontSize: 11, fill: 'hsl(220,10%,58%)' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: 'hsl(220,22%,89%)', border: '1px solid hsla(220,15%,45%,0.22)', borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: 'hsl(220,20%,14%)', fontWeight: 600 }}
        />
        <Area type="monotone" dataKey="bullish" stroke="hsl(158, 60%, 35%)" fill="url(#gradBull)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="bearish" stroke="hsl(4, 68%, 50%)"   fill="url(#gradBear)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
