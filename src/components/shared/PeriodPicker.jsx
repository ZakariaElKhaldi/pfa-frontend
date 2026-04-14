import { cn } from '@/lib/utils'

/**
 * Reusable pill-style period / interval selector.
 * options: [{ label, value }]
 */
export default function PeriodPicker({ options, value, onChange }) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1 rounded text-xs font-mono transition-colors',
            value === opt.value
              ? 'bg-action-container text-action-hover'
              : 'text-subtle hover:text-primary-text'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
