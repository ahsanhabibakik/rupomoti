import { Inter, Rubik } from 'next/font/google'
import { RootLayoutClient } from '@/components/layout/RootLayoutClient'
import { Providers } from '@/components/providers'
import './globals.css'
import { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const rubik = Rubik({
  subsets: ['latin'],
  variable: '--font-rubik',
})

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
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          rubik.variable,
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                error: 'bg-red-400',
                success: 'text-green-400',
                warning: 'text-yellow-400',
                info: 'bg-blue-400',
              },
            }}
          />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
