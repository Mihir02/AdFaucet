import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sepolia Test Token Faucet',
  description: 'Get free test tokens on Sepolia testnet',
  keywords: 'ethereum, sepolia, testnet, faucet, tokens, web3, crypto',
  authors: [{ name: 'Crypto Faucet Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://quge5.com/88/tag.min.js" data-zone="201766" async data-cfasync="false"></script>
        <script src="https://quge5.com/88/tag.min.js" data-zone="201762" async data-cfasync="false"></script>
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}