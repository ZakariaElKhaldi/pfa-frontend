import { describe, expect, it } from 'vitest'

import { composePostText, getPostBodyText } from './postText'

describe('social post text composition', () => {
  it('returns title once when title and content are equal', () => {
    const text = composePostText({
      title: 'Oil jumps after OPEC signal',
      content: 'Oil jumps after OPEC signal',
    })

    expect(text).toBe('Oil jumps after OPEC signal')
  })

  it('returns title once when content is a title-prefixed near-duplicate', () => {
    const text = composePostText({
      title: 'Apple beats estimates',
      content: 'Apple beats estimates - Apple beats estimates in Q2 with strong iPhone revenue.',
    })

    expect(text).toBe('Apple beats estimates')
  })

  it('returns title plus body when materially different', () => {
    const text = composePostText({
      title: 'NVIDIA unveils roadmap',
      content: 'Analysts highlight supply constraints despite upbeat guidance.',
    })

    expect(text).toContain('NVIDIA unveils roadmap')
    expect(text).toContain('Analysts highlight supply constraints')
    expect(text).toContain('\n\n')
  })

  it('falls back when title or content are missing', () => {
    expect(composePostText({ title: 'Headline only' })).toBe('Headline only')
    expect(composePostText({ content: 'Body only' })).toBe('Body only')
    expect(getPostBodyText({ display_content: 'clean', content: 'raw' })).toBe('clean')
  })
})
