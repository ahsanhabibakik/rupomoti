"use client";

import { useState, useEffect } from "react";
import { Menu, ChevronDown, X, Sparkles, LogOut, Settings, User, Shield } from "lucide-react";
import { PiBasketThin } from "react-icons/pi";
import { VscAccount } from "react-icons/vsc";
import { BsSearch } from "react-icons/bs";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import SearchModal from "@/components/search/SearchModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toggleCart } from "@/redux/slices/cartSlice";

const placeholderTexts = [
  "Search pearl jewelry...",
  "Find your perfect pearl necklace...",
  "Try pearl earrings...",
  "Shop pearl rings...",
];

const categories = [
  { name: "All Jewelry", href: "/shop" },
  { name: "Pearl Necklaces", href: "/shop/necklaces" },
  { name: "Pearl Earrings", href: "/shop/earrings" },
  { name: "Pearl Rings", href: "/shop/rings" },
  { name: "Pearl Bracelets", href: "/shop/bracelets" },
  { name: "Pearl Sets", href: "/shop/sets" },
  { name: "Freshwater Pearls", href: "/shop/freshwater" },
  { name: "South Sea Pearls", href: "/shop/south-sea" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const [placeholder, setPlaceholder] = useState(placeholderTexts[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("/images/branding/logo.png");

  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/media?section=logo")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0 && data[0].url) {
          setLogoUrl(data[0].url);
        }
      })
      .catch(() => {});
  }, []);

  const getCartCount = () => {
    if (!mounted || !cartItems) return 0;
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const isAdmin = session?.user?.role === 'ADMIN';
  const isManager = session?.user?.role === 'MANAGER';
  const isAdminOrManager = isAdmin || isManager;

  const handleOpenCategories = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setIsCategoriesOpen(true);
  };

  const handleCloseCategories = () => {
    const timeout = setTimeout(() => {
      setIsCategoriesOpen(false);
    }, 300);
    setCloseTimeout(timeout);
  };

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % placeholderTexts.length;
      setPlaceholder(placeholderTexts[i]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const categoriesDropdown = document.getElementById("categories-dropdown");
      const categoriesButton = document.getElementById("categories-button");
      const userDropdown = document.getElementById("user-dropdown");
      const userButton = document.getElementById("user-button");

      if (isCategoriesOpen && categoriesDropdown && categoriesButton) {
        if (
          !categoriesDropdown.contains(event.target as Node) &&
          !categoriesButton.contains(event.target as Node)
        ) {
          setIsCategoriesOpen(false);
        }
      }

      if (isUserMenuOpen && userDropdown && userButton) {
        if (
          !userDropdown.contains(event.target as Node) &&
          !userButton.contains(event.target as Node)
        ) {
          setIsUserMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoriesOpen, isUserMenuOpen]);

  return (
    <nav className="bg-deep-mocha text-pearl-white shadow-premium sticky top-0 z-50">
      {/* Pearl pattern background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-2 left-2 transform rotate-12">
          <Sparkles size={20} className="text-champagne-gold" />
        </div>
        <div className="absolute top-2 left-1/4 transform rotate-45">
          <Sparkles size={16} className="text-champagne-gold" />
        </div>
        <div className="absolute top-2 left-1/2 transform rotate-90">
          <Sparkles size={18} className="text-champagne-gold" />
        </div>
        <div className="absolute top-2 left-3/4 transform rotate-135">
          <Sparkles size={14} className="text-champagne-gold" />
        </div>
        <div className="absolute top-2 right-2 transform -rotate-12">
          <Sparkles size={20} className="text-champagne-gold" />
        </div>
        <div className="absolute bottom-2 left-2 transform -rotate-45">
          <Sparkles size={16} className="text-champagne-gold" />
        </div>
        <div className="absolute bottom-2 left-1/4 transform -rotate-90">
          <Sparkles size={18} className="text-champagne-gold" />
        </div>
        <div className="absolute bottom-2 left-1/2 transform -rotate-135">
          <Sparkles size={14} className="text-champagne-gold" />
        </div>
        <div className="absolute bottom-2 left-3/4 transform -rotate-180">
          <Sparkles size={16} className="text-champagne-gold" />
        </div>
        <div className="absolute bottom-2 right-2 transform rotate-45">
          <Sparkles size={20} className="text-champagne-gold" />
        </div>
        <div className="absolute top-1/2 left-1/4 transform rotate-30">
          <Sparkles size={22} className="text-champagne-gold" />
        </div>
        <div className="absolute top-1/2 right-1/4 transform -rotate-30">
          <Sparkles size={22} className="text-champagne-gold" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-2 relative z-10">
        {/* Mobile layout */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 relative">
          <div className="flex items-center gap-2">
            <button
              className="block md:hidden text-pearl-white hover:text-champagne-gold p-2 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          <div className="block md:hidden absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="flex items-center">
              <div className="flex items-center gap-2">
                <Image
                  src={logoUrl}
                  alt="Rupomoti Logo"
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
              </div>
            </Link>
          </div>
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Account/User Menu */}
            {session ? (
              <div className="relative">
                <button
                  id="user-button-mobile"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="text-pearl-white hover:bg-cocoa-brown/80 p-2 rounded-full transition-colors flex items-center gap-1"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="User"
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  ) : (
                    <VscAccount size={20} />
                  )}
                  {isAdminOrManager && (
                    <Shield size={12} className="text-yellow-400" />
                  )}
                </button>
              </div>
            ) : (
              <Link
                href="/signin"
                className="text-pearl-white hover:bg-cocoa-brown/80 p-2 rounded-full transition-colors"
              >
                <VscAccount size={20} />
              </Link>
            )}
            <button
              onClick={() => dispatch(toggleCart())}
              className="text-pearl-white hover:bg-cocoa-brown/80 p-2 rounded-full relative transition-colors"
            >
              <PiBasketThin size={20} />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-primary text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {getCartCount()}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Desktop logo */}
        <div className="hidden md:flex items-center">
          <Link href="/" className="flex items-center">
            <div className="flex items-center gap-2">
              <Image
                src={logoUrl}
                alt="Rupomoti Logo"
                width={180}
                height={60}
                className="h-8 md:h-10 w-auto"
              />
            </div>
          </Link>
        </div>


        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-3 text-pearl-white">
          <Link
            href="/shop"
            className="hover:text-base transition-colors text-sm font-medium"
          >
            Shop
          </Link>
          <div className="relative group">
            <button
              id="categories-button"
              className="flex items-center hover:text-base transition-colors text-sm font-medium"
              onMouseEnter={handleOpenCategories}
              onMouseLeave={handleCloseCategories}
            >
              Categories
              <ChevronDown size={14} className="ml-1" />
            </button>
            {isCategoriesOpen && (
              <div
                id="categories-dropdown"
                className="absolute top-full left-0 mt-1 w-48 bg-pearl-light rounded-lg shadow-pearl py-2 z-50 border border-pearl-dark"
                onMouseEnter={handleOpenCategories}
                onMouseLeave={handleCloseCategories}
              >
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="block px-4 py-2 text-charcoal hover:bg-gold/10 hover:text-gold transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/about"
            className="hover:text-base transition-colors text-sm font-medium"
          >
            About
          </Link>
          <Link
            href="/blog"
            className="hover:text-base transition-colors text-sm font-medium"
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className="hover:text-base transition-colors text-sm font-medium"
          >
            Contact
          </Link>
        </div>

            {/* Search bar */}
        <div className="w-full md:flex-1 md:max-w-xl md:mx-2 mt-2 md:mt-0">
          <div className="relative">
            <input
              type="text"
              placeholder={placeholder}
              className="w-full px-4 py-2 pl-10 pr-4 rounded-lg bg-pearl-white text-cocoa-brown placeholder-mink-taupe focus:outline-none focus:ring-2 focus:ring-champagne-gold text-sm md:text-base cursor-pointer border border-champagne-gold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onClick={() => setIsSearchOpen(true)}
            />
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-cocoa-brown hover:text-champagne-gold"
              onClick={() => setIsSearchOpen(true)}
            >
              <BsSearch size={18} />
            </button>
          </div>
        </div>
        
        {/* Desktop icons */}
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <div className="relative">
              <button
                id="user-button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="text-pearl-white hover:bg-cocoa-brown/80 p-2 rounded-full transition-colors flex items-center gap-2"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : (
                  <VscAccount size={20} />
                )}
                {isAdminOrManager && (
                  <Shield size={14} className="text-yellow-400" />
                )}
                <ChevronDown size={14} />
              </button>
              
              {isUserMenuOpen && (
                <div
                  id="user-dropdown"
                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border"
                >
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                    <p className="text-xs text-gray-500">{session.user?.email}</p>
                    {isAdminOrManager && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        <Shield size={10} />
                        {isAdmin ? 'Admin' : 'Manager'}
                      </span>
                    )}
                  </div>
                  
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User size={16} />
                    My Account
                  </Link>
                  
                  {isAdminOrManager && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Shield size={16} />
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      setIsUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/signin"
              className="text-pearl-white hover:bg-cocoa-brown/80 p-2 rounded-full transition-colors"
            >
              <VscAccount size={20} />
            </Link>
          )}
          
          <button
            onClick={() => dispatch(toggleCart())}
            className="text-pearl-white hover:bg-cocoa-brown/80 p-2 rounded-full relative transition-colors"
          >
            <PiBasketThin size={20} />
            {getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-primary text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-pearl-light text-charcoal shadow-pearl px-4 pb-4 relative z-10 border-t border-pearl-dark">
          <ul className="space-y-2">
            {session && isAdminOrManager && (
              <li>
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-charcoal hover:text-gold"
                >
                  <Shield size={16} />
                  Admin Dashboard
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/shop"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-charcoal hover:text-gold"
              >
                Shop
              </Link>
            </li>
            <li>
              <details>
                <summary className="text-base font-medium text-charcoal py-2">
                  Categories
                </summary>
                <ul className="pl-4 space-y-2">
                  {categories.map((category) => (
                    <li key={category.name}>
                      <Link
                        href={category.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2 text-charcoal hover:text-gold"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
            <li>
              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-charcoal hover:text-gold"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-charcoal hover:text-gold"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-charcoal hover:text-gold"
              >
                Contact
              </Link>
            </li>
            {session && (
              <li className="border-t pt-2 mt-2">
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 py-2 text-red-600 hover:text-red-700"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      )}
    </nav>
  );
} 