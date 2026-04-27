interface AccuracyRingProps {
  pct: number
  color?: string
  size?: number
}

export function AccuracyRing({ pct, color = 'var(--primary)', size = 72 }: AccuracyRingProps) {
  const r = 30
  const c = 2 * Math.PI * r
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * c

  return (
    <div className="accuracy-gauge-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 72 72" role="img" aria-label={`${pct}% accuracy`}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--surface-container-high)" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dasharray 0.8s var(--ease-out)',
          }}
        />
      </svg>
      <div className="accuracy-gauge-value text-mono-md">{pct}%</div>
    </div>
  )
}
