import { useState } from 'react'
import SignalExplanationModal from '@/components/signals/SignalExplanationModal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'

const explainData = {
  signal:                  'STRONG_BUY',
  prediction_method:       'ml',
  prediction_confidence:   0.94,
  sentiment:               0.82,
  momentum:                0.76,
  consistency:             0.91,
  feature_importances: {
    reddit_mention_surge:   0.312,
    sentiment_score_delta:  0.248,
    rsi_divergence:         0.187,
    volume_spike:           0.143,
    tweet_velocity:         0.089,
    short_interest:        -0.067,
    insider_activity:       0.041,
    put_call_ratio:        -0.028,
  },
  aggregation_detail: {
    posts_analyzed:   1_423,
    time_window_h:    4,
    sources:          'Reddit, StockTwits',
    avg_score:        0.82,
  },
}

function withExplain(data) {
  return (Story) => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    qc.setQueryData(['signals', 'explain', 'NVDA'], data)
    return (
      <QueryClientProvider client={qc}>
        <Story />
      </QueryClientProvider>
    )
  }
}

function ModalDemo({ data }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-[--color-action] text-white"
      >
        Open Explanation Modal
      </Button>
      <SignalExplanationModal symbol="NVDA" open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export default {
  title: 'Signals/SignalExplanationModal',
  parameters: { layout: 'centered' },
}

export const StrongBuy = {
  decorators: [withExplain(explainData)],
  render: () => <ModalDemo />,
}

export const LoadingState = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  render: () => {
    /* Render modal already open with no data seeded → shows skeleton */
    return <SignalExplanationModal symbol="NVDA" open={true} onClose={() => {}} />
  },
}
