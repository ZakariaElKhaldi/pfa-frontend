import { useState } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { Topbar } from './Topbar'
import { TradeModal } from './TradeModal'
import { HeroSection } from './sections/HeroSection'
import { MetricsSection } from './sections/MetricsSection'
import { PortfolioSection } from './sections/PortfolioSection'
import { SentimentSection } from './sections/SentimentSection'
import { SocialAlertsSection } from './sections/SocialAlertsSection'
import { StrategiesSection } from './sections/StrategiesSection'
import { TokensSection } from './sections/TokensSection'
import { WatchlistSection } from './sections/WatchlistSection'

const INITIAL_STRATEGY_STATE = { strategy1: true, strategy2: false, strategy3: true }

export function DesignSystemPage() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [toggleState, setToggleState] = useState<Record<string, boolean>>(INITIAL_STRATEGY_STATE)
  const [showModal, setShowModal] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  return (
    <AppShell activeId={activeNav} onSelect={setActiveNav} username="Zakaria" role="admin">
      <Topbar
        title={'Design System — "The Quantified Pulse"'}
        search={searchVal}
        onSearchChange={setSearchVal}
      />
      <div className="page-content">
        <div className="stack stack-10">
          <HeroSection />
          <MetricsSection />
          <WatchlistSection />
          <SentimentSection />
          <SocialAlertsSection />
          <PortfolioSection onBuy={() => setShowModal(true)} />
          <StrategiesSection
            state={toggleState}
            onToggle={(id, v) => setToggleState(prev => ({ ...prev, [id]: v }))}
          />
          <TokensSection />
        </div>
      </div>
      <TradeModal open={showModal} onClose={() => setShowModal(false)} />
    </AppShell>
  )
}
