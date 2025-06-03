'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, Search, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink } from '@/components/ui/navigation-menu'
import { colors } from '@/lib/constants/colors'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { SearchModal } from '@/components/search/SearchModal'

const navigationLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/new-arrivals', label: 'New Arrivals' },
  { href: '/best-sellers', label: 'Best Sellers' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const searchPlaceholders = [
  'Search for elegant pearl necklaces...',
  'Find the perfect wedding jewelry...',
  'Discover unique diamond rings...',
  'Browse our latest collections...',
  'Find the perfect gift...',
]

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [placeholder, setPlaceholder] = useState(searchPlaceholders[0])
  const [isScrolled, setIsScrolled] = useState(false)

  // Change placeholder text periodically
  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % searchPlaceholders.length
      setPlaceholder(searchPlaceholders[currentIndex])
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Main Navigation Bar */}
        <div className="h-16 flex items-center justify-between lg:justify-start lg:gap-8">
          {/* Mobile Menu (Left) */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <div className="flex flex-col gap-6 mt-8">
                <div className="space-y-4">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-lg font-medium hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl font-bold text-primary shrink-0"
            style={{ color: colors.primary.DEFAULT }}
          >
            Rupomoti
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <NavigationMenu>
              <NavigationMenuList>
                {navigationLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild>
                      <Link 
                        href={link.href} 
                        className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-center lg:px-4">
            <Button
              variant="outline"
              className="w-full max-w-md justify-start text-left text-muted-foreground"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              <span className="truncate">{placeholder}</span>
            </Button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <CartDrawer />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden py-3">
          <Button
            variant="outline"
            className="w-full justify-start text-left text-muted-foreground"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="truncate">{placeholder}</span>
          </Button>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  )
} 