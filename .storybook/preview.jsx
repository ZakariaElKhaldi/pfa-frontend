import '../src/index.css'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'

/* Fresh QueryClient per story so stories are isolated */
const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
    },
  })

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    /* Dark background by default — matches the Obsidian Lens "void" canvas */
    backgrounds: {
      default: 'void',
      values: [
        { name: 'void',    value: '#080D18' },
        { name: 'surface', value: '#0F172A' },
        { name: 'white',   value: '#ffffff' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date:  /Date$/i,
      },
    },
    layout: 'centered',
  },

  /* Global decorator: wrap every story with all required providers */
  decorators: [
    (Story) => (
      <MemoryRouter>
        <QueryClientProvider client={makeQueryClient()}>
          <TooltipProvider delayDuration={300}>
            <div className="p-6 min-w-[320px]">
              <Story />
            </div>
          </TooltipProvider>
        </QueryClientProvider>
      </MemoryRouter>
    ),
  ],
}

export default preview
