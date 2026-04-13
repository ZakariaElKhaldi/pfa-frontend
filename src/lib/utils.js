import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Format price with locale-aware comma separators */
export function formatPrice(value, decimals = 2) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/** Format percentage with + sign for positives */
export function formatPct(value, decimals = 2) {
  if (value == null) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/** Map signal string to CSS class */
export function signalClass(signal) {
  switch (signal?.toUpperCase()) {
    case 'BUY':  return 'signal-buy'
    case 'SELL': return 'signal-sell'
    case 'HOLD': return 'signal-hold'
    default:     return ''
  }
}

/** Clamp a number between min and max */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
