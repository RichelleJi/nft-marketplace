import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { ETH_CHAINS, SITE_NAME } from '../utils/config'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: SITE_NAME,
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

export function Web3Provider(props: Props) {
  // const { colorMode } = useColorMode()

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        {props.children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
