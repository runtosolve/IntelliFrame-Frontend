import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ConfigProvider } from 'antd'

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
    <ConfigProvider theme={theme}>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
