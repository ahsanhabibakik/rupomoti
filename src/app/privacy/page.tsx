import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Rupomoti Jewelry',
  description: 'Learn how Rupomoti Jewelry collects, uses, and protects your personal information.',
}

const privacySections = [
  {
    title: '1. Information We Collect',
    content: [
      'We collect information that you provide directly to us, including:',
      [
        'Name and contact information (email address, phone number, shipping address)',
        'Payment information (credit card details, billing address)',
        'Order history and preferences',
        'Communications with us (customer service inquiries, feedback)',
        'Account information (if you create an account with us)',
      ],
      'We also automatically collect certain information when you visit our website, such as:',
      [
        'Device information (IP address, browser type, operating system)',
        'Usage data (pages visited, time spent, links clicked)',
        'Location information (if permitted by your device settings)',
      ],
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      'We use the information we collect to:',
      [
        'Process and fulfill your orders',
        'Communicate with you about your orders and our services',
        'Send you marketing communications (with your consent)',
        'Improve our website and services',
        'Prevent fraud and enhance security',
        'Comply with legal obligations',
      ],
    ],
  },
  {
    title: '3. Information Sharing',
    content: [
      'We may share your information with:',
      [
        'Service providers who assist in our operations (payment processors, shipping partners)',
        'Professional advisors (lawyers, accountants)',
        'Law enforcement when required by law',
      ],
      'We do not sell your personal information to third parties.',
    ],
  },
  {
    title: '4. Your Rights',
    content: [
      'You have the right to:',
      [
        'Access your personal information',
        'Correct inaccurate information',
        'Request deletion of your information',
        'Opt-out of marketing communications',
        'Withdraw consent for data processing',
      ],
      'To exercise these rights, please contact us using the information provided below.',
    ],
  },
  {
    title: '5. Data Security',
    content: [
      'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
      'However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.',
    ],
  },
  {
    title: '6. Cookies and Tracking',
    content: [
      'We use cookies and similar tracking technologies to:',
      [
        'Remember your preferences',
        'Understand how you use our website',
        'Improve your shopping experience',
        'Show you relevant advertisements',
      ],
      'You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our website.',
    ],
  },
  {
    title: '7. Children\'s Privacy',
    content: [
      'Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.',
      'If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.',
    ],
  },
  {
    title: '8. International Transfers',
    content: [
      'Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws.',
      'We ensure appropriate safeguards are in place to protect your information when transferred internationally.',
    ],
  },
  {
    title: '9. Changes to This Policy',
    content: [
      'We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.',
      'We encourage you to review this policy periodically for any changes.',
    ],
  },
  {
    title: '10. Contact Us',
    content: [
      'If you have any questions about this privacy policy or our data practices, please contact us at:',
      [
        'Email: privacy@rupomoti.com',
        'Phone: +880 1234-567890',
        'Address: 123 Jewelry Street, Dhaka, Bangladesh',
      ],
    ],
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-pearl-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 to-charcoal/60" />
        <div className="container relative h-full flex items-center">
          <div className="max-w-2xl text-pearl">
            <h1 className="font-display text-5xl md:text-6xl mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg md:text-xl text-pearl-light">
              Last updated: March 15, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20 bg-pearl">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-12">
            {privacySections.map((section, index) => (
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
            Have Privacy Concerns?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-slate">
            Our privacy team is here to help. Contact us with any questions about 
            how we handle your personal information.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/contact" className="btn-primary">
              Contact Us
            </a>
            <a href="/terms" className="btn-outline">
              Terms of Service
            </a>
          </div>
        </div>
      </section>
    </main>
  )
} 