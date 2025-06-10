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
import { signIn } from 'next-auth/react'
import { useSession } from 'next-auth/react'

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
  const { data: session } = useSession()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentPlaceholder, setCurrentPlaceholder] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder(
        searchPlaceholders[Math.floor(Math.random() * searchPlaceholders.length)]
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Main Navigation Bar */}
        <div className="h-16 flex items-center justify-between lg:justify-start lg:gap-8">
          {/* Mobile Menu (Left) */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
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
                      onClick={() => setIsMobileMenuOpen(false)}
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
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navigationLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <Link href={link.href} legacyBehavior passHref>
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                      {link.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <CartDrawer />
            {session ? (
              <Link href="/account">
                <Button variant="ghost" size="icon">
                  <ShoppingBag className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button
                variant="ghost"
                onClick={() => signIn()}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      <SearchModal
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        placeholder={currentPlaceholder}
      />
    </header>
  )
} 