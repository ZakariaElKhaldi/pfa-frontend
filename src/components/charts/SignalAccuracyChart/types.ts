export interface AccuracyRecord {
  evaluatedAt:     string
  predicted:       'BUY' | 'SELL' | 'HOLD'
  actualDirection: 'UP' | 'DOWN' | 'FLAT'
  accuracy1h:      boolean | null
  accuracy24h:     boolean | null
}

export interface SignalAccuracyChartProps {
  data:        AccuracyRecord[]
  rollWindow?: number
  width?:      number
  height?:     number
}

export type RolledPt = { date: Date; p: number; lo: number; hi: number }
export type Tip      = { svgX: number; svgY: number; p1h: number | null; p24h: number | null; label: string }
