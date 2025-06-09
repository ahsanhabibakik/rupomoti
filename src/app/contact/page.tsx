import { Metadata } from 'next'
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Contact Us | Rupomoti Jewelry',
  description: 'Get in touch with Rupomoti Jewelry. Visit our showroom, schedule an appointment, or reach out to our team.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-pearl-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 to-charcoal/60" />
        <div className="container relative h-full flex items-center">
          <div className="max-w-2xl text-pearl">
            <h1 className="font-display text-5xl md:text-6xl mb-4">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-pearl-light">
              We'd love to hear from you
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-pearl">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card">
              <h2 className="font-display text-3xl mb-6 text-charcoal">
                Send Us a Message
              </h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="input w-full"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="input w-full"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="input w-full"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="label">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="input w-full"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="appointment">Schedule an Appointment</option>
                    <option value="custom">Custom Design Inquiry</option>
                    <option value="repair">Jewelry Repair</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="label">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="input w-full"
                    placeholder="Tell us how we can help"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="card">
                <h2 className="font-display text-3xl mb-6 text-charcoal">
                  Visit Our Showroom
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPinIcon className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-display text-lg text-charcoal mb-1">
                        Address
                      </h3>
                      <p className="text-slate">
                        123 Jewelry Lane<br />
                        Gulshan, Dhaka 1212<br />
                        Bangladesh
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <PhoneIcon className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-display text-lg text-charcoal mb-1">
                        Phone
                      </h3>
                      <p className="text-slate">
                        +880 1234-567890<br />
                        +880 1234-567891
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <EnvelopeIcon className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-display text-lg text-charcoal mb-1">
                        Email
                      </h3>
                      <p className="text-slate">
                        info@rupomoti.com<br />
                        support@rupomoti.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <ClockIcon className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-display text-lg text-charcoal mb-1">
                        Hours
                      </h3>
                      <p className="text-slate">
                        Monday - Friday: 10:00 AM - 8:00 PM<br />
                        Saturday: 10:00 AM - 6:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="card p-0 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9024424301397!2d90.39178561533467!3d23.779197084584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c74c1a0c2b15%3A0xeea1c1c79e1b4f0!2sGulshan%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1647881234567!5m2!1sen!2sbd"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-[300px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-pearl">
        <div className="container">
          <h2 className="font-display text-4xl text-center mb-16 text-charcoal">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: 'Do I need an appointment to visit the showroom?',
                answer: 'While walk-ins are welcome, we recommend scheduling an appointment to ensure personalized attention and to discuss your specific needs.',
              },
              {
                question: 'How long does custom jewelry design take?',
                answer: 'Custom jewelry design typically takes 4-6 weeks from initial consultation to final delivery, depending on the complexity of the design.',
              },
              {
                question: 'Do you offer jewelry repair services?',
                answer: 'Yes, we offer comprehensive jewelry repair services. Please bring your piece to our showroom for an assessment.',
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards, bank transfers, and cash payments. We also offer flexible payment plans for select items.',
              },
            ].map((faq, index) => (
              <div key={index} className="card">
                <h3 className="font-display text-xl mb-3 text-charcoal">
                  {faq.question}
                </h3>
                <p className="text-slate">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
} 