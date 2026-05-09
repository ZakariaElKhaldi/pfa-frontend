import type { Meta, StoryObj } from '@storybook/react'
import { ThemeToggle } from './ThemeToggle'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Design System/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Cycles light → dark → system theme using `next-themes`. ' +
          'Requires `ThemeProvider` (attribute="class") in the app root — already wired in `main.tsx`.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
