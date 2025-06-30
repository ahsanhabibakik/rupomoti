"use client";
import React, { useState } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { 
  ArrowRight, 
  Search, 
  Calendar, 
  User, 
  Clock, 
  BookOpen, 
  Filter,
  TrendingUp,
  Star,
  Heart,
  Share2,
  Bookmark,
  Eye,
  MessageCircle,
  Tag,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

// Mock Data
interface BlogPost {
  slug: string
  title: string
  author: string
  date: string
  readTime: string
  excerpt: string
  image: string
  featured?: boolean
  category: string
  tags: string[]
  views: number
  likes: number
  comments: number
}

const mockPosts: BlogPost[] = [
  {
    slug: 'the-timeless-elegance-of-pearls',
    title: 'The Timeless Elegance of Pearls: A Guide to Choosing the Perfect Piece',
    author: 'Jane Doe',
    date: 'June 20, 2024',
    readTime: '8 min read',
    excerpt: 'Pearls have been a symbol of elegance and sophistication for centuries. In this comprehensive guide, we explore the different types of pearls and how to choose the perfect piece for your collection.',
    image: '/images/hero/slider1.jpeg',
    featured: true,
    category: 'Jewelry',
    tags: ['Pearls', 'Elegance', 'Fashion'],
    views: 1247,
    likes: 89,
    comments: 23,
  },
  {
    slug: 'how-to-care-for-your-pearl-jewelry',
    title: 'How to Care for Your Pearl Jewelry to Make It Last a Lifetime',
    author: 'John Smith',
    date: 'June 15, 2024',
    readTime: '6 min read',
    excerpt: 'Proper care is essential to keep your pearl jewelry looking its best. Follow these simple tips to ensure your pearls last a lifetime and maintain their natural beauty.',
    image: '/images/hero/slider2.jpeg',
    category: 'Care',
    tags: ['Care', 'Maintenance', 'Tips'],
    views: 892,
    likes: 67,
    comments: 15,
  },
  {
    slug: 'the-history-of-pearls-in-fashion',
    title: 'The History of Pearls in Fashion: From Ancient Royalty to Modern Icons',
    author: 'Emily White',
    date: 'June 10, 2024',
    readTime: '12 min read',
    excerpt: 'Explore the rich history of pearls in fashion, from their use by ancient royalty to their status as a modern style icon. Discover how pearls have shaped fashion trends throughout the ages.',
    image: '/images/hero/slider3.jpg',
    category: 'Stories',
    tags: ['History', 'Fashion', 'Royalty'],
    views: 1567,
    likes: 134,
    comments: 31,
  },
  {
    slug: 'the-perfect-pearls-for-your-wedding-day',
    title: 'The Perfect Pearls for Your Wedding Day',
    author: 'Sarah Green',
    date: 'June 5, 2024',
    readTime: '7 min read',
    excerpt: 'From classic strands to modern earrings, find the perfect pearl jewelry to complete your wedding day look. Expert advice on choosing pearls that complement your dress and style.',
    image: '/images/hero/slider4.jpg',
    category: 'Events',
    tags: ['Wedding', 'Bridal', 'Special Occasions'],
    views: 2034,
    likes: 178,
    comments: 42,
  },
  {
    slug: 'sustainable-pearl-farming-practices',
    title: 'Sustainable Pearl Farming: Protecting Our Oceans While Creating Beauty',
    author: 'Michael Chen',
    date: 'May 28, 2024',
    readTime: '10 min read',
    excerpt: 'Learn about sustainable pearl farming practices and how responsible cultivation helps protect marine ecosystems while producing the world\'s most beautiful pearls.',
    image: '/images/pearl/jewelery1.jpeg',
    category: 'Culture',
    tags: ['Sustainability', 'Ocean', 'Farming'],
    views: 756,
    likes: 45,
    comments: 12,
  },
  {
    slug: 'pearl-jewelry-trends-2024',
    title: 'Pearl Jewelry Trends 2024: What\'s Hot This Year',
    author: 'Lisa Rodriguez',
    date: 'May 20, 2024',
    readTime: '9 min read',
    excerpt: 'Discover the latest pearl jewelry trends for 2024, from statement pieces to minimalist designs. Stay ahead of the fashion curve with these stunning pearl styles.',
    image: '/images/pearl/jewelery2.jpeg',
    category: 'Design',
    tags: ['Trends', '2024', 'Fashion'],
    views: 1892,
    likes: 156,
    comments: 28,
  },
]

const mockCategories = [
  { name: 'All', count: mockPosts.length },
  { name: 'Care', count: 1 },
  { name: 'Jewelry', count: 1 },
  { name: 'Stories', count: 1 },
  { name: 'Events', count: 1 },
  { name: 'Culture', count: 1 },
  { name: 'Design', count: 1 },
  { name: 'Tips', count: 0 },
]

interface Author {
  avatar: string
  bio: string
}

const mockAuthors: Record<string, Author> = {
  'Jane Doe': { avatar: '/images/avatars/ayesha.png', bio: 'Pearl Expert' },
  'John Smith': { avatar: '/images/avatars/rupomoti.png', bio: 'Jewelry Care Specialist' },
  'Emily White': { avatar: '/images/avatars/sadia.png', bio: 'Fashion Historian' },
  'Sarah Green': { avatar: '/images/avatars/tanvir.png', bio: 'Bridal Consultant' },
  'Michael Chen': { avatar: '/images/avatars/default.png', bio: 'Sustainability Expert' },
  'Lisa Rodriguez': { avatar: '/images/avatars/default.png', bio: 'Fashion Trend Analyst' },
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  const featuredPost = mockPosts.find(post => post.featured)
  const regularPosts = mockPosts.filter(post => !post.featured)
  
  const filteredPosts = regularPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const currentPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 py-4 sm:py-8">
        <div className="absolute inset-0 bg-[url('/images/pearl-pattern.svg')] opacity-5"></div>
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm">
              <BookOpen className="w-4 h-4 mr-2" />
              Our Journal
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                    style={{
                      background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      color: 'hsl(var(--primary))' // Fallback color
                    }}>
                Stories of Elegance
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Discover the timeless beauty of pearls through our curated collection of stories, 
              tips, and insights from the world of fine jewelry.
            </p>
            
            {/* Search and Filter Bar */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search articles, topics, or authors..."
                  className="pl-12 pr-4 py-3 text-lg bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-full focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {mockCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-all duration-200 font-medium ${
                      selectedCategory === cat.name 
                        ? 'bg-primary text-white border-primary shadow-lg scale-105' 
                        : 'bg-white/80 backdrop-blur-sm text-gray-700 border-gray-200 hover:bg-primary/10 hover:border-primary/30'
                    }`}
                  >
                    {cat.name}
                    <span className="ml-2 text-xs opacity-75">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12">
        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Featured Article</h2>
            </div>
            <Link href={`/blog/${featuredPost.slug}`} className="block group">
              <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-full min-h-[400px]">
                    <Image 
                      src={featuredPost.image} 
                      alt={featuredPost.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        Featured
                      </Badge>
                    </div>
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {featuredPost.category}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {featuredPost.date}
                      </div>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
                      {featuredPost.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image 
                          src={mockAuthors[featuredPost.author]?.avatar || '/images/avatars/default.png'} 
                          alt={featuredPost.author} 
                          width={40} 
                          height={40} 
                          className="rounded-full border-2 border-white shadow-lg" 
                        />
                        <div>
                          <p className="font-medium text-sm">{featuredPost.author}</p>
                          <p className="text-xs text-muted-foreground">{mockAuthors[featuredPost.author]?.bio}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {featuredPost.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {featuredPost.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        )}

        {/* Articles Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Latest Articles</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing {currentPosts.length} of {filteredPosts.length} articles</span>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {currentPosts.map((post, i) => (
              <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
                <Card className="h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white hover:-translate-y-2">
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src={post.image} 
                      alt={post.title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="bg-white/20 text-white hover:bg-white/30">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image 
                          src={mockAuthors[post.author]?.avatar || '/images/avatars/default.png'} 
                          alt={post.author} 
                          width={28} 
                          height={28} 
                          className="rounded-full border border-gray-200" 
                        />
                        <span className="text-sm font-medium">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likes}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-10 h-10"
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get the latest pearl jewelry trends, care tips, and exclusive offers delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button className="whitespace-nowrap">
                Subscribe
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 