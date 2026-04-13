import { useState } from 'react'
import { useBuy, useSell } from '@/hooks/usePortfolio'
import { useWatchlist } from '@/hooks/useWatchlist'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'

export default function TradeForm() {
  const [symbol, setSymbol]     = useState('')
  const [quantity, setQuantity] = useState('')
  const [side, setSide]         = useState('buy')
  const [error, setError]       = useState(null)

  const { data: watchlist } = useWatchlist()
  const buy  = useBuy()
  const sell = useSell()

  const mutation = side === 'buy' ? buy : sell

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    const qty = parseInt(quantity, 10)
    if (!symbol || !qty || qty <= 0) { setError('Symbol and positive quantity required'); return }
    mutation.mutate(
      { symbol: symbol.toUpperCase(), quantity: qty },
      {
        onSuccess: () => { setSymbol(''); setQuantity('') },
        onError:   (err) => setError(err.response?.data?.detail ?? 'Trade failed'),
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-end gap-2 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-[--color-subtle]">Side</Label>
          <Select value={side} onValueChange={setSide}>
            <SelectTrigger className="h-9 w-24 text-xs bg-[--color-surface] border-[--color-container]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[--color-surface-low] border-[--color-container]">
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-[--color-subtle]">Symbol</Label>
          {watchlist?.length ? (
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="h-9 w-36 text-xs bg-[--color-surface] border-[--color-container] font-mono">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent className="bg-[--color-surface-low] border-[--color-container]">
                {watchlist.map((t) => (
                  <SelectItem key={t.symbol} value={t.symbol} className="font-mono">
                    {t.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              className="h-9 w-28 text-xs font-mono bg-[--color-surface] border-[--color-container]"
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-[--color-subtle]">Qty</Label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="10"
            className="h-9 w-24 text-xs font-mono bg-[--color-surface] border-[--color-container]"
          />
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending}
          className={
            side === 'buy'
              ? 'h-9 bg-[--color-signal-buy] hover:opacity-90 text-black font-semibold text-xs px-4'
              : 'h-9 bg-[--color-signal-sell] hover:opacity-90 text-white font-semibold text-xs px-4'
          }
        >
          {mutation.isPending ? '…' : side === 'buy' ? 'Buy' : 'Sell'}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-[--color-signal-sell]">{error}</p>
      )}
    </form>
  )
}
