import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
import { goerli } from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [goerli],
    [
        alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_KEY}),
        publicProvider()
    ],
)

const { connectors } = getDefaultWallets({
    appName: 'RPS-LS',
    chains
})

export const config = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
})

export { chains }
