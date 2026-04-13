import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

function IndicatorRow({ label, value, format = 'number', decimals = 2 }) {
  const display = value == null
    ? '—'
    : format === 'price'
      ? `$${formatPrice(value, decimals)}`
      : typeof value === 'number'
        ? value.toFixed(decimals)
        : String(value)

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[--color-void] last:border-0">
      <span className="text-xs text-[--color-subtle]">{label}</span>
      <span className="font-data text-xs font-medium text-[--color-primary-text]">{display}</span>
    </div>
  )
}

export default function IndicatorsPanel({ indicators, isLoading }) {
  if (isLoading) return (
    <div className="flex justify-center py-6"><LoadingSpinner size={18} /></div>
  )
  if (!indicators) return (
    <p className="text-xs text-[--color-muted] text-center py-4">No indicator data</p>
  )

  const { rsi_14, sma_20, ema_12, bollinger_bands, macd, volatility } = indicators

  return (
    <div className="flex flex-col">
      <IndicatorRow label="RSI (14)" value={rsi_14} />
      <IndicatorRow label="SMA (20)" value={sma_20} format="price" />
      <IndicatorRow label="EMA (12)" value={ema_12} format="price" />
      {bollinger_bands && <>
        <IndicatorRow label="BB Upper"  value={bollinger_bands.upper}  format="price" />
        <IndicatorRow label="BB Middle" value={bollinger_bands.middle} format="price" />
        <IndicatorRow label="BB Lower"  value={bollinger_bands.lower}  format="price" />
      </>}
      {macd && <>
        <IndicatorRow label="MACD"      value={macd.macd}      decimals={4} />
        <IndicatorRow label="Signal"    value={macd.signal}    decimals={4} />
        <IndicatorRow label="Histogram" value={macd.histogram} decimals={4} />
      </>}
      <IndicatorRow label="Volatility" value={volatility} decimals={4} />
    </div>
  )
}
