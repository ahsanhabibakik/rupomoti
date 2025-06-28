"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Search, ShoppingCart, ChevronDown, User, Shield, LogOut, Settings } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setCartDrawerOpen } from "@/redux/slices/uiSlice";
import SearchModal from "@/components/search/SearchModal";
import MobileSearchBar from "@/components/search/MobileSearchBar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Best Sellers", href: "/best-sellers" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
];

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
}

function UserMenu() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'ADMIN';

    if (!session) {
        return (
            <Link href="/signin" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary whitespace-nowrap">
                <User className="h-5 w-5" />
                <span>Sign In</span>
            </Link>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                     {session.user?.image ? (
                        <Image src={session.user.image} alt="User" width={24} height={24} className="rounded-full" />
                    ) : (
                        <User className="h-5 w-5" />
                    )}
                    <span className="hidden sm:inline text-sm font-medium">{session.user?.name}</span>
                    {isAdmin && <Shield size={14} className="text-amber-500" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                     <DropdownMenuItem asChild>
                        <Link href="/admin"><Shield className="mr-2 h-4 w-4" /> Admin Dashboard</Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link href="/account"><Settings className="mr-2 h-4 w-4" /> Account Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();

    // Split navigation links into two columns
    const leftColumnLinks = navLinks.slice(0, 3); // Home, Shop, New Arrivals
    const rightColumnLinks = navLinks.slice(3);   // Best Sellers, About Us, Contact

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px]">
                {/* Logo Section */}
                <div className="flex items-center justify-center py-2 border-b mb-6">
                    <Link href="/" className="flex items-center gap-2 mx-auto pb-4" onClick={() => setIsOpen(false)}>
                        <Image src="/images/branding/logo.png" alt="Rupomoti" width={80} height={35} className="object-contain -mt-4" />
                    </Link>
                </div>
                
                {/* Two Column Navigation */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Left Column */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2 border-b pb-1">Main</h3>
                        {leftColumnLinks.map((link) => (
                            <Link 
                                key={link.href}
                                href={link.href}
                                className="text-base font-medium text-foreground hover:text-primary transition-colors py-1"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    
                    {/* Right Column */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2 border-b pb-1">More</h3>
                        {rightColumnLinks.map((link) => (
                            <Link 
                                key={link.href}
                                href={link.href}
                                className="text-base font-medium text-foreground hover:text-primary transition-colors py-1"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Additional Quick Links */}
                <div className="border-t pt-4 mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Links</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Link 
                            href="/wishlist"
                            className="text-sm text-foreground hover:text-primary transition-colors py-2"
                            onClick={() => setIsOpen(false)}
                        >
                            Wishlist
                        </Link>
                        <Link 
                            href="/order-tracking"
                            className="text-sm text-foreground hover:text-primary transition-colors py-2"
                            onClick={() => setIsOpen(false)}
                        >
                            Track Order
                        </Link>
                        <Link 
                            href="/faq"
                            className="text-sm text-foreground hover:text-primary transition-colors py-2"
                            onClick={() => setIsOpen(false)}
                        >
                            FAQ
                        </Link>
                        <Link 
                            href="/shipping-returns"
                            className="text-sm text-foreground hover:text-primary transition-colors py-2"
                            onClick={() => setIsOpen(false)}
                        >
                            Shipping
                        </Link>
                    </div>
                </div>

                {/* User Section */}
                <div className="border-t pt-4">
                    {session ? (
                        <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                            {session.user?.image ? (
                                <Image src={session.user.image} alt="User" width={32} height={32} className="rounded-full" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary-foreground" />
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="text-sm font-medium">{session.user?.name}</p>
                                <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Link href="/signin" className="flex-1">
                                <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/signup" className="flex-1">
                                <Button className="w-full" onClick={() => setIsOpen(false)}>
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

  const handleMobileSearch = (query: string) => {
    setIsSearchOpen(true);
    // You can also implement direct search logic here
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        {/* Main navbar */}
        <div className="container flex h-16 items-center justify-between px-4">
          
          <div className="flex flex-1 items-center justify-start md:flex-none">
            <MobileNav />
            <Link href="/" className="hidden md:flex items-center gap-2">
              <Image src="/images/branding/logo.png" alt="Rupomoti" width={110} height={40} className="object-contain -mt-1" />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center md:hidden">
            <Link href="/" className="flex items-center gap-2">
               <Image src="/images/branding/logo.png" alt="Rupomoti" width={110} height={40} className="object-contain -mt-1"/>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>{link.name}</NavLink>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="hidden md:flex">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => dispatch(setCartDrawerOpen(true))} className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Open Cart</span>
              {cartCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {cartCount}
                  </span>
              )}
            </Button>
            <UserMenu />
          </div>
        </div>
        
        {/* Mobile search bar - second row */}
        <div className="md:hidden border-t bg-background/95">
          <div className="container px-4 py-3">
            <MobileSearchBar onSearch={handleMobileSearch} />
          </div>
        </div>
      </header>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
} 