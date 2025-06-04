'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Instagram, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'

const socialLinks = {
  instagram: 'https://instagram.com/rupomoti',
  facebook: 'https://facebook.com/rupomoti'
}

const instagramPosts = [
  {
    id: 1,
    image: '/images/social/insta1.jpg',
    likes: 245,
    comments: 12
  },
  {
    id: 2,
    image: '/images/social/insta2.jpg',
    likes: 189,
    comments: 8
  },
  {
    id: 3,
    image: '/images/social/insta3.jpg',
    likes: 321,
    comments: 15
  },
  {
    id: 4,
    image: '/images/social/insta4.jpg',
    likes: 178,
    comments: 6
  }
]

export function SocialFeed() {
  return (
    <section className="py-12 px-4 md:px-6 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Follow Our Journey
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join our community on Instagram and Facebook to stay updated with our latest collections and stories
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <Instagram className="w-4 h-4" />
                @rupomoti
              </Button>
            </Link>
            <Link href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <Facebook className="w-4 h-4" />
                @rupomoti
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {instagramPosts.map((post) => (
            <Link
              key={post.id}
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl"
            >
              <Image
                src={post.image}
                alt={`Instagram post ${post.id}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 flex items-center justify-center text-white gap-4">
                  <div className="flex items-center gap-1">
                    <span>❤️</span>
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💬</span>
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
            <Button>
              View More on Instagram
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 