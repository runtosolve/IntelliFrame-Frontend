import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ConfigProvider } from 'antd'
import { AuthContextProvider } from '@/components/user-auth/auth-context'
import LoginModal from '@/components/user-auth/login-modal'

// Control styling mirrors the SMI Composite Deck Calculator theme
const theme = {
  token: {
    colorPrimary: "#1F365C",
    colorLink: "#2575fc",
    borderRadius: 6,
    fontSize: 13,
    colorBorder: "#dde2e8",
    fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  components: {
    Card: {
      headerBg: "#e8eef6",
    },
    Collapse: {
      headerBg: "#e8eef6",
    },
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthContextProvider>
      <ConfigProvider theme={theme}>
        <Component {...pageProps} />
        <LoginModal />
      </ConfigProvider>
    </AuthContextProvider>
  )
}
