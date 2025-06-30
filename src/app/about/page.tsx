import Image from 'next/image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Rupomoti',
  description: 'Learn about Rupomoti - your trusted source for exquisite pearl jewelry',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Rupomoti</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the story behind our passion for pearl jewelry
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src="/images/about.jpg"
              alt="Rupomoti Store"
              className="object-cover w-full h-full"
              width={800}
              height={600}
              priority
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Our Story
            </h2>
            <p className="text-gray-600 mb-4">
              Founded with a passion for exquisite pearl jewelry, Rupomoti has been
              crafting beautiful pieces that capture the timeless elegance of pearls
              since 2010. Our journey began with a simple mission: to bring the
              natural beauty of pearls to jewelry lovers worldwide.
            </p>
            <p className="text-gray-600">
              Today, we continue to uphold our commitment to quality, craftsmanship,
              and customer satisfaction, offering a carefully curated collection of
              pearl jewelry that celebrates both tradition and contemporary design.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Quality Assurance
            </h3>
            <p className="text-gray-600">
              We source only the finest pearls and materials for our jewelry
              collection.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Expert Craftsmanship
            </h3>
            <p className="text-gray-600">
              Each piece is meticulously crafted by skilled artisans with years of
              experience.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Customer Focus
            </h3>
            <p className="text-gray-600">
              We prioritize customer satisfaction and provide exceptional service at
              every step.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Visit Our Store
          </h2>
          <p className="text-gray-600 mb-8">
            Experience the beauty of our pearl jewelry collection in person at our
            store.
          </p>
          <div className="bg-orange-50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Rupomoti Pearl House
            </h3>
            <p className="text-gray-600 mb-4">
              123 Pearl Street, Dhaka 1000, Bangladesh
            </p>
            <p className="text-gray-600 mb-4">
              Phone: +880 1234-567890
            </p>
            <p className="text-gray-600">
              Email: info@rupomoti.com
            </p>
          </div>
        </div>
      </div>
    </main>
  )
} 