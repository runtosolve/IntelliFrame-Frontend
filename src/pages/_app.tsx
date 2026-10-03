import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ConfigProvider } from 'antd'
import AuthGate from '@/auth/auth-gate'

const theme = {
  token: {
    colorPrimary: "#173c5e",
    colorInfo: "#173c5e",
    colorLink: "#175f88",
    colorText: "#172b3f",
    colorTextSecondary: "#64748b",
    colorBorder: "#dbe4ea",
    colorBgLayout: "#f4f7f9",
    borderRadius: 8,
    borderRadiusLG: 14,
    controlHeight: 38,
    fontSize: 14,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxShadowSecondary: "0 12px 40px rgba(23, 60, 94, 0.12)",
  },
  components: {
    Card: {
      headerBg: "#ffffff",
      headerHeight: 64,
      paddingLG: 22,
    },
    Tabs: {
      itemColor: "#64748b",
      itemHoverColor: "#173c5e",
      itemSelectedColor: "#173c5e",
      inkBarColor: "#173c5e",
      horizontalItemPadding: "12px 4px",
      horizontalItemGutter: 30,
    },
    Button: {
      primaryShadow: "0 6px 16px rgba(23, 60, 94, 0.18)",
      fontWeight: 600,
    },
    Segmented: {
      itemSelectedBg: "#ffffff",
      trackBg: "#eef3f6",
    },
    Select: {
      optionSelectedBg: "#edf4f8",
      zIndexPopup: 50,
    },
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider theme={theme}>
      <AuthGate>
        <Component {...pageProps} />
      </AuthGate>
    </ConfigProvider>
  )
}
