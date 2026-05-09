import type { Preview } from '@storybook/react-vite'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },

    /** ── Background switcher — maps to design token surfaces ── */
    backgrounds: {
      default: 'surface',
      values: [
        { name: 'surface',      value: 'hsl(220, 25%, 93%)' },
        { name: 'surface-high', value: 'hsl(220, 20%, 85%)' },
        { name: 'dark',         value: 'hsl(220, 20%, 10%)' },
        { name: 'white',        value: '#ffffff'             },
      ],
    },

    /** ── Viewport presets matching app layout tokens ── */
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile (375px)',
          styles: { width: '375px', height: '812px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet (768px)',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop (1280px)',
          styles: { width: '1280px', height: '800px' },
          type: 'desktop',
        },
        wide: {
          name: 'Wide (1440px)',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
      },
      defaultViewport: 'desktop',
    },
  },
}

export default preview
