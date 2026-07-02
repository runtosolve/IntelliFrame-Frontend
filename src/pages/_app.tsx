import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'

const CognitoAuthProvider = dynamic(() => import('@/components/auth-provider'), { ssr: false })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CognitoAuthProvider>
      <Component {...pageProps} />
    </CognitoAuthProvider>
  )
}
