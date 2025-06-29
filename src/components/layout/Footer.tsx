'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Send,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const footerLinks = {
  shop: [
    { name: 'All Pearl Jewelry', href: '/shop' },
    { name: 'Pearl Necklaces', href: '/shop/necklaces' },
    { name: 'Pearl Earrings', href: '/shop/earrings' },
    { name: 'Pearl Rings', href: '/shop/rings' },
    { name: 'Pearl Bracelets', href: '/shop/bracelets' },
  ],
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQs', href: '/faq' },
    { name: 'Shipping Info', href: '/shipping-returns' },
    { name: 'Returns', href: '/shipping-returns' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Care & Maintenance', href: '/care-maintenance' },
    { name: 'Pearl Guide', href: '/pearl-guide' },
    { name: 'Blog', href: '/blog' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Sitemap', href: '/sitemap' },
  ],
}

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/rupomoti' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/rupomoti' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/rupomoti' },
]

export default function Footer() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    if (!email) {
      toast.error('Please enter your email address.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message || 'Thank you for subscribing!')
        setEmail('')
      } else {
        toast.error(result.message || 'An error occurred.')
      }
    } catch (error) {
      toast.error('Failed to subscribe. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <footer className="bg-deep-mocha text-pearl-white relative overflow-hidden">
      {/* Decorative pearl/sparkle pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none select-none">
        {/* Top row of sparkles */}
        <div className="absolute top-4 left-4 transform rotate-12">
          <Sparkles size={24} className="text-champagne-gold" />
        </div>
        <div className="absolute top-4 left-1/4 transform rotate-45">
          <Sparkles size={20} className="text-champagne-gold" />
        </div>
        <div className="absolute top-4 left-1/2 transform rotate-90">
          <Sparkles size={22} className="text-champagne-gold" />
        </div>
        <div className="absolute top-4 left-3/4 transform rotate-135">
          <Sparkles size={18} className="text-champagne-gold" />
        </div>
        <div className="absolute top-4 right-4 transform -rotate-12">
          <Sparkles size={24} className="text-champagne-gold" />
        </div>
        {/* Middle row of sparkles */}
        <div className="absolute top-1/2 left-4 transform -rotate-45">
          <Sparkles size={20} className="text-champagne-gold" />
        </div>
        <div className="absolute top-1/2 left-1/4 transform -rotate-90">
          <Sparkles size={22} className="text-champagne-gold" />
        </div>
        <div className="absolute top-1/2 left-1/2 transform -rotate-135">
          <Sparkles size={18} className="text-champagne-gold" />
        </div>
        <div className="absolute top-1/2 left-3/4 transform -rotate-180">
          <Sparkles size={20} className="text-champagne-gold" />
        </div>
        <div className="absolute top-1/2 right-4 transform rotate-45">
          <Sparkles size={24} className="text-champagne-gold" />
        </div>
        {/* Bottom row of sparkles */}
        <div className="absolute bottom-4 left-4 transform rotate-45">
          <Sparkles size={20} className="text-champagne-gold" />
        </div>
        <div className="absolute bottom-4 left-1/4 transform rotate-90">
          <Sparkles size={22} className="text-champagne-gold" />
        </div>
        <div className="absolute bottom-4 left-1/2 transform rotate-135">
          <Sparkles size={18} className="text-champagne-gold" />
        </div>
        <div className="absolute bottom-4 left-3/4 transform rotate-180">
          <Sparkles size={20} className="text-champagne-gold" />
        </div>
        <div className="absolute bottom-4 right-4 transform -rotate-45">
          <Sparkles size={24} className="text-champagne-gold" />
        </div>
        {/* Additional scattered sparkles */}
        <div className="absolute top-1/3 left-1/3 transform rotate-30">
          <Sparkles size={26} className="text-champagne-gold" />
        </div>
        <div className="absolute top-2/3 right-1/3 transform -rotate-30">
          <Sparkles size={26} className="text-champagne-gold" />
        </div>
        <div className="absolute top-1/4 right-1/4 transform rotate-60">
          <Sparkles size={22} className="text-champagne-gold" />
        </div>
        <div className="absolute bottom-1/4 left-1/4 transform -rotate-60">
          <Sparkles size={22} className="text-champagne-gold" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/branding/logo.png"
                alt="Rupomoti Logo"
                width={80}
                height={40}
                className="w-auto h-10"
              />
            </Link>
            <p className="text-pearl-white max-w-md">
              Crafting timeless pieces of pearl elegance. Your trusted destination for fine pearl jewelry that tells your unique story.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/rupomoti"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-pearl-white hover:text-champagne-gold transition-colors cursor-pointer focus:outline-none"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com/rupomoti"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-pearl-white hover:text-champagne-gold transition-colors cursor-pointer focus:outline-none"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com/rupomoti"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-pearl-white hover:text-champagne-gold transition-colors cursor-pointer focus:outline-none"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-pearl-white">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/shop"
                  className="text-pearl-white hover:text-champagne-gold transition-colors flex items-center gap-2"
                >
                  <Sparkles size={16} className="text-champagne-gold" />
                  Shop Jewelry
                </Link>
              </li>
              <li>
                <Link
                  href="/care-maintenance"
                  className="text-pearl-white hover:text-champagne-gold transition-colors flex items-center gap-2"
                >
                  <Sparkles size={16} className="text-champagne-gold" />
                  Care & Maintenance
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-pearl-white hover:text-champagne-gold transition-colors flex items-center gap-2"
                >
                  <Sparkles size={16} className="text-champagne-gold" />
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-pearl-white hover:text-champagne-gold transition-colors flex items-center gap-2"
                >
                  <Sparkles size={16} className="text-champagne-gold" />
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-pearl-white">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-pearl-white">
                <MapPin size={18} className="text-champagne-gold" />
                <span>House 1217, Road 10, Avenue 10, Mirpur DOHS, Dhaka</span>
              </li>
              <li className="flex items-center gap-2 text-pearl-white">
                <Phone size={18} />
                <span>01765703237</span>
              </li>
              <li className="flex items-center gap-2 text-pearl-white">
                <Phone size={18} />
                <span>01518926700</span>
              </li>
              <li className="flex items-center gap-2 text-pearl-white">
                <Mail size={18} />
                <span>support@rupomoti.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-pearl-white">Stay Updated</h3>
            <p className="text-pearl-white">
              Subscribe to our newsletter for pearl care tips and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="relative flex-grow w-full">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-2 rounded bg-pearl border border-pearl-white text-pearl-white placeholder-pearl/70 focus:outline-none focus:ring-2 focus:ring-gold"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="flex items-center justify-center gap-2 bg-gold hover:bg-gold/90 text-pearl-dark py-2 px-4 rounded transition-colors disabled:opacity-60"
                disabled={isLoading}
              >
                <Send size={16} />
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-pearl mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-pearl-white text-sm">
              © {new Date().getFullYear()} Rupomoti. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-pearl-white hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-pearl-white hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/shipping-returns"
                className="text-pearl-white hover:text-white transition-colors"
              >
                Shipping & Returns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 