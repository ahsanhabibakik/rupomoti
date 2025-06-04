import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-xl">Page not found</p>
      <a
        href="/"
        className="mt-8 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
      >
        Go back home
      </a>
    </div>
  )
} 