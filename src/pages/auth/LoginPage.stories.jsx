import LoginPage from '@/pages/auth/LoginPage'

export default {
  title: 'Pages/Auth/LoginPage',
  component: LoginPage,
  parameters: {
    /* Full screen — this is a full-page layout */
    layout: 'fullscreen',
    /* Show the void background underneath the page's own bg */
    backgrounds: { default: 'void' },
  },
}

export const Default = {}
