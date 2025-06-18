"use client";

import { useState, useEffect } from "react";
import { Menu, ChevronDown, X, Sparkles } from "lucide-react";
import { PiBasketThin } from "react-icons/pi";
import { VscAccount } from "react-icons/vsc";
import { BsSearch } from "react-icons/bs";
import Link from "next/link";
import Image from "next/image";
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
  const [placeholder, setPlaceholder] = useState(placeholderTexts[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getCartCount = () => {
    if (!mounted || !cartItems) return 0;
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

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

      if (isCategoriesOpen && categoriesDropdown && categoriesButton) {
        if (
          !categoriesDropdown.contains(event.target as Node) &&
          !categoriesButton.contains(event.target as Node)
        ) {
          setIsCategoriesOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoriesOpen]);

  return (
    <nav className="bg-gradient-to-r from-primary to-primary-dark text-accent shadow-premium sticky top-0 z-50">
      {/* Pearl pattern background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-2 left-2 transform rotate-12">
          <Sparkles size={20} className="text-accent" />
        </div>
        <div className="absolute top-2 left-1/4 transform rotate-45">
          <Sparkles size={16} className="text-accent" />
        </div>
        <div className="absolute top-2 left-1/2 transform rotate-90">
          <Sparkles size={18} className="text-accent" />
        </div>
        <div className="absolute top-2 left-3/4 transform rotate-135">
          <Sparkles size={14} className="text-accent" />
        </div>
        <div className="absolute top-2 right-2 transform -rotate-12">
          <Sparkles size={20} className="text-accent" />
        </div>
        <div className="absolute bottom-2 left-2 transform -rotate-45">
          <Sparkles size={16} className="text-accent" />
        </div>
        <div className="absolute bottom-2 left-1/4 transform -rotate-90">
          <Sparkles size={18} className="text-accent" />
        </div>
        <div className="absolute bottom-2 left-1/2 transform -rotate-135">
          <Sparkles size={14} className="text-accent" />
        </div>
        <div className="absolute bottom-2 left-3/4 transform -rotate-180">
          <Sparkles size={16} className="text-accent" />
        </div>
        <div className="absolute bottom-2 right-2 transform rotate-45">
          <Sparkles size={20} className="text-accent" />
        </div>
        <div className="absolute top-1/2 left-1/4 transform rotate-30">
          <Sparkles size={22} className="text-accent" />
        </div>
        <div className="absolute top-1/2 right-1/4 transform -rotate-30">
          <Sparkles size={22} className="text-accent" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-2 relative z-10">
        {/* Mobile layout */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 relative">
          <div className="flex items-center gap-2">
            <button
              className="block md:hidden text-accent hover:bg-primary-light/20 p-2 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div className="block md:hidden absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="flex items-center">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/branding/logo.png"
                  alt="Rupomoti Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-accent to-base bg-clip-text text-transparent">
                  Rupomoti
                </span>
              </div>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/signin"
              className="text-accent hover:bg-primary-light/20 p-2 rounded-full transition-colors"
            >
              <VscAccount size={20} />
            </Link>
            <button
              onClick={() => dispatch(toggleCart())}
              className="text-accent hover:bg-primary-light/20 p-2 rounded-full relative transition-colors"
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
                src="/images/branding/logo.png"
                alt="Rupomoti Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-accent to-base bg-clip-text text-transparent">
                Rupomoti
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-3 text-accent">
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
              className="w-full px-4 py-2 pl-10 pr-4 rounded-lg bg-pearl-light/10 text-pearl placeholder-pearl/70 focus:outline-none focus:ring-2 focus:ring-gold text-sm md:text-base cursor-pointer border border-pearl-dark/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onClick={() => setIsSearchOpen(true)}
            />
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-pearl/70 hover:text-pearl"
              onClick={() => setIsSearchOpen(true)}
            >
              <BsSearch size={18} />
            </button>
          </div>
        </div>

        {/* Desktop icons */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/signin"
            className="text-accent hover:bg-primary-light/20 p-2 rounded-full transition-colors"
          >
            <VscAccount size={20} />
          </Link>
          <button
            onClick={() => dispatch(toggleCart())}
            className="text-accent hover:bg-primary-light/20 p-2 rounded-full relative transition-colors"
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