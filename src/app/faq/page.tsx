import { Metadata } from 'next'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Rupomoti Jewelry',
  description: 'Find answers to common questions about our jewelry, services, and policies at Rupomoti Jewelry.',
}

const faqCategories = [
  {
    title: 'Shopping & Orders',
    questions: [
      {
        question: 'How do I place an order?',
        answer: 'You can place an order through our website by selecting your desired items, adding them to your cart, and proceeding to checkout. For custom pieces, please visit our showroom or contact us to schedule a consultation.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express), bank transfers, and cash payments. We also offer flexible payment plans for select items. All online payments are processed securely through our payment gateway.',
      },
      {
        question: 'Do you offer international shipping?',
        answer: 'Yes, we offer international shipping to select countries. Shipping costs and delivery times vary by location. Please contact us for specific shipping rates to your country.',
      },
      {
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for all non-custom items in their original condition. Custom pieces and items marked as final sale are not eligible for returns. Please visit our showroom or contact us to initiate a return.',
      },
    ],
  },
  {
    title: 'Custom Design & Services',
    questions: [
      {
        question: 'How does the custom design process work?',
        answer: 'Our custom design process begins with a consultation where we discuss your vision, preferences, and budget. Our designers will create sketches and 3D renderings for your approval. Once approved, our master craftsmen will bring your design to life. The entire process typically takes 4-6 weeks.',
      },
      {
        question: 'Do you offer jewelry repair services?',
        answer: 'Yes, we offer comprehensive jewelry repair services including resizing, stone replacement, polishing, and restoration. Please bring your piece to our showroom for an assessment and quote.',
      },
      {
        question: 'Can I bring in my own stones for custom jewelry?',
        answer: 'Yes, we can incorporate your existing stones into new designs. We\'ll assess the stones to ensure they\'re suitable for the design and provide recommendations for the best way to showcase them.',
      },
      {
        question: 'Do you offer engraving services?',
        answer: 'Yes, we offer hand engraving and laser engraving services. Hand engraving is available for select pieces and adds a unique, personal touch. Laser engraving is available for most items and offers precise, detailed results.',
      },
    ],
  },
  {
    title: 'Product Care & Maintenance',
    questions: [
      {
        question: 'How should I care for my jewelry?',
        answer: 'Store your jewelry in a cool, dry place away from direct sunlight. Clean your pieces regularly with a soft cloth and mild soap solution. Avoid exposing jewelry to harsh chemicals, perfumes, and extreme temperatures. For specific care instructions, please refer to the care card provided with your purchase.',
      },
      {
        question: 'How often should I have my jewelry cleaned?',
        answer: 'We recommend having your jewelry professionally cleaned every 6-12 months to maintain its brilliance and ensure the settings remain secure. We offer complimentary cleaning services for all our pieces.',
      },
      {
        question: 'What should I do if my jewelry gets damaged?',
        answer: 'If your jewelry gets damaged, please bring it to our showroom as soon as possible. Our experts will assess the damage and recommend the best course of action. Most repairs can be completed within 1-2 weeks.',
      },
      {
        question: 'How can I tell if my jewelry needs maintenance?',
        answer: 'Signs that your jewelry may need maintenance include loose stones, scratches, tarnishing, or if it no longer sits properly. If you notice any of these issues, please bring your piece to our showroom for an assessment.',
      },
    ],
  },
  {
    title: 'Quality & Materials',
    questions: [
      {
        question: 'What materials do you use in your jewelry?',
        answer: 'We use only the finest materials including 18k gold, platinum, and high-quality gemstones. All our diamonds are certified and conflict-free. We source our materials from reputable suppliers who adhere to ethical and sustainable practices.',
      },
      {
        question: 'Do you offer certified diamonds?',
        answer: 'Yes, all our diamonds come with certification from reputable gemological laboratories such as GIA, IGI, or AGS. The certification includes detailed information about the diamond\'s cut, color, clarity, and carat weight.',
      },
      {
        question: 'What is your policy on conflict-free materials?',
        answer: 'We are committed to using only conflict-free materials. All our diamonds and precious metals are sourced from suppliers who adhere to the Kimberley Process and other ethical sourcing standards.',
      },
      {
        question: 'Do you offer lifetime warranty?',
        answer: 'Yes, we offer a lifetime warranty on all our pieces against manufacturing defects. This covers issues with settings, clasps, and other structural elements. The warranty does not cover normal wear and tear or damage from accidents.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-pearl-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 to-charcoal/60" />
        <div className="container relative h-full flex items-center">
          <div className="max-w-2xl text-pearl">
            <h1 className="font-display text-5xl md:text-6xl mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl text-pearl-light">
              Find answers to common questions about our jewelry and services
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 bg-pearl">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="card">
                <h2 className="font-display text-3xl mb-8 text-charcoal">
                  {category.title}
                </h2>
                <div className="space-y-6">
                  {category.questions.map((faq, faqIndex) => (
                    <div
                      key={faqIndex}
                      className="border-b border-gold/20 last:border-0 pb-6 last:pb-0"
                    >
                      <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer list-none">
                          <h3 className="font-display text-xl text-charcoal group-hover:text-gold transition-colors duration-200">
                            {faq.question}
                          </h3>
                          <ChevronDownIcon className="w-6 h-6 text-gold transform group-open:rotate-180 transition-transform duration-200" />
                        </summary>
                        <div className="mt-4 text-slate">
                          {faq.answer}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-pearl">
        <div className="container text-center">
          <h2 className="font-display text-4xl mb-6 text-charcoal">
            Still Have Questions?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-slate">
            Our team is here to help. Contact us for personalized assistance with 
            your jewelry needs.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/contact" className="btn-primary">
              Contact Us
            </a>
            <a href="/shop" className="btn-outline">
              Browse Collection
            </a>
          </div>
        </div>
      </section>
    </main>
  )
} 