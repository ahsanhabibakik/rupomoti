'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink } from '@/components/ui/navigation-menu'
import { colors } from '@/lib/constants/colors'
import { CartDrawer } from '@/components/cart/CartDrawer'

const navigationLinks = [
  { href: '/jewelry', label: 'Jewelry' },
  { href: '/collections', label: 'Collections' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Mobile Menu (Left) */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-4 mt-8">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl font-bold text-primary lg:order-first"
            style={{ color: colors.primary.DEFAULT }}
          >
            Rupomoti
          </Link>

          {/* Desktop Navigation (Middle) */}
          <div className="hidden lg:flex lg:items-center lg:gap-6">
            <NavigationMenu>
              <NavigationMenuList>
                {navigationLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <Link href={link.href} legacyBehavior passHref>
                      <NavigationMenuLink className="hover:text-primary">
                        {link.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <CartDrawer />
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 px-2 border-t">
            <div className="max-w-md mx-auto">
              <Input
                type="search"
                placeholder="Search for jewelry..."
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 