"use client";
import React, { useState } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Search } from 'lucide-react'

// Mock Data
const mockPosts = [
  {
    slug: 'the-timeless-elegance-of-pearls',
    title: 'The Timeless Elegance of Pearls: A Guide to Choosing the Perfect Piece',
    author: 'Jane Doe',
    date: 'June 20, 2024',
    excerpt: 'Pearls have been a symbol of elegance and sophistication for centuries. In this guide, we explore the different types of pearls and how to choose the perfect piece for your collection.',
    image: '/images/hero/slider1.jpeg',
    featured: true,
  },
  {
    slug: 'how-to-care-for-your-pearl-jewelry',
    title: 'How to Care for Your Pearl Jewelry to Make It Last a Lifetime',
    author: 'John Smith',
    date: 'June 15, 2024',
    excerpt: 'Proper care is essential to keep your pearl jewelry looking its best. Follow these simple tips to ensure your pearls last a lifetime.',
    image: '/images/hero/slider2.jpeg',
  },
  {
    slug: 'the-history-of-pearls-in-fashion',
    title: 'The History of Pearls in Fashion: From Ancient Royalty to Modern Icons',
    author: 'Emily White',
    date: 'June 10, 2024',
    excerpt: 'Explore the rich history of pearls in fashion, from their use by ancient royalty to their status as a modern style icon.',
    image: '/images/hero/slider3.jpg',
  },
  {
    slug: 'the-perfect-pearls-for-your-wedding-day',
    title: 'The Perfect Pearls for Your Wedding Day',
    author: 'Sarah Green',
    date: 'June 5, 2024',
    excerpt: 'From classic strands to modern earrings, find the perfect pearl jewelry to complete your wedding day look.',
    image: '/images/hero/slider4.jpg',
  },
]

const mockCategories = [
  'All',
  'Care',
  'Jewelry',
  'Stories',
  'Events',
  'Tips',
  'Culture',
  'Design',
]

const mockAuthors = {
  'Ayesha Rahman': '/images/avatars/ayesha.png',
  'Rupomoti Team': '/images/avatars/rupomoti.png',
  'Sadia Islam': '/images/avatars/sadia.png',
  'Tanvir Hasan': '/images/avatars/tanvir.png',
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const featuredPost = mockPosts[0]
  const regularPosts = mockPosts.slice(1)
  const filteredPosts = regularPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || post.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12">
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">From Our Journal</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stories of elegance, craftsmanship, and the timeless beauty of pearls.
          </p>
        </div>

        {/* Blog Search Bar */}
        <div className="flex items-center gap-2 mb-4 max-w-md mx-auto bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-primary">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search blog posts..."
            className="flex-1 bg-transparent outline-none text-sm px-2 py-1"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {mockCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full border text-sm whitespace-nowrap transition-colors font-medium ${selectedCategory === cat ? 'bg-primary text-white border-primary shadow' : 'bg-white text-gray-700 border-gray-200 hover:bg-primary/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post - Large, full width on mobile */}
        {featuredPost && (
          <Link href={`/blog/${featuredPost.slug}`} className="block group mb-10">
            <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden shadow-lg">
              <Image src={featuredPost.image} alt={featuredPost.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white flex flex-col gap-2">
                <Badge className="mb-1 bg-white/20 text-white border-white/30">Featured</Badge>
                <h2 className="text-2xl sm:text-3xl font-bold group-hover:text-accent transition-colors drop-shadow-lg">{featuredPost.title}</h2>
                <p className="text-sm sm:text-base text-white/90 max-w-xl drop-shadow">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Image src={mockAuthors[featuredPost.author] || '/images/avatars/default.png'} alt={featuredPost.author} width={32} height={32} className="rounded-full border-2 border-white shadow" />
                  <span className="text-xs text-white/80">By {featuredPost.author} on {featuredPost.date}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Staggered Grid for Other Posts */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post, i) => (
            <Link href={`/blog/${post.slug}`} key={post.slug} className={
              `block group rounded-2xl overflow-hidden shadow-lg bg-white flex flex-col h-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl ${i % 2 === 1 ? 'md:mt-8' : ''}`
            }>
              <div className="relative w-full aspect-[4/3]">
                <Image src={post.image} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg sm:text-xl font-bold mb-1 group-hover:text-accent transition-colors">{post.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Image src={mockAuthors[post.author] || '/images/avatars/default.png'} alt={post.author} width={28} height={28} className="rounded-full border border-gray-200 shadow-sm" />
                  <span className="text-xs text-muted-foreground">By {post.author} on {post.date}</span>
                </div>
                <p className="text-sm text-muted-foreground flex-1">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold mt-4 group-hover:underline">Read More</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 