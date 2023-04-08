import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Web3Provider } from '../../providers/Web3'
import { useIsMounted } from '../../hooks/useIsMounted'

export default function App({ Component, pageProps }: AppProps) {
  const isMounted = useIsMounted()

  return (
      <Web3Provider>
        {isMounted && (
          <Component {...pageProps} />
        )}
      </Web3Provider>
  )
}
