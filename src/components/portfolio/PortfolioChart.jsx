import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { formatPrice } from '@/lib/utils'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="text-subtle mb-1">{label}</p>
      <p className="font-data font-semibold text-max-text">
        ${formatPrice(payload[0].value)}
      </p>
    </div>
  )
}

export default function PortfolioChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#2979FF" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#2979FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis
          tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={42}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#2979FF"
          strokeWidth={2}
          fill="url(#portfolioGrad)"
          dot={false}
          activeDot={{ r: 3, fill: '#2979FF' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
