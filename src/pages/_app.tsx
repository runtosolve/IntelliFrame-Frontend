import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ConfigProvider } from 'antd'
import AuthGate from '@/auth/auth-gate'

const theme = {
  token: {
    colorPrimary: "#d62d33",
    colorInfo: "#d62d33",
    colorLink: "#8e191d",
    colorText: "#1c1917",
    colorTextSecondary: "#5f5a55",
    colorBorder: "#e7e5e4",
    colorBgLayout: "#f4f4f3",
    borderRadius: 8,
    borderRadiusLG: 14,
    controlHeight: 38,
    fontSize: 14,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxShadowSecondary: "0 12px 40px rgba(0, 0, 0, 0.1)",
  },
  components: {
    Card: {
      headerBg: "#ffffff",
      headerHeight: 64,
      paddingLG: 22,
    },
    Tabs: {
      itemColor: "#5f5a55",
      itemHoverColor: "#d62d33",
      itemSelectedColor: "#8e191d",
      inkBarColor: "#d62d33",
      horizontalItemPadding: "12px 4px",
      horizontalItemGutter: 30,
    },
    Button: {
      primaryShadow: "0 6px 16px rgba(214, 45, 51, 0.22)",
      fontWeight: 600,
    },
    Segmented: {
      itemSelectedBg: "#ffffff",
      trackBg: "#f2f1f0",
    },
    Select: {
      optionSelectedBg: "#fdf2f2",
      zIndexPopup: 50,
    },
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider theme={theme}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AuthGate>
        <Component {...pageProps} />
      </AuthGate>
    </ConfigProvider>
  )
}
