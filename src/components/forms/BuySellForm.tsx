import { useState, type FormEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export interface BuySellFormValues {
  symbol:   string
  side:     'buy' | 'sell'
  quantity: number
  price:    number
}

export interface BuySellFormProps {
  /** Pre-populated ticker (user cannot change it when provided) */
  symbol?:   string
  /** Whether the current action is sell (true) or buy (false) */
  defaultSide?: 'buy' | 'sell'
  onSubmit:  (v: BuySellFormValues) => void
  loading?:  boolean
  error?:    string
}

export function BuySellForm({
  symbol: fixedSymbol,
  defaultSide = 'buy',
  onSubmit,
  loading,
  error,
}: BuySellFormProps) {
  const [side, setSide]         = useState<'buy' | 'sell'>(defaultSide)
  const [symbol, setSymbol]     = useState(fixedSymbol ?? '')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice]       = useState('')

  const isBuy     = side === 'buy'
  const accentVar = isBuy ? 'var(--secondary)' : 'var(--tertiary)'
  const accentBg  = isBuy ? 'var(--secondary-container)' : 'var(--tertiary-container)'
  const total     = (parseFloat(quantity) || 0) * (parseFloat(price) || 0)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({ symbol, side, quantity: parseFloat(quantity), price: parseFloat(price) })
  }

  return (
    <form onSubmit={handleSubmit} className="stack stack-5" noValidate>
      {/* Side toggle */}
      <div
        style={{
          display:       'grid',
          gridTemplateColumns: '1fr 1fr',
          borderRadius:  'var(--radius-md)',
          overflow:      'hidden',
          outline:       '1px solid var(--outline-variant)',
        }}
      >
        {(['buy', 'sell'] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={side === s}
            onClick={() => setSide(s)}
            disabled={loading}
            style={{
              padding:    'var(--space-3)',
              fontWeight: 600,
              fontSize:   'var(--text-body-md)',
              letterSpacing: '0.02em',
              textTransform: 'capitalize',
              background:
                side === s
                  ? (s === 'buy' ? 'var(--secondary)' : 'var(--tertiary)')
                  : 'var(--surface-container)',
              color:
                side === s
                  ? (s === 'buy' ? 'var(--on-secondary)' : 'var(--on-tertiary)')
                  : 'var(--on-surface-variant)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Symbol (locked if provided) */}
      {!fixedSymbol && (
        <div className="stack stack-2">
          <Label htmlFor="bs-symbol">Ticker</Label>
          <Input
            id="bs-symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="AAPL"
            required
            disabled={loading}
          />
        </div>
      )}
      {fixedSymbol && (
        <div
          style={{
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding:    'var(--space-3) var(--space-4)',
            background: 'var(--surface-container)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Ticker
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize:   'var(--text-mono-md)',
              color:      'var(--on-surface)',
            }}
          >
            {fixedSymbol}
          </span>
        </div>
      )}

      {/* Quantity */}
      <div className="stack stack-2">
        <Label htmlFor="bs-quantity">Quantity</Label>
        <Input
          id="bs-quantity"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="100"
          required
          disabled={loading}
        />
      </div>

      {/* Price */}
      <div className="stack stack-2">
        <Label htmlFor="bs-price">Price per share</Label>
        <Input
          id="bs-price"
          type="number"
          min="0.01"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          required
          disabled={loading}
        />
      </div>

      {/* Live total */}
      {total > 0 && (
        <div
          style={{
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'space-between',
            padding:      'var(--space-3) var(--space-4)',
            background:   accentBg,
            borderRadius: 'var(--radius-md)',
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
      )}

      {error && (
        <div role="alert" style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--tertiary-container)', color: 'var(--tertiary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-body-sm)' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !symbol || !quantity || !price}
        className="btn btn-md btn-primary"
        style={{
          background:  isBuy ? 'var(--secondary)' : 'var(--tertiary)',
          borderColor: isBuy ? 'var(--secondary)' : 'var(--tertiary)',
        }}
      >
        {loading ? 'Submitting…' : `${isBuy ? 'Buy' : 'Sell'} ${(fixedSymbol ?? symbol) || ''}`}
      </button>
    </form>
  )
}
