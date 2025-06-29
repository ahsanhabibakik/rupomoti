import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles, Clock, Star } from 'lucide-react'

export default function NewArrivalsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <Badge variant="secondary" className="text-lg px-4 py-2">
              New Arrivals
            </Badge>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Latest Jewelry Collection
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover our newest jewelry pieces, featuring exquisite designs and timeless elegance.
            Each piece is carefully crafted to perfection, bringing you the latest trends in fine jewelry.
          </p>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Fresh arrivals daily</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Premium quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Limited editions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="text-center py-16">
          <div className="text-muted-foreground mb-4">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">New Products Loading...</h3>
            <p>We're fetching our latest jewelry pieces for you!</p>
          </div>
          <Button asChild className="mt-4">
            <Link href="/shop">Browse All Products</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
