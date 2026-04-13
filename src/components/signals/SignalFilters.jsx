import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'

export default function SignalFilters({ filters, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={filters.signal ?? 'all'}
        onValueChange={(v) => onChange({ ...filters, signal: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="w-28 h-8 text-xs bg-[--color-surface-low] border-[--color-container]">
          <SelectValue placeholder="Signal" />
        </SelectTrigger>
        <SelectContent className="bg-[--color-surface-low] border-[--color-container]">
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="BUY">BUY</SelectItem>
          <SelectItem value="SELL">SELL</SelectItem>
          <SelectItem value="HOLD">HOLD</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.period ?? '1d'}
        onValueChange={(v) => onChange({ ...filters, period: v })}
      >
        <SelectTrigger className="w-24 h-8 text-xs bg-[--color-surface-low] border-[--color-container]">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent className="bg-[--color-surface-low] border-[--color-container]">
          <SelectItem value="1h">1 hour</SelectItem>
          <SelectItem value="1d">Today</SelectItem>
          <SelectItem value="7d">7 days</SelectItem>
          <SelectItem value="30d">30 days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
