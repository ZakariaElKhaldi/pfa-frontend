import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { ProfilePagePreview } from './ProfilePage'

const meta: Meta<typeof ProfilePagePreview> = {
  title: 'Pages/Profile',
  component: ProfilePagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof ProfilePagePreview>

export const Default: Story = {}
export const Loading: Story = { args: { loading: true } }
export const WithError: Story = { args: { error: 'Email already in use.' } }
export const Saved: Story = { args: { success: 'Profile updated.' } }
