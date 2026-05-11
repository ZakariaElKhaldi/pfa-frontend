import { useState, type FormEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useQuotes } from '@/hooks/useQuotes'
import { SideToggle } from './SideToggle'
import { SymbolField } from './SymbolField'
import { TotalDisplay } from './TotalDisplay'
import type { BuySellFormProps, BuySellFormValues } from './types'

export type { BuySellFormProps, BuySellFormValues }

export function BuySellForm({ symbol: fixedSymbol, defaultSymbol, defaultSide = 'buy', onSubmit, loading, error }: BuySellFormProps) {
  const [side, setSide]             = useState<'buy' | 'sell'>(defaultSide)
  const [symbol, setSymbol]         = useState(fixedSymbol ?? defaultSymbol ?? '')
  const [quantity, setQuantity]     = useState('')
  const [orderType, setOrderType]   = useState<'market' | 'limit'>('market')
  const [limitPrice, setLimitPrice] = useState('')

  const normalizedSymbol = (fixedSymbol ?? symbol).trim().toUpperCase()
  const quoteSymbols = normalizedSymbol ? [normalizedSymbol] : []
  const { quotes, loading: quoteLoading } = useQuotes(quoteSymbols)
  const quote = normalizedSymbol ? quotes[normalizedSymbol] : null
  const marketPrice = quote ? parseFloat(quote.price) : 0
  const enteredLimit = parseFloat(limitPrice) || 0
  const quantityValue = parseFloat(quantity) || 0
  const isBuy = side === 'buy'
  const isLimit = orderType === 'limit'
  const estimatePrice = isLimit ? enteredLimit : marketPrice
  const total = quantityValue * estimatePrice
  const hasQuote = marketPrice > 0
  const isMarketable = !isLimit || !hasQuote || (isBuy ? enteredLimit >= marketPrice : enteredLimit <= marketPrice)
  const canSubmit = Boolean(normalizedSymbol && quantityValue > 0 && hasQuote && (!isLimit || (enteredLimit > 0 && isMarketable)))
  const limitDelta = hasQuote && enteredLimit > 0 ? ((enteredLimit - marketPrice) / marketPrice) * 100 : 0
  const freshness = quote ? new Date(quote.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      symbol: normalizedSymbol,
      side,
      quantity: quantityValue,
      orderType,
      limitPrice: isLimit ? enteredLimit : undefined,
      price: estimatePrice,
    } satisfies BuySellFormValues)
  }

  return (
    <form onSubmit={handleSubmit} className="stack stack-5" noValidate>
      <SideToggle value={side} onChange={setSide} disabled={loading} />
      <SymbolField fixedSymbol={fixedSymbol} value={symbol} onChange={setSymbol} disabled={loading} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-2)',
          padding: 'var(--space-1)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-container)',
          outline: '1px solid var(--outline-variant)',
        }}
      >
        {(['market', 'limit'] as const).map((type) => (
          <button
            key={type}
            type="button"
            aria-pressed={orderType === type}
            onClick={() => setOrderType(type)}
            disabled={loading}
            style={{
              height: 36,
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: orderType === type ? 'var(--surface-bright)' : 'transparent',
              color: orderType === type ? 'var(--on-surface)' : 'var(--on-surface-variant)',
              boxShadow: orderType === type ? 'var(--shadow-xs)' : 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 650,
              textTransform: 'capitalize',
            }}
          >
            {type}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--surface-container)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label-pro)' }}>
            Last
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-headline-sm)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {hasQuote ? marketPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : quoteLoading ? '…' : '—'}
          </span>
        </div>
        <span
          title={quote ? `Quote ${freshness}` : 'Waiting for quote'}
          aria-label={quote ? `Quote ${freshness}` : 'Waiting for quote'}
          style={{
            width: 16,
            height: 16,
            borderRadius: 'var(--radius-full)',
            background: hasQuote ? 'var(--secondary)' : 'var(--warning)',
            boxShadow: hasQuote ? '0 0 0 5px var(--secondary-container)' : '0 0 0 5px var(--warning-container)',
          }}
        />
      </div>

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

      {isLimit && (
        <div className="stack stack-2">
          <Label htmlFor="bs-limit-price">{isBuy ? 'Max buy price' : 'Min sell price'}</Label>
          <Input
            id="bs-limit-price"
            type="number"
            min="0.01"
            step="0.01"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder={hasQuote ? marketPrice.toFixed(2) : '0.00'}
            required
            disabled={loading}
          />
        </div>
      )}

      {isLimit && enteredLimit > 0 && (
        <div
          title={isMarketable ? 'Ready at current price' : 'Outside current price'}
          aria-label={isMarketable ? 'Ready at current price' : 'Outside current price'}
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            background: isMarketable ? 'var(--secondary-container)' : 'var(--warning-container)',
            color: isMarketable ? 'var(--on-secondary-container)' : 'var(--on-warning-container)',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 'var(--radius-full)',
              background: isMarketable ? 'var(--secondary)' : 'var(--warning)',
            }}
          />
          <span style={{ height: 6, borderRadius: 'var(--radius-full)', background: 'currentColor', opacity: 0.26 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-sm)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {limitDelta > 0 ? '+' : ''}{limitDelta.toFixed(2)}%
          </span>
        </div>
      )}

      <TotalDisplay total={total} isBuy={isBuy} label={isLimit ? 'Limit value' : 'Market estimate'} />

      {error && (
        <div role="alert" style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--tertiary-container)', color: 'var(--tertiary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-body-sm)' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !canSubmit}
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
