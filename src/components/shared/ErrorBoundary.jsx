import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-[--color-signal-sell-container] flex items-center justify-center text-[--color-signal-sell]">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-[--color-secondary]">Something went wrong</p>
            <p className="text-xs text-[--color-subtle] mt-1 max-w-xs">
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ error: null })}
            className="border-[--color-container] text-[--color-secondary]"
          >
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
