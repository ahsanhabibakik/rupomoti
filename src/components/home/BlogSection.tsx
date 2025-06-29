'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, ArrowRight, BookOpen, User } from 'lucide-react'
import { SectionHeader } from './SectionHeader'

const blogPosts = [
  {
    id: 1,
    title: "The Ultimate Guide to Pearl Care",
    excerpt: "Learn how to maintain the luster and beauty of your precious pearls with our comprehensive care guide.",
    image: "/images/blog/pearl-care.jpg",
    category: "Care Guide",
    readTime: "5 min read",
    date: "Dec 15, 2024",
    author: "Sarah Johnson",
    slug: "ultimate-guide-pearl-care"
  },
  {
    id: 2,
    title: "Trending Jewelry Styles for 2025",
    excerpt: "Discover the hottest jewelry trends that will dominate the fashion world in the coming year.",
    image: "/images/blog/trends-2025.jpg",
    category: "Trends",
    readTime: "7 min read",
    date: "Dec 12, 2024",
    author: "Emma Wilson",
    slug: "trending-jewelry-styles-2025"
  },
  {
    id: 3,
    title: "Choosing the Perfect Engagement Ring",
    excerpt: "A complete guide to selecting the engagement ring that will make your proposal unforgettable.",
    image: "/images/blog/engagement-ring.jpg",
    category: "Bridal",
    readTime: "10 min read",
    date: "Dec 10, 2024",
    author: "Michael Chen",
    slug: "choosing-perfect-engagement-ring"
  }
]

export function BlogSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon="bookOpen"
          badge="Expert Insights"
          title="Jewelry Stories & Guides"
          subtitle="Discover expert tips, trends, and stories from the world of fine jewelry"
          badgeColor="from-blue-500 to-purple-500"
          iconColor="text-blue-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-800 border-0">
                      {post.category}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1 group/link"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View All Blog Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Button asChild size="lg" variant="outline" className="border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-8 py-4 rounded-full">
            <Link href="/blog" className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              View All Articles
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
