'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Sparkles, Gift, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OfferBanner {
  id: number
  title: string
  description: string
  link: string
  bgGradient: string
  icon: 'sparkles' | 'gift' | 'percent'
  textColor: string
}

const offers: OfferBanner[] = [
  {
    id: 1,
    title: "Summer Collection Sale",
    description: "Up to 30% off on Pearl Jewelry",
    link: "/shop?sale=summer",
    bgGradient: "from-accent to-primary",
    icon: "sparkles",
    textColor: "text-background"
  },
  {
    id: 2,
    title: "New Arrivals",
    description: "Fresh designs just for you",
    link: "/new-arrivals",
    bgGradient: "from-secondary to-accent",
    icon: "gift",
    textColor: "text-primary"
  },
  {
    id: 3,
    title: "Free Shipping",
    description: "On orders above ৳2000",
    link: "/shop",
    bgGradient: "from-primary to-secondary",
    icon: "percent",
    textColor: "text-background"
  }
]

const iconMap = {
  sparkles: Sparkles,
  gift: Gift,
  percent: Percent
}

export default function SeasonalOffersBanner() {
  const [currentOffer, setCurrentOffer] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % offers.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  const offer = offers[currentOffer]
  const Icon = iconMap[offer.icon]

  return (
    <div className={cn(
      "relative overflow-hidden bg-gradient-to-r transition-all duration-500",
      offer.bgGradient
    )}>
      <div className="container mx-auto px-4 py-2 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Icon className={cn("w-4 h-4 flex-shrink-0", offer.textColor)} />
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-semibold leading-tight", offer.textColor)}>
                {offer.title}
              </p>
              <p className={cn("text-xs opacity-90 leading-tight", offer.textColor)}>
                {offer.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              asChild 
              variant="ghost" 
              size="sm"
              className={cn(
                "text-xs font-medium hover:bg-background/20 h-8 px-3",
                offer.textColor
              )}
            >
              <Link href={offer.link}>
                Shop Now
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn("w-8 h-8", offer.textColor, "hover:bg-background/20")}
              onClick={() => setIsVisible(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Dots indicator */}
      <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-1">
        {offers.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1 h-1 rounded-full transition-all duration-300",
              index === currentOffer 
                ? "bg-current opacity-100" 
                : "bg-current opacity-40"
            )}
            style={{ color: offer.textColor.replace('text-', '') }}
          />
        ))}
      </div>
    </div>
  )
}
