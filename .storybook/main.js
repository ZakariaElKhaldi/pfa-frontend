import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [],
  framework: '@storybook/react-vite',
  viteFinal: async (config) => {
    /* 1. Path alias — same as vite.config.js */
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
    }

    /* 2. Tailwind v4 Vite plugin — must come before other transforms */
    config.plugins = [tailwindcss(), ...(config.plugins ?? [])]

    return config
  },
}

export default config