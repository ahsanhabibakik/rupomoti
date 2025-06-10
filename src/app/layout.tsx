import { Inter } from 'next/font/google'
import { RootLayoutClient } from '@/components/layout/RootLayoutClient'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Providers } from './providers'
import './globals.css'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Rupomoti - Elegant Jewelry Collection',
    template: '%s | Rupomoti'
  },
  description: 'Discover our exquisite collection of elegant jewelry pieces. From timeless classics to modern designs, find the perfect piece for every occasion.',
  keywords: ['jewelry', 'necklaces', 'rings', 'earrings', 'bracelets', 'bangladesh jewelry', 'luxury jewelry'],
  authors: [{ name: 'Rupomoti' }],
  creator: 'Rupomoti',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rupomoti.com',
    siteName: 'Rupomoti',
    title: 'Rupomoti - Elegant Jewelry Collection',
    description: 'Discover our exquisite collection of elegant jewelry pieces.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rupomoti Jewelry'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rupomoti - Elegant Jewelry Collection',
    description: 'Discover our exquisite collection of elegant jewelry pieces.',
    images: ['/og-image.jpg'],
    creator: '@rupomoti'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-site-verification',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <Providers>
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
