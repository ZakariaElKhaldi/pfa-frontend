import SignalCard from '@/components/signals/SignalCard'

export default {
  title: 'Signals/SignalCard',
  component: SignalCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

const buySignal = {
  id: 1,
  ticker_symbol: 'NVDA',
  signal: 'STRONG_BUY',
  prediction_confidence: 0.94,
  sentiment: 0.82,
  momentum: 0.76,
  consistency: 0.91,
  prediction_method: 'ml',
  created_at: new Date(Date.now() - 2 * 60_000).toISOString(),
}

const sellSignal = {
  id: 2,
  ticker_symbol: 'TSLA',
  signal: 'SELL',
  prediction_confidence: 0.71,
  sentiment: -0.54,
  momentum: -0.38,
  consistency: 0.62,
  prediction_method: 'rule',
  created_at: new Date(Date.now() - 15 * 60_000).toISOString(),
}

const holdSignal = {
  id: 3,
  ticker_symbol: 'MSFT',
  signal: 'HOLD',
  prediction_confidence: 0.58,
  sentiment: 0.12,
  momentum: -0.05,
  consistency: 0.47,
  prediction_method: 'ml',
  created_at: new Date(Date.now() - 60 * 60_000).toISOString(),
}

export const StrongBuy = {
  args: { signal: buySignal },
}

export const Sell = {
  args: { signal: sellSignal },
}

export const Hold = {
  args: { signal: holdSignal },
}

export const LiveFeed = {
  name: 'Live Feed — All 3 Cards',
  render: () => (
    <div className="flex flex-col gap-2 max-w-xl">
      <SignalCard signal={buySignal} />
      <SignalCard signal={sellSignal} />
      <SignalCard signal={holdSignal} />
    </div>
  ),
}
