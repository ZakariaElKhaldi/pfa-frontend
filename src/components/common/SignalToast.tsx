import { SignalBadge } from '@/components/design-system'
import type { Signal } from '@/design-system/tokens'

export interface SignalToastProps {
  symbol:    string
  signal:    Signal
  price:     string
  timestamp: string
}

const SIGNAL_TONE: Record<Signal, 'bullish' | 'bearish' | 'neutral'> = {
  BUY:  'bullish',
  SELL: 'bearish',
  HOLD: 'neutral',
}

export function SignalToast({ symbol, signal, price, timestamp }: SignalToastProps) {
  const tone = SIGNAL_TONE[signal]
  return (
    <div className={`signal-toast signal-toast-${tone}`} role="status">
      <SignalBadge signal={signal} size="lg" />
      <div className="signal-toast-body">
        <div className="signal-toast-symbol-row">
          <span className="signal-toast-symbol">{symbol}</span>
          <span className={`signal-toast-price signal-toast-price-${tone}`}>${price}</span>
        </div>
        <span className="signal-toast-time">{timestamp}</span>
      </div>
    </div>
  )
}

export function showSignalToast(props: SignalToastProps) {
  import('sonner').then(({ toast }) => {
    toast.custom(() => <SignalToast {...props} />, { duration: 6000 })
  })
}
