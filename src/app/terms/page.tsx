import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Rupomoti Jewelry',
  description: 'Read our terms of service and policies for using Rupomoti Jewelry\'s website and services.',
}

const termsSections = [
  {
    title: '1. Acceptance of Terms',
    content: [
      'By accessing and using the Rupomoti Jewelry website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.',
      'We reserve the right to modify these terms at any time. Your continued use of the website following any changes indicates your acceptance of the modified terms.',
    ],
  },
  {
    title: '2. Use License',
    content: [
      'Permission is granted to temporarily access the materials (information or software) on Rupomoti Jewelry\'s website for personal, non-commercial transitory viewing only.',
      'This is the grant of a license, not a transfer of title, and under this license you may not:',
      [
        'Modify or copy the materials',
        'Use the materials for any commercial purpose or for any public display',
        'Attempt to decompile or reverse engineer any software contained on the website',
        'Remove any copyright or other proprietary notations from the materials',
        'Transfer the materials to another person or "mirror" the materials on any other server',
      ],
      'This license shall automatically terminate if you violate any of these restrictions and may be terminated by Rupomoti Jewelry at any time.',
    ],
  },
  {
    title: '3. Product Information',
    content: [
      'We strive to display our products as accurately as possible. However, we cannot guarantee that your computer monitor\'s display of any color will be accurate.',
      'We reserve the right to discontinue any product at any time. Any offer for any product or service made on this site is void where prohibited.',
      'We do not warrant that the quality of any products, services, information, or other material purchased or obtained by you will meet your expectations.',
    ],
  },
  {
    title: '4. Pricing and Payment',
    content: [
      'All prices are in Bangladeshi Taka (BDT) unless otherwise stated. Prices are subject to change without notice.',
      'We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order.',
      'Payment is due at the time of order. We accept various payment methods as indicated during checkout. All payments must be made in full before the order is processed.',
    ],
  },
  {
    title: '5. Shipping and Delivery',
    content: [
      'Shipping times may vary depending on the product and delivery location. We will provide estimated delivery times during checkout.',
      'We are not responsible for any delays in delivery due to circumstances beyond our control.',
      'Risk of loss and title for items purchased pass to you upon delivery of the items to the carrier.',
    ],
  },
  {
    title: '6. Returns and Refunds',
    content: [
      'We offer a 30-day return policy for all non-custom items in their original condition. Custom pieces and items marked as final sale are not eligible for returns.',
      'To initiate a return, please contact our customer service team or visit our showroom. Returns must be accompanied by the original receipt and packaging.',
      'Refunds will be processed using the original payment method within 7-10 business days of receiving the returned item.',
    ],
  },
  {
    title: '7. Privacy Policy',
    content: [
      'Your use of our website is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices.',
      'By using our website, you consent to our Privacy Policy and agree to its terms.',
    ],
  },
  {
    title: '8. Intellectual Property',
    content: [
      'All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of Rupomoti Jewelry or its content suppliers and protected by international copyright laws.',
      'The compilation of all content on this site is the exclusive property of Rupomoti Jewelry and protected by international copyright laws.',
    ],
  },
  {
    title: '9. Limitation of Liability',
    content: [
      'In no event shall Rupomoti Jewelry or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.',
      'Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.',
    ],
  },
  {
    title: '10. Governing Law',
    content: [
      'These terms and conditions are governed by and construed in accordance with the laws of Bangladesh and you irrevocably submit to the exclusive jurisdiction of the courts in that location.',
    ],
  },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[20vh] bg-pearl-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 to-charcoal/60" />
        <div className="container relative h-full flex items-center">
          <div className="mx-auto max-w-2xl text-pearl">
            <h1 className="font-display text-5xl md:text-6xl mb-4">
              Terms of Service
            </h1>
            <p className="text-lg md:text-xl text-pearl-light">
              Last updated: March 15, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 bg-pearl">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-12">
            {termsSections.map((section, index) => (
              <div key={index} className="card">
                <h2 className="font-display text-2xl mb-6 text-charcoal">
                  {section.title}
                </h2>
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
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-pearl">
        <div className="container text-center">
          <h2 className="font-display text-4xl mb-6 text-charcoal">
            Questions About Our Terms?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-slate">
            If you have any questions about our terms of service, please don&apos;t 
            hesitate to contact our legal team.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/contact" className="btn-primary">
              Contact Us
            </a>
            <a href="/privacy" className="btn-outline">
              Privacy Policy
            </a>
          </div>
        </div>
      </section>
    </main>
  )
} 