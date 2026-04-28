interface TotalDisplayProps {
  total:     number
  isBuy:     boolean
}

export function TotalDisplay({ total, isBuy }: TotalDisplayProps) {
  if (total <= 0) return null

  const accentVar = isBuy ? 'var(--secondary)' : 'var(--tertiary)'
  const accentBg  = isBuy ? 'var(--secondary-container)' : 'var(--tertiary-container)'

  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        'var(--space-3) var(--space-4)',
        background:     accentBg,
        borderRadius:   'var(--radius-md)',
      }}
    >
      <span style={{ fontSize: 'var(--text-label-md)', color: accentVar, fontWeight: 500 }}>
        Estimated total
      </span>
      <span
        style={{
          fontFamily:         'var(--font-mono)',
          fontSize:           'var(--text-mono-lg)',
          fontWeight:         700,
          color:              accentVar,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {total.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
      </span>
    </div>
  )
}
