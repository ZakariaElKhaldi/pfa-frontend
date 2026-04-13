import { Progress } from '@/components/ui/progress'

export default function SentimentBar({ bullish = 0, bearish = 0, neutral = 0 }) {
  const total = bullish + bearish + neutral || 1
  const bPct  = Math.round((bullish / total) * 100)
  const sPct  = Math.round((bearish / total) * 100)
  const nPct  = 100 - bPct - sPct

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-[10px] font-mono text-[--color-subtle] uppercase tracking-wider">
        <span className="text-[--color-signal-buy]">Bull {bPct}%</span>
        <span className="text-[--color-subtle]">Neutral {nPct}%</span>
        <span className="text-[--color-signal-sell]">Bear {sPct}%</span>
      </div>
      <div className="flex rounded-full overflow-hidden h-2 gap-px">
        <div
          className="bg-[--color-signal-buy] transition-all"
          style={{ width: `${bPct}%` }}
        />
        <div
          className="bg-[--color-subtle] transition-all"
          style={{ width: `${nPct}%` }}
        />
        <div
          className="bg-[--color-signal-sell] transition-all"
          style={{ width: `${sPct}%` }}
        />
      </div>
    </div>
  )
}
