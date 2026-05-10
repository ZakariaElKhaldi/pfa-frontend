import { describe, expect, it } from 'vitest'

import { isTerminalWebSocketClose, shouldMarkWsUnavailable } from './useWSStatus'

describe('useWSStatus transition helpers', () => {
  it('treats auth/policy close codes as terminal', () => {
    expect(isTerminalWebSocketClose(4401)).toBe(true)
    expect(isTerminalWebSocketClose(4403)).toBe(true)
    expect(isTerminalWebSocketClose(1008)).toBe(true)
    expect(isTerminalWebSocketClose(1006)).toBe(false)
  })

  it('marks websocket unavailable only after retry budget is exceeded', () => {
    expect(shouldMarkWsUnavailable(1, 6)).toBe(false)
    expect(shouldMarkWsUnavailable(6, 6)).toBe(false)
    expect(shouldMarkWsUnavailable(7, 6)).toBe(true)
  })
})
