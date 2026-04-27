import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import '../../index.css'
import { Toggle } from './Toggle'

const meta: Meta<typeof Toggle> = {
  title: 'Design System/Toggle',
  component: Toggle,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Toggle>

export const Off: Story = {
  args: { id: 'toggle-off', checked: false, onChange: () => {} },
}

export const On: Story = {
  args: { id: 'toggle-on', checked: true, onChange: () => {} },
}

export const Interactive: Story = {
  render: () => {
    const [v, setV] = useState(false)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Toggle id="toggle-interactive" checked={v} onChange={setV} label="Enable strategy" />
        <span>{v ? 'Enabled' : 'Disabled'}</span>
      </div>
    )
  },
}
