import { useParams } from 'react-router-dom'
import { useQuote, usePrices, useIndicators } from '@/hooks/useMarket'
import { useSymbolSignalHistory } from '@/hooks/useSignals'
import { useSocialSentiment } from '@/hooks/useSocial'
import CandlestickChart from '@/components/market/CandlestickChart'
import PriceHeader from '@/components/market/PriceHeader'
import SignalCard from '@/components/signals/SignalCard'
import SentimentBar from '@/components/social/SentimentBar'
import IndicatorsPanel from '@/components/market/IndicatorsPanel'
import SectionCard from '@/components/shared/SectionCard'
import EmptyState from '@/components/shared/EmptyState'
import { Zap } from 'lucide-react'

export default function MarketPage() {
  const { symbol } = useParams()

  const { data: quote }                             = useQuote(symbol)
  const { data: prices, isLoading: pricesLoading }  = usePrices(symbol)
  const { data: indicators, isLoading: indLoading } = useIndicators(symbol)
  const { data: signals }                           = useSymbolSignalHistory(symbol)
  const { data: sentiment }                         = useSocialSentiment(symbol)

  const sentTotal = sentiment
    ? (sentiment.bullish ?? 0) + (sentiment.bearish ?? 0) + (sentiment.neutral ?? 0)
    : 0

  return (
    <div className="flex flex-col gap-4">
      <PriceHeader quote={quote} />

      <SectionCard>
        <CandlestickChart symbol={symbol} data={prices ?? []} isLoading={pricesLoading} />
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Technical Indicators" className="lg:col-span-1">
          <IndicatorsPanel indicators={indicators} isLoading={indLoading} />
        </SectionCard>

        <SectionCard title="Signals" className="lg:col-span-1">
          {signals?.length ? (
            <div className="flex flex-col gap-2">
              {signals.slice(0, 6).map((s) => <SignalCard key={s.id} signal={s} />)}
            </div>
          ) : (
            <EmptyState icon={Zap} title={`No signals for ${symbol}`} />
          )}
        </SectionCard>

        <SectionCard title="Social Sentiment" className="lg:col-span-1">
          {sentiment ? (
            <div className="flex flex-col gap-4">
              <SentimentBar
                bullish={sentiment.bullish}
                bearish={sentiment.bearish}
                neutral={sentiment.neutral}
              />
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Total',   value: sentTotal },
                  { label: 'Bullish', value: sentiment.bullish ?? 0 },
                  { label: 'Bearish', value: sentiment.bearish ?? 0 },
                ].map((s) => (
                  <div key={s.label} className="bg-container rounded-lg p-2">
                    <p className="font-data text-sm font-semibold text-primary-text">{s.value}</p>
                    <p className="text-[10px] text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted">No sentiment data</p>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
