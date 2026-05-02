import type { Meta, StoryObj } from '@storybook/react-vite'
import { LineChart, MessageSquare, History, Brain } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="prices" className="w-[440px]">
      <TabsList>
        <TabsTrigger value="prices">Prices</TabsTrigger>
        <TabsTrigger value="signals">Signals</TabsTrigger>
        <TabsTrigger value="social">Social</TabsTrigger>
      </TabsList>
      <TabsContent value="prices" className="rounded-lg border border-border bg-card p-4 text-sm">
        Latest OHLC bars for the selected ticker.
      </TabsContent>
      <TabsContent value="signals" className="rounded-lg border border-border bg-card p-4 text-sm">
        Recent BUY / SELL / HOLD outputs from the engine.
      </TabsContent>
      <TabsContent value="social" className="rounded-lg border border-border bg-card p-4 text-sm">
        Reddit + StockTwits posts mentioning this ticker.
      </TabsContent>
    </Tabs>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="chart" className="w-[520px]">
      <TabsList>
        <TabsTrigger value="chart"><LineChart /> Chart</TabsTrigger>
        <TabsTrigger value="social"><MessageSquare /> Social</TabsTrigger>
        <TabsTrigger value="history"><History /> History</TabsTrigger>
        <TabsTrigger value="explain"><Brain /> Explain</TabsTrigger>
      </TabsList>
      <TabsContent value="chart"   className="rounded-lg border border-border bg-card p-4 text-sm">Candlestick chart panel.</TabsContent>
      <TabsContent value="social"  className="rounded-lg border border-border bg-card p-4 text-sm">Per-ticker social feed.</TabsContent>
      <TabsContent value="history" className="rounded-lg border border-border bg-card p-4 text-sm">Signal history table.</TabsContent>
      <TabsContent value="explain" className="rounded-lg border border-border bg-card p-4 text-sm">Feature importance + decision log.</TabsContent>
    </Tabs>
  ),
}

export const LineVariant: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[440px]">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="positions">Positions</TabsTrigger>
        <TabsTrigger value="trades">Trades</TabsTrigger>
      </TabsList>
      <TabsContent value="overview"  className="pt-3 text-sm">Cash + total value + P&L.</TabsContent>
      <TabsContent value="positions" className="pt-3 text-sm">Open positions table.</TabsContent>
      <TabsContent value="trades"    className="pt-3 text-sm">Trade history.</TabsContent>
    </Tabs>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="general" orientation="vertical" className="h-64 w-[520px]">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="alerts">Alerts</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="api">API keys</TabsTrigger>
      </TabsList>
      <TabsContent value="general"  className="rounded-lg border border-border bg-card p-4 text-sm">Display name, language, density.</TabsContent>
      <TabsContent value="alerts"   className="rounded-lg border border-border bg-card p-4 text-sm">Alert threshold + delivery channels.</TabsContent>
      <TabsContent value="security" className="rounded-lg border border-border bg-card p-4 text-sm">Password + 2FA + sessions.</TabsContent>
      <TabsContent value="api"      className="rounded-lg border border-border bg-card p-4 text-sm">Generate / revoke API keys.</TabsContent>
    </Tabs>
  ),
}
