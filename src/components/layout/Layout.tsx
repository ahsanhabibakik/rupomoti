'use client'

import { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
        <Navbar />
        <main className="flex-1 mt-16">
          <ErrorBoundary fallback={<div className="container mx-auto px-4 py-16 text-center">Something went wrong. Please try again later.</div>}>
            {children}
          </ErrorBoundary>
        </main>
        <Footer />
      </ErrorBoundary>
    </div>
  )
} 