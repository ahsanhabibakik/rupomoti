'use client'

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ErrorBoundary } from "@/components/ErrorBoundary"

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
            {children}
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  )
} 