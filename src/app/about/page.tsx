import Image from 'next/image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Rupomoti Jewelry',
  description: 'Discover the story behind Rupomoti Jewelry - where tradition meets contemporary elegance in every piece.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-pearl-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 to-charcoal/60" />
        <div className="container relative h-full flex items-center">
          <div className="max-w-2xl text-pearl">
            <h1 className="font-display text-5xl md:text-6xl mb-4">
              Our Story
            </h1>
            <p className="text-lg md:text-xl text-pearl-light">
              Crafting timeless elegance since 1995
            </p>
          </div>
        </div>
      </section>

      {/* Our Heritage */}
      <section className="py-20 bg-pearl">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src="/images/about/heritage.jpg"
                alt="Our Heritage"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <h2 className="font-display text-4xl mb-6 text-charcoal">
                A Legacy of Excellence
              </h2>
              <p className="text-slate mb-6">
                Founded in 1995, Rupomoti Jewelry has been at the forefront of 
                crafting exquisite jewelry that celebrates both traditional 
                craftsmanship and contemporary design. Our journey began with a 
                simple yet profound vision: to create pieces that tell stories 
                and become cherished heirlooms.
              </p>
              <p className="text-slate">
                Each piece in our collection is a testament to our commitment to 
                quality, innovation, and the timeless beauty of fine jewelry. We 
                source the finest materials and work with master artisans who 
                bring decades of experience to every creation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gradient-pearl">
        <div className="container">
          <h2 className="font-display text-4xl text-center mb-16 text-charcoal">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-4 text-charcoal">
                Quality
              </h3>
              <p className="text-slate">
                We never compromise on the quality of our materials or craftsmanship, 
                ensuring each piece meets our exacting standards.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-4 text-charcoal">
                Sustainability
              </h3>
              <p className="text-slate">
                We are committed to ethical sourcing and sustainable practices, 
                ensuring our jewelry is as beautiful for the planet as it is for you.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-display text-xl mb-4 text-charcoal">
                Innovation
              </h3>
              <p className="text-slate">
                We blend traditional techniques with modern design, creating pieces 
                that are both timeless and contemporary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 bg-pearl">
        <div className="container">
          <h2 className="font-display text-4xl text-center mb-16 text-charcoal">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                name: 'Sarah Ahmed',
                role: 'Creative Director',
                image: '/images/team/sarah.jpg',
              },
              {
                name: 'Mohammed Rahman',
                role: 'Master Craftsman',
                image: '/images/team/mohammed.jpg',
              },
              {
                name: 'Fatima Khan',
                role: 'Design Lead',
                image: '/images/team/fatima.jpg',
              },
              {
                name: 'Aminul Islam',
                role: 'Quality Control',
                image: '/images/team/aminul.jpg',
              },
            ].map((member, index) => (
              <div key={index} className="card text-center">
                <div className="relative aspect-square rounded-full overflow-hidden mb-6">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <h3 className="font-display text-xl mb-2 text-charcoal">
                  {member.name}
                </h3>
                <p className="text-slate">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-gold text-pearl">
        <div className="container text-center">
          <h2 className="font-display text-4xl mb-6">
            Experience Our Craft
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Visit our showroom to explore our collection in person and discover 
            the perfect piece that speaks to your story.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/contact" className="btn-outline">
              Contact Us
            </a>
            <a href="/shop" className="btn-accent">
              Explore Collection
            </a>
          </div>
        </div>
      </section>
    </main>
  )
} 