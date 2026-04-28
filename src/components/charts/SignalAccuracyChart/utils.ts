import type { RolledPt } from './types'

export function wilson90(k: number, n: number): [number, number] {
  const z = 1.645
  if (n === 0) return [0, 1]
  const p = k / n
  const d = 1 + (z * z) / n
  const c = (p + (z * z) / (2 * n)) / d
  const e = (z / d) * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))
  return [Math.max(0, c - e), Math.min(1, c + e)]
}

export function roll(
  pts: { date: Date; v: boolean | null }[],
  w: number,
): (RolledPt | null)[] {
  return pts.map((_, i) => {
    const slice = pts.slice(Math.max(0, i - w + 1), i + 1)
    const valid = slice.filter(d => d.v !== null)
    if (valid.length < 3) return null
    const k = valid.filter(d => d.v === true).length
    const n = valid.length
    const [lo, hi] = wilson90(k, n)
    return { date: pts[i].date, p: k / n, lo, hi }
  })
}
