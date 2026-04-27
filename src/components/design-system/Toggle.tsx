interface ToggleProps {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}

export function Toggle({ id, checked, onChange, label }: ToggleProps) {
  return (
    <label className="toggle" htmlFor={id} aria-label={label}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <div className="toggle-track">
        <div className="toggle-thumb" />
      </div>
    </label>
  )
}
