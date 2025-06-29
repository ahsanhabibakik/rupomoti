'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight, User, Tag, Bookmark, Eye, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  image: string
  author: {
    name: string
    avatar: string
    role: string
  }
  publishedAt: string
  readTime: number
  category: {
    name: string
    slug: string
    color: string
  }
  tags: string[]
  views: number
  featured: boolean
  slug: string
}

// Mock blog data - in production, this would come from your CMS or API
const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Ultimate Guide to Pearl Care and Maintenance',
    excerpt: 'Learn how to properly care for your precious pearls to maintain their luster and beauty for generations to come.',
    content: 'Pearls are organic gems that require special care...',
    image: '/images/pearl/pearl-care-guide.jpg',
    author: {
      name: 'Sarah Johnson',
      avatar: '/images/authors/sarah.jpg',
      role: 'Jewelry Expert'
    },
    publishedAt: '2024-12-20T10:00:00Z',
    readTime: 8,
    category: {
      name: 'Care Guide',
      slug: 'care-guide',
      color: 'bg-blue-500'
    },
    tags: ['Pearl Care', 'Jewelry Maintenance', 'Tips'],
    views: 1250,
    featured: true,
    slug: 'ultimate-guide-pearl-care-maintenance'
  },
  {
    id: '2',
    title: 'Trending Jewelry Styles for 2025: What\'s Hot This Year',
    excerpt: 'Discover the latest jewelry trends that are taking the fashion world by storm and how to incorporate them into your style.',
    content: 'Fashion trends are constantly evolving...',
    image: '/images/hero/jewelry-trends-2025.jpg',
    author: {
      name: 'Maria Rodriguez',
      avatar: '/images/authors/maria.jpg',
      role: 'Fashion Stylist'
    },
    publishedAt: '2024-12-18T14:30:00Z',
    readTime: 6,
    category: {
      name: 'Fashion',
      slug: 'fashion',
      color: 'bg-pink-500'
    },
    tags: ['Trends', '2025 Fashion', 'Style Guide'],
    views: 890,
    featured: true,
    slug: 'trending-jewelry-styles-2025'
  },
  {
    id: '3',
    title: 'Choosing the Perfect Wedding Jewelry: A Complete Guide',
    excerpt: 'From selecting the right pieces to coordinating with your dress, everything you need to know about wedding jewelry.',
    content: 'Your wedding day is one of the most important...',
    image: '/images/hero/wedding-jewelry-guide.jpg',
    author: {
      name: 'Emily Chen',
      avatar: '/images/authors/emily.jpg',
      role: 'Bridal Consultant'
    },
    publishedAt: '2024-12-15T09:15:00Z',
    readTime: 12,
    category: {
      name: 'Wedding',
      slug: 'wedding',
      color: 'bg-rose-500'
    },
    tags: ['Wedding', 'Bridal Jewelry', 'Guide'],
    views: 2100,
    featured: false,
    slug: 'choosing-perfect-wedding-jewelry-guide'
  },
  {
    id: '4',
    title: 'The History and Symbolism of Pearl Jewelry',
    excerpt: 'Explore the rich history of pearls throughout different cultures and their symbolic meanings across civilizations.',
    content: 'Pearls have been treasured by humanity...',
    image: '/images/pearl/pearl-history.jpg',
    author: {
      name: 'Dr. James Wilson',
      avatar: '/images/authors/james.jpg',
      role: 'Jewelry Historian'
    },
    publishedAt: '2024-12-12T16:45:00Z',
    readTime: 10,
    category: {
      name: 'History',
      slug: 'history',
      color: 'bg-amber-500'
    },
    tags: ['Pearl History', 'Symbolism', 'Culture'],
    views: 675,
    featured: false,
    slug: 'history-symbolism-pearl-jewelry'
  }
]

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatViews = (views: number) => {
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}k`
  }
  return views.toString()
}

interface BlogSectionProps {
  maxPosts?: number
  showFeaturedOnly?: boolean
  className?: string
}

export default function ModernBlogSection({ 
  maxPosts = 4, 
  showFeaturedOnly = false,
  className 
}: BlogSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const loadPosts = async () => {
      setLoading(true)
      // In production, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let filteredPosts = mockBlogPosts
      if (showFeaturedOnly) {
        filteredPosts = mockBlogPosts.filter(post => post.featured)
      }
      
      setPosts(filteredPosts.slice(0, maxPosts))
      setLoading(false)
    }

    loadPosts()
  }, [maxPosts, showFeaturedOnly])

  if (loading) {
    return (
      <section className={cn('py-16 bg-background', className)}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted animate-pulse rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const featuredPost = posts.find(post => post.featured)
  const regularPosts = posts.filter(post => !post.featured).slice(0, 3)

  return (
    <section className={cn('py-16 bg-background', className)}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <div className="w-8 h-[2px] bg-primary"></div>
            <span className="text-sm font-semibold uppercase tracking-wider">Our Blog</span>
            <div className="w-8 h-[2px] bg-primary"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Stories, Tips & Inspiration
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the latest trends, care tips, and stories behind the world of exquisite jewelry
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Featured Post */}
          {featuredPost && (
            <div className="lg:col-span-2">
              <Card className="group h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative h-80 lg:h-96 overflow-hidden">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge className={cn('text-white border-0', featuredPost.category.color)}>
                      <Tag className="w-3 h-3 mr-1" />
                      {featuredPost.category.name}
                    </Badge>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-2xl lg:text-3xl font-bold mb-3 line-clamp-2">
                      {featuredPost.title}
                    </h3>
                    <p className="text-gray-200 mb-4 line-clamp-2">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(featuredPost.publishedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{featuredPost.readTime} min read</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{formatViews(featuredPost.views)} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Regular Posts */}
          <div className="space-y-6">
            {regularPosts.map((post) => (
              <Card key={post.id} className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex gap-4 p-4">
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {post.category.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatViews(post.views)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/blog">
            <Button size="lg" className="group">
              View All Articles
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
