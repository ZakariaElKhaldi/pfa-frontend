import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icons, type IconName } from './icons'

const NAMES = Object.keys(Icons) as IconName[]

function Gallery({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 16,
        padding: 16,
      }}
    >
      {NAMES.map(name => {
        const Icon = Icons[name]
        return (
          <div
            key={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: 12,
              border: '1px solid var(--outline-variant)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Icon size={size} />
            <code style={{ fontSize: 12 }}>{name}</code>
          </div>
        )
      })}
    </div>
  )
}

const meta: Meta<typeof Gallery> = {
  title: 'Design System/Icons',
  component: Gallery,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Gallery>

export const Default: Story = { args: { size: 24 } }
export const Small:   Story = { args: { size: 16 } }
export const Large:   Story = { args: { size: 32 } }
