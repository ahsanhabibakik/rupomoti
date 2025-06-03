'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log(formData)
    alert('Thank you for your message. We will get back to you soon!')
    setFormData({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <Badge className="mb-4">Contact Us</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">
          Get in Touch
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Have a question or need assistance? We're here to help.
          Reach out to us and we'll get back to you as soon as possible.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* Contact Information */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Visit Us</h3>
                <p className="text-muted-foreground">
                  123 Jewelry Street<br />
                  Dhaka, Bangladesh
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Call Us</h3>
                <p className="text-muted-foreground">
                  +880 1234-567890<br />
                  +880 1234-567891
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Email Us</h3>
                <p className="text-muted-foreground">
                  info@rupomoti.com<br />
                  support@rupomoti.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Business Hours</h3>
                <p className="text-muted-foreground">
                  Monday - Saturday: 10:00 AM - 8:00 PM<br />
                  Friday: 2:00 PM - 8:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card p-6 rounded-xl">
          <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone
              </label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Your phone number"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we help you?"
                rows={4}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 