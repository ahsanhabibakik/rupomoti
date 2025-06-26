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

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
                <div className="flex items-center justify-center py-2 border-b mb-4">
                    <Link href="/" className="flex items-center gap-2 mx-auto pb-4" onClick={() => setIsOpen(false)}>
                        <Image src="/images/branding/logo.png" alt="Rupomoti" width={80} height={35} className="object-contain -mt-4" />
                    </Link>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.href}
                            href={link.href}
                            className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
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

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          
          <div className="flex flex-1 items-center justify-start">
            <MobileNav />
            <Link href="/" className="hidden md:flex items-center gap-2">
              <Image src="/images/branding/logo.png" alt="Rupomoti" width={110} height={40} className="object-contain -mt-1" />
            </Link>
          </div>

          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center gap-2 md:hidden">
               <Image src="/images/branding/logo.png" alt="Rupomoti" width={110} height={40} className="object-contain -mt-1"/>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <NavLink key={link.href} href={link.href}>{link.name}</NavLink>
              ))}
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
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
      </header>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
} 