import type { Meta, StoryObj } from '@storybook/react-vite'

import '../../index.css'
import { FeatureImportanceChart } from './FeatureImportanceChart'
import type { FeatureImportance } from './FeatureImportanceChart'

const FEATURES: FeatureImportance[] = [
  { feature: 'sentiment_score',   importance: 0.312 },
  { feature: 'momentum_7d',       importance: 0.248 },
  { feature: 'volume_ratio',      importance: 0.187 },
  { feature: 'consistency_score', importance: 0.134 },
  { feature: 'price_change_1d',   importance: 0.087 },
  { feature: 'post_count_24h',    importance: 0.032 },
]

const meta: Meta<typeof FeatureImportanceChart> = {
  title: 'Charts/FeatureImportanceChart',
  component: FeatureImportanceChart,
  tags: ['autodocs'],
  argTypes: {
    width: { control: { type: 'number', min: 300, max: 800, step: 20 } },
  },
}
export default meta

type Story = StoryObj<typeof FeatureImportanceChart>

export const Default: Story = {
  args: { data: FEATURES },
}

export const FewFeatures: Story = {
  args: { data: FEATURES.slice(0, 3) },
}

export const Empty: Story = {
  args: { data: [] },
}
