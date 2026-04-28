export interface OHLCBar {
  date:   Date
  open:   number
  high:   number
  low:    number
  close:  number
  volume: number
}

export interface PriceChartProps {
  data:            OHLCBar[]
  width?:          number
  height?:         number
  showVolume?:     boolean
  showSMA?:        boolean
  showBollinger?:  boolean
  showCrosshair?:  boolean
}
