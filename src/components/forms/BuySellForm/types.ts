export interface BuySellFormValues {
  symbol:      string
  side:        'buy' | 'sell'
  quantity:    number
  orderType:   'market' | 'limit'
  limitPrice?: number
  price:       number
}

export interface BuySellFormProps {
  symbol?:      string // acts as fixed symbol
  defaultSymbol?: string
  defaultSide?: 'buy' | 'sell'
  onSubmit:     (v: BuySellFormValues) => void
  loading?:     boolean
  error?:       string
}
