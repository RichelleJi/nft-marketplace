import '@/styles/globals.css'
import { AppProps } from 'next/app'
import { Web3Provider } from '../../providers/Web3'

export default function App({ Component, pageProps }) {

  return (
      <Web3Provider>
        <Component {...pageProps} />
      </Web3Provider>
  )
}
