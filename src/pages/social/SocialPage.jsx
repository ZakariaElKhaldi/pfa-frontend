import { useState } from 'react'
import { useSocialFeed, useSocialSentiment } from '@/hooks/useSocial'
import PostCard from '@/components/social/PostCard'
import TrendingTopics from '@/components/social/TrendingTopics'
import SentimentBar from '@/components/social/SentimentBar'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users } from 'lucide-react'

export default function SocialPage() {
  const [symbol, setSymbol] = useState('')

  const activeSymbol = symbol.toUpperCase().trim() || undefined
  const { data: posts, isLoading }    = useSocialFeed(activeSymbol ? { symbol: activeSymbol } : undefined)
  const { data: sentiment }           = useSocialSentiment(activeSymbol)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[--color-primary-text]">Social Feed</h2>
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Filter by symbol…"
            className="h-8 w-36 text-xs font-mono bg-[--color-container] border-[--color-container] placeholder:text-[--color-muted]"
          />
        </div>

        {sentiment && activeSymbol && (
          <Card className="bg-[--color-container] border-0 p-3">
            <p className="text-[10px] text-[--color-muted] uppercase tracking-wider mb-2">
              {activeSymbol} Sentiment
            </p>
            <SentimentBar
              bullish={sentiment.bullish}
              bearish={sentiment.bearish}
              neutral={sentiment.neutral}
            />
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size={24} /></div>
        ) : !posts?.length ? (
          <EmptyState icon={Users} title="No posts" />
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="flex flex-col gap-2 pr-1">
              {posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </ScrollArea>
        )}
      </div>

      <Card className="bg-[--color-container] border-0 p-4 h-fit">
        <TrendingTopics />
      </Card>
    </div>
  )
}
