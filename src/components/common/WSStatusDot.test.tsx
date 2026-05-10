import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { WSStatusDot } from './WSStatusDot'

describe('WSStatusDot', () => {
  it('renders live unavailable label for degraded state', () => {
    const html = renderToStaticMarkup(<WSStatusDot status="unavailable" />)
    expect(html).toContain('Live unavailable')
  })

  it('renders reconnecting label for disconnected retry state', () => {
    const html = renderToStaticMarkup(<WSStatusDot status="disconnected" />)
    expect(html).toContain('Reconnecting…')
  })
})
