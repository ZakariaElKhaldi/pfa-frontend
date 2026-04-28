import { useState, type FormEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { SideToggle } from './SideToggle'
import { SymbolField } from './SymbolField'
import { TotalDisplay } from './TotalDisplay'
import type { BuySellFormProps, BuySellFormValues } from './types'

export type { BuySellFormProps, BuySellFormValues }

export function BuySellForm({ symbol: fixedSymbol, defaultSide = 'buy', onSubmit, loading, error }: BuySellFormProps) {
  const [side, setSide]         = useState<'buy' | 'sell'>(defaultSide)
  const [symbol, setSymbol]     = useState(fixedSymbol ?? '')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice]       = useState('')

  const isBuy  = side === 'buy'
  const total  = (parseFloat(quantity) || 0) * (parseFloat(price) || 0)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({ symbol, side, quantity: parseFloat(quantity), price: parseFloat(price) } satisfies BuySellFormValues)
  }

  return (
    <form onSubmit={handleSubmit} className="stack stack-5" noValidate>
      <SideToggle value={side} onChange={setSide} disabled={loading} />
      <SymbolField fixedSymbol={fixedSymbol} value={symbol} onChange={setSymbol} disabled={loading} />

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

      <TotalDisplay total={total} isBuy={isBuy} />

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
