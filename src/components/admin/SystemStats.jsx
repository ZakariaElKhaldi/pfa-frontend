import { useSystemStats } from '@/hooks/useAdmin'
import StatCard from '@/components/shared/StatCard'
import { Users, Zap, Activity, Database } from 'lucide-react'

export default function SystemStats() {
  const { data } = useSystemStats()
  if (!data) return null

  const stats = [
    { label: 'Total Users',   value: data.total_users,    icon: Users },
    { label: 'Signals Today', value: data.signals_today,  icon: Zap },
    { label: 'WS Connections',value: data.ws_connections, icon: Activity },
    { label: 'DB Size',       value: data.db_size_mb + ' MB', icon: Database },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  )
}
