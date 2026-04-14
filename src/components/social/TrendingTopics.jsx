import { TrendingUp } from 'lucide-react'
import { useTrending } from '@/hooks/useSocial'
import { useNavigate } from 'react-router-dom'

export default function TrendingTopics() {
  const { data: topics } = useTrending()
  const navigate         = useNavigate()

  if (!topics?.length) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <TrendingUp size={14} className="text-[--color-action]" />
        <span className="text-xs font-semibold text-[--color-secondary]">Trending</span>
      </div>
      <div className="flex flex-col gap-1">
        {topics.slice(0, 8).map((t, i) => (
          <button
            key={t.symbol}
            onClick={() => navigate(`/market/${t.symbol}`)}
            className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[--color-container] transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[--color-muted] w-4">{i + 1}</span>
              <span className="font-mono text-xs font-semibold text-[--color-max-text]">${t.symbol}</span>
            </div>
            <span className="text-[10px] text-[--color-subtle]">{t.mention_count} mentions</span>
          </button>
        ))}
      </div>
    </div>
  )
}
