import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { SocialFeedPagePreview } from './SocialFeedPage'

const meta: Meta<typeof SocialFeedPagePreview> = {
  title: 'Pages/Social/Feed',
  component: SocialFeedPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof SocialFeedPagePreview>

export const Default: Story = {}
