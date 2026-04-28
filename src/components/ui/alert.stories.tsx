import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AlertTriangle, Terminal, CircleCheck,
  Info as InfoIcon, TrendingUp, TrendingDown,
} from 'lucide-react'

import { Alert, AlertDescription, AlertTitle, AlertAction } from './alert'
import { Button } from './button'

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'success', 'warning', 'info', 'buy', 'sell'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Alert>

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <Terminal className="h-4 w-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components and dependencies to your app using the CLI.
      </AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Authentication error</AlertTitle>
      <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
    </Alert>
  ),
}

export const Success: Story = {
  render: () => (
    <Alert variant="success">
      <CircleCheck className="h-4 w-4" />
      <AlertTitle>Order executed</AlertTitle>
      <AlertDescription>Your limit order was filled at $183.42.</AlertDescription>
    </Alert>
  ),
}

export const Warning: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Margin call approaching</AlertTitle>
      <AlertDescription>Your margin utilisation is above 80%. Consider reducing exposure.</AlertDescription>
    </Alert>
  ),
}

export const Info: Story = {
  render: () => (
    <Alert variant="info">
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Market closed</AlertTitle>
      <AlertDescription>US markets open in 2 hours 14 minutes.</AlertDescription>
    </Alert>
  ),
}

export const Buy: Story = {
  render: () => (
    <Alert variant="buy">
      <TrendingUp className="h-4 w-4" />
      <AlertTitle>BUY signal — AAPL</AlertTitle>
      <AlertDescription>
        Model confidence 87%. RSI oversold + positive sentiment momentum.
      </AlertDescription>
    </Alert>
  ),
}

export const Sell: Story = {
  render: () => (
    <Alert variant="sell">
      <TrendingDown className="h-4 w-4" />
      <AlertTitle>SELL signal — TSLA</AlertTitle>
      <AlertDescription>
        Model confidence 74%. Breaking key support with high volume.
      </AlertDescription>
    </Alert>
  ),
}

export const WithAction: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Update available</AlertTitle>
      <AlertDescription>A new model version is ready. Retrain to improve signal accuracy.</AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline">Retrain</Button>
      </AlertAction>
    </Alert>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert variant="default"><Terminal className="h-4 w-4" /><AlertTitle>Default</AlertTitle><AlertDescription>Neutral informational alert.</AlertDescription></Alert>
      <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Destructive</AlertTitle><AlertDescription>Something went wrong.</AlertDescription></Alert>
      <Alert variant="success"><CircleCheck className="h-4 w-4" /><AlertTitle>Success</AlertTitle><AlertDescription>Action completed successfully.</AlertDescription></Alert>
      <Alert variant="warning"><AlertTriangle className="h-4 w-4" /><AlertTitle>Warning</AlertTitle><AlertDescription>Proceed with caution.</AlertDescription></Alert>
      <Alert variant="info"><InfoIcon className="h-4 w-4" /><AlertTitle>Info</AlertTitle><AlertDescription>Some useful context.</AlertDescription></Alert>
      <Alert variant="buy"><TrendingUp className="h-4 w-4" /><AlertTitle>Buy signal</AlertTitle><AlertDescription>Bullish conditions detected.</AlertDescription></Alert>
      <Alert variant="sell"><TrendingDown className="h-4 w-4" /><AlertTitle>Sell signal</AlertTitle><AlertDescription>Bearish conditions detected.</AlertDescription></Alert>
    </div>
  ),
}
