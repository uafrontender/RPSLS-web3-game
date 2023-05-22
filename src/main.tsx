import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { WagmiConfig } from 'wagmi'
import { RouterProvider } from "react-router-dom"
import router from './router'

import { chains, config } from './wallet'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <WagmiConfig config={config}>
            <RainbowKitProvider 
                chains={chains}
                theme={darkTheme({
                accentColor: '#289FEF',
                overlayBlur: 'small',
                })}
                showRecentTransactions={true}
                modalSize="compact"
            >
            <RouterProvider router={router} />
            </RainbowKitProvider>
        </WagmiConfig>
    </React.StrictMode>,
)
