export interface SentimentPricePoint {
  time:           string
  price:          number
  sentimentScore: number
  signal?:        'BUY' | 'SELL' | 'HOLD'
}

export interface SentimentPriceChartProps {
  data:    SentimentPricePoint[]
  ticker?: string
  width?:  number
  height?: number
}

export type Tip = {
  svgX:    number
  svgY:    number
  label:   string
  price:   number
  sent:    number
  signal?: 'BUY' | 'SELL' | 'HOLD'
}
