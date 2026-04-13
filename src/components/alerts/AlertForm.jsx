import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function AlertForm({ filters, onChange }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Label className="text-xs text-[--color-subtle] whitespace-nowrap">Type</Label>
        <Select
          value={filters.type ?? 'all'}
          onValueChange={(v) => onChange({ ...filters, type: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="h-8 w-40 text-xs bg-[--color-surface] border-[--color-container]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[--color-surface-low] border-[--color-container]">
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="divergence">Divergence</SelectItem>
            <SelectItem value="extreme_sentiment">Extreme Sentiment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-xs text-[--color-subtle]">Status</Label>
        <Select
          value={filters.resolved ?? 'unresolved'}
          onValueChange={(v) => onChange({ ...filters, resolved: v })}
        >
          <SelectTrigger className="h-8 w-36 text-xs bg-[--color-surface] border-[--color-container]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[--color-surface-low] border-[--color-container]">
            <SelectItem value="unresolved">Unresolved</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
