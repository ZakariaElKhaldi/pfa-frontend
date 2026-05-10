import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { SocialFeedPage } from './SocialFeedPage'

const meta: Meta<typeof SocialFeedPage> = {
  title: 'Pages/Social/Feed',
  component: SocialFeedPage,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof SocialFeedPage>

export const Default: Story = {}
