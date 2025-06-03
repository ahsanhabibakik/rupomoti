import { Badge } from '@/components/ui/badge'
import { Heart, Award, Shield, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge className="mb-4">About Us</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">
          Crafting Timeless Beauty Since 2020
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Rupomoti is Bangladesh&apos;s premier destination for exquisite pearl jewelry.
          We combine traditional craftsmanship with modern design to create pieces that
          tell your unique story.
        </p>
      </div>

      {/* Values Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          {
            icon: Heart,
            title: 'Passion for Quality',
            description: 'Every piece is crafted with meticulous attention to detail and the finest materials.'
          },
          {
            icon: Award,
            title: 'Expert Craftsmanship',
            description: 'Our artisans bring years of experience and skill to create each unique piece.'
          },
          {
            icon: Shield,
            title: 'Lifetime Warranty',
            description: 'We stand behind our quality with a comprehensive lifetime warranty.'
          },
          {
            icon: Users,
            title: 'Customer First',
            description: 'Your satisfaction is our priority, with personalized service at every step.'
          }
        ].map((item) => (
          <div key={item.title} className="text-center p-6 rounded-2xl bg-card">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <item.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-muted-foreground text-sm">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Story Section */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-2xl font-bold mb-6">Our Story</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Founded in 2020, Rupomoti began with a simple vision: to make high-quality
            pearl jewelry accessible to everyone in Bangladesh. What started as a small
            family business has grown into one of the country&apos;s most trusted jewelry brands.
          </p>
          <p>
            We take pride in our commitment to quality, authenticity, and customer
            satisfaction. Each piece in our collection is carefully selected and
            crafted to ensure it meets our high standards.
          </p>
          <p>
            Today, we continue to grow and innovate, while staying true to our core
            values of excellence, integrity, and exceptional service.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { number: '3+', label: 'Years of Excellence' },
          { number: '5000+', label: 'Happy Customers' },
          { number: '1000+', label: 'Unique Designs' },
          { number: '100%', label: 'Authentic Products' }
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
            <div className="text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
} 