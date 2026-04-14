import SectionCard from '@/components/shared/SectionCard'

export default {
  title: 'Shared/SectionCard',
  component: SectionCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export const Default = {
  args: {
    title:    'Live Signals',
    children: (
      <div className="flex flex-col gap-2 text-xs text-subtle">
        <div className="h-8 bg-container rounded animate-pulse" />
        <div className="h-8 bg-container rounded animate-pulse" />
        <div className="h-8 bg-container rounded animate-pulse" />
      </div>
    ),
  },
}

export const WithAction = {
  args: {
    title:  'Top CrowdSignals',
    action: <button className="text-xs text-action hover:underline">View All →</button>,
    children: (
      <div className="text-xs text-subtle">Signal list goes here…</div>
    ),
  },
}
