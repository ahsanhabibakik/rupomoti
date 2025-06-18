'use client'

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Sparkles } from 'lucide-react'

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

export function Footer() {
  return (
    <footer className="border-t border-pearl-dark bg-pearl-light">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-5 xl:gap-8">
          <div className="space-y-8 xl:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-gold" />
              <span className="text-2xl font-bold bg-gradient-to-r from-gold to-sapphire bg-clip-text text-transparent">
                Rupomoti
              </span>
            </Link>
            <p className="text-sm text-slate max-w-md">
              Crafting timeless pieces of pearl elegance. Your trusted destination for fine pearl jewelry that tells your unique story.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-slate hover:text-gold transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-6 w-6" />
                  </a>
                )
              })}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-3 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-charcoal">Shop</h3>
                <ul role="list" className="mt-4 space-y-4">
                  {footerLinks.shop.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate hover:text-gold transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-charcoal">Support</h3>
                <ul role="list" className="mt-4 space-y-4">
                  {footerLinks.support.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate hover:text-gold transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-charcoal">Company</h3>
                <ul role="list" className="mt-4 space-y-4">
                  {footerLinks.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate hover:text-gold transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-charcoal">Legal</h3>
                <ul role="list" className="mt-4 space-y-4">
                  {footerLinks.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate hover:text-gold transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-pearl-dark pt-8">
          <p className="text-sm text-slate">
            © {new Date().getFullYear()} Rupomoti. All rights reserved. Crafting pearl jewelry excellence since 2024.
          </p>
        </div>
      </div>
    </footer>
  )
} 