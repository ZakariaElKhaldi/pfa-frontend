export interface BuySellFormValues {
  symbol:   string
  side:     'buy' | 'sell'
  quantity: number
  price:    number
}

export interface BuySellFormProps {
  symbol?:      string
  defaultSide?: 'buy' | 'sell'
  onSubmit:     (v: BuySellFormValues) => void
  loading?:     boolean
  error?:       string
}
