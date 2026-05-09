import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icons } from '@/components/design-system'
import { AnimatedNumber } from '@/components/common/AnimatedNumber'

export interface MetricCardProps {
  label: string
  value: string
  delta: string
  positive: boolean
}

function parseNumeric(value: string): number | null {
  const cleaned = value.replace(/[^0-9.\-+]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

const overlayVariants = {
  initial: { opacity: 0, scale: 0.96, y: -4 },
  animate: { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const } },
  exit:    { opacity: 0, scale: 0.96, y: -4, transition: { duration: 0.12, ease: 'easeIn' as const } },
}

export function MetricCard({ label, value, delta, positive }: MetricCardProps) {
  const [hovered, setHovered] = useState(false)
  const numeric = parseNumeric(value)
  const prefix  = value.replace(/[\d.\-]/g, '').split(/[\d]/)[0] ?? ''
  const suffix  = numeric !== null ? value.slice(value.indexOf(String(numeric).at(-1) ?? '') + 1) : ''

  return (
    <div
      className="metric-card"
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="metric-card-label">{label}</span>
      <span className="metric-card-value">
        {numeric !== null ? (
          <>
            {prefix}
            <AnimatedNumber
              value={numeric}
              format={(v) => {
                const decimals = value.includes('.') ? (value.split('.')[1]?.length ?? 0) : 0
                return v.toFixed(decimals)
              }}
            />
            {suffix}
          </>
        ) : (
          value
        )}
      </span>
      <span className={`metric-card-delta ${positive ? 'positive' : 'negative'}`}>
        {positive ? <Icons.ArrowUp size={12} /> : <Icons.ArrowDown size={12} />}
        {delta}
      </span>

      <AnimatePresence>
        {hovered && (
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position:          'absolute',
              top:               0,
              left:              0,
              right:             0,
              zIndex:            50,
              background:        'rgba(255, 255, 255, 0.96)',
              backdropFilter:    'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border:            '1px solid rgba(148, 163, 184, 0.35)',
              borderRadius:      'var(--radius-lg)',
              boxShadow:         '0 8px 32px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
              padding:           'var(--space-4)',
              pointerEvents:     'none',
            }}
          >
            <div style={{
              fontSize:    'var(--text-label-sm)',
              fontWeight:  500,
              color:       'var(--on-surface-muted)',
              marginBottom: 'var(--space-2)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-label-pro)',
            }}>
              {label}
            </div>
            <div style={{
              fontSize:   'var(--text-title-lg)',
              fontWeight: 700,
              color:      'var(--on-surface)',
              lineHeight: 1.25,
              wordBreak:  'break-word',
              whiteSpace: 'normal',
            }}>
              {value}
            </div>
            <div style={{
              display:    'flex',
              alignItems: 'center',
              gap:        4,
              marginTop:  'var(--space-3)',
              fontSize:   'var(--text-label-sm)',
              fontWeight: 500,
              color:      positive ? 'var(--secondary)' : 'var(--tertiary)',
            }}>
              {positive ? <Icons.ArrowUp size={11} /> : <Icons.ArrowDown size={11} />}
              <span>{delta}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
