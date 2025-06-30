import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping & Returns | Rupomoti Jewelry',
  description: 'Learn about our shipping policies, delivery times, and hassle-free returns process.',
}

const shippingSections = [
  {
    title: 'Shipping Information',
    content: [
      'We offer multiple shipping options to ensure your jewelry arrives safely and on time:',
      [
        'Standard Shipping (3-5 business days)',
        'Express Shipping (1-2 business days)',
        'Same Day Delivery (within Dhaka city, orders placed before 2 PM)',
      ],
      'All orders are processed within 24 hours of placement. You will receive a confirmation email with tracking information once your order ships.',
    ],
  },
  {
    title: 'Shipping Rates',
    content: [
      'Our shipping rates are calculated based on your location and the selected shipping method:',
      [
        'Within Dhaka: Free standard shipping on orders above ৳10,000',
        'Outside Dhaka: Starting from ৳150',
        'International: Calculated at checkout based on destination',
      ],
      'For exact shipping rates, please add items to your cart and proceed to checkout.',
    ],
  },
  {
    title: 'International Shipping',
    content: [
      'We ship to most countries worldwide. International orders are subject to:',
      [
        'Customs duties and taxes (varies by country)',
        'Longer delivery times (7-14 business days)',
        'Additional shipping charges',
      ],
      'Please note that international customers are responsible for any customs fees or import duties that may apply.',
    ],
  },
  {
    title: 'Order Tracking',
    content: [
      'Track your order status through:',
      [
        'Your account dashboard (if you have an account)',
        'The tracking link in your shipping confirmation email',
        'Our customer service team',
      ],
      'For any shipping-related inquiries, please contact our customer service team.',
    ],
  },
]

const returnsSections = [
  {
    title: 'Return Policy',
    content: [
      'We want you to be completely satisfied with your purchase. Our return policy includes:',
      [
        '30-day return window for non-custom items',
        'Items must be in original condition with all packaging and tags',
        'Custom pieces and items marked as final sale are not eligible for returns',
        'Returns must be initiated within 30 days of delivery',
      ],
    ],
  },
  {
    title: 'How to Return',
    content: [
      'To initiate a return:',
      [
        'Contact our customer service team or visit our showroom',
        'Provide your order number and reason for return',
        'Pack the item securely with all original packaging and documentation',
        'Include the return form (provided with your order)',
      ],
      'Once we receive and inspect your return, we will process your refund within 7-10 business days.',
    ],
  },
  {
    title: 'Refund Process',
    content: [
      'Refunds will be processed:',
      [
        'Using the original payment method',
        'Within 7-10 business days of receiving the returned item',
        'Minus any shipping charges (unless the return is due to our error)',
      ],
      'You will receive an email confirmation once your refund is processed.',
    ],
  },
  {
    title: 'Damaged or Defective Items',
    content: [
      'If you receive a damaged or defective item:',
      [
        'Contact us immediately (within 48 hours of delivery)',
        'Provide photos of the damage or defect',
        'Keep all original packaging and documentation',
      ],
      'We will arrange for a replacement or refund at no additional cost to you.',
    ],
  },
]

export default function ShippingReturnsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[20vh] bg-pearl-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 to-charcoal/60" />
        <div className="container relative h-full flex items-center">
          <div className="mx-auto max-w-2xl text-pearl">
            <h1 className="font-display text-5xl md:text-6xl mb-4">
              Shipping & Returns
            </h1>
            <p className="text-lg md:text-xl text-pearl-light">
              Fast, reliable shipping and hassle-free returns
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Information */}
      <section className="py-20 bg-pearl">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl mb-12 text-charcoal text-center">
              Shipping Information
            </h2>
            <div className="space-y-12">
              {shippingSections.map((section, index) => (
                <div key={index} className="card">
                  <h3 className="font-display text-2xl mb-6 text-charcoal">
                    {section.title}
                  </h3>
                  <div className="space-y-4 text-slate">
                    {section.content.map((paragraph, pIndex) => (
                      Array.isArray(paragraph) ? (
                        <ul key={pIndex} className="list-disc list-inside space-y-2 ml-4">
                          {paragraph.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p key={pIndex}>{paragraph}</p>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Returns Information */}
      <section className="py-20 bg-gradient-pearl">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl mb-12 text-charcoal text-center">
              Returns & Refunds
            </h2>
            <div className="space-y-12">
              {returnsSections.map((section, index) => (
                <div key={index} className="card">
                  <h3 className="font-display text-2xl mb-6 text-charcoal">
                    {section.title}
                  </h3>
                  <div className="space-y-4 text-slate">
                    {section.content.map((paragraph, pIndex) => (
                      Array.isArray(paragraph) ? (
                        <ul key={pIndex} className="list-disc list-inside space-y-2 ml-4">
                          {paragraph.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p key={pIndex}>{paragraph}</p>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-pearl">
        <div className="container text-center">
          <h2 className="font-display text-4xl mb-6 text-charcoal">
            Need Help with Your Order?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-slate">
            Our customer service team is here to assist you with any shipping or 
            returns questions.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/contact" className="btn-primary">
              Contact Us
            </a>
            <a href="/faq" className="btn-outline">
              View FAQ
            </a>
          </div>
        </div>
      </section>
    </main>
  )
} 