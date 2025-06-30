"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { motion } from 'framer-motion';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Our Showroom',
    content: (
      <>
        123 Jewelry Avenue, Gemstone Plaza<br />
        Gulshan, Dhaka 1212, Bangladesh
      </>
    ),
  },
  {
    icon: Phone,
    title: 'Phone',
    content: (
      <>
        Sales: +880 1234-567890<br />
        Support: +880 1234-567891
      </>
    ),
  },
  {
    icon: Mail,
    title: 'Email',
    content: (
      <>
        info@rupomoti.com<br />
        support@rupomoti.com
      </>
    ),
  },
  {
    icon: Clock,
    title: 'Business Hours',
    content: (
      <>
        Mon - Fri: 10:00 AM - 8:00 PM<br />
        Saturday: 11:00 AM - 7:00 PM
      </>
    ),
  },
];

const faqItems = [
  {
    question: 'Do I need an appointment to visit?',
    answer: 'Appointments are recommended for a personalized experience, especially for custom design consultations. However, walk-ins are always welcome.',
  },
  {
    question: 'How long does a custom design take?',
    answer: 'A custom jewelry piece typically takes 4-6 weeks from the initial design consultation to the final creation. This timeline can vary based on complexity.',
  },
  {
    question: 'Do you offer jewelry repair services?',
    answer: 'Yes, we provide a full range of jewelry repair services, including ring resizing, stone replacement, and cleaning. Bring your piece for a complimentary evaluation.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept major credit cards, bank transfers, and mobile financial services. We also offer interest-free installment plans for eligible purchases.',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Here you would typically send the data to a backend API
    console.log('Form submitted:', formData);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    showToast.success('Your message has been sent successfully!');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <main className="bg-pearlWhite text-foreground bg-gem-pattern bg-repeat bg-opacity-5">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-24 md:py-32 text-center relative overflow-hidden bg-gradient-to-br from-pearlWhite via-champagneSheen/20 to-warmOysterGold/10"
        style={{ opacity: 1 }} /* Fix for background opacity */
      >
        {/* Decorative elements */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-warmOysterGold/20 rounded-full blur-3xl animate-pearl-shimmer"></div>
        <div className="absolute -right-40 -bottom-40 w-96 h-96 bg-cocoaBrown/10 rounded-full blur-3xl animate-pearl-shimmer" style={{ animationDelay: '1s' }}></div>
        
        <div className="container relative z-10 mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 text-white" 
              style={{ 
               
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem'
              }}>
              Get In Touch
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
              We are here to assist you with any questions about our collections, custom designs, or services. Reach out and let us help you find the perfect piece.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="pb-20 md:pb-32 relative -mt-16 z-10">
        <div className="container max-w-6xl mx-auto px-4">
          <Card className="overflow-hidden shadow-xl border border-warmOysterGold/20 lg:grid lg:grid-cols-12 bg-white dark:bg-cocoaBrown/5 backdrop-blur-sm rounded-2xl">
            <div className="lg:col-span-7 p-6 md:p-8 lg:p-10">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl text-white shadow-md" style={{background: 'linear-gradient(to bottom right, #C8B38A, #4A2E21)'}}>
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-display text-cocoaBrown">Send a Message</CardTitle>
                </div>
                <p className="text-minkTaupe">We&apos;d love to hear from you. Please fill out the form below.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium mb-2 block text-minkTaupe">Full Name</label>
                      <Input 
                        id="name"
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        placeholder="Your full name" 
                        className="h-12 rounded-xl border-warmOysterGold/30 focus:border-warmOysterGold focus:ring-warmOysterGold/50" 
                        required 
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium mb-2 block text-minkTaupe">Email Address</label>
                      <Input 
                        id="email"
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        placeholder="Your email address" 
                        className="h-12 rounded-xl border-warmOysterGold/30 focus:border-warmOysterGold focus:ring-warmOysterGold/50" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="text-sm font-medium mb-2 block text-minkTaupe">Phone Number</label>
                    <Input 
                      id="phone"
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      placeholder="Your phone number (optional)" 
                      className="h-12 rounded-xl border-warmOysterGold/30 focus:border-warmOysterGold focus:ring-warmOysterGold/50" 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="text-sm font-medium mb-2 block text-minkTaupe">Subject</label>
                    <Select name="subject" onValueChange={handleSelectChange} value={formData.subject} required>
                      <SelectTrigger id="subject" className="h-12 rounded-xl border-warmOysterGold/30 focus:border-warmOysterGold focus:ring-warmOysterGold/50">
                        <SelectValue placeholder="Select a Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product-inquiry">Product Inquiry</SelectItem>
                        <SelectItem value="custom-design">Custom Jewelry Design</SelectItem>
                        <SelectItem value="appointment">Schedule Appointment</SelectItem>
                        <SelectItem value="repair">Jewelry Repair</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="text-sm font-medium mb-2 block text-minkTaupe">Your Message</label>
                    <Textarea 
                      id="message"
                      name="message" 
                      value={formData.message} 
                      onChange={handleInputChange} 
                      placeholder="How can we help you today?" 
                      rows={5} 
                      className="rounded-xl border-warmOysterGold/30 focus:border-warmOysterGold focus:ring-warmOysterGold/50" 
                      required 
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 font-medium text-white hover:opacity-80 rounded-xl shadow-md hover:shadow-lg transition-all duration-300" 
                    style={{ 
                      background: 'linear-gradient(to right, #C8B38A, #4A2E21)'
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin mr-2 h-5 w-5 border-2 border-t-transparent text-white border-white rounded-full" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                       <span className="text-white"> Send Message</span>
                        <Send className="ml-2 h-4 w-4 " />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-pearlWhite to-champagneSheen/30 p-6 md:p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-warmOysterGold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-champagneSheen/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-warmOysterGold/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
                  <MapPin className="w-4 h-4 text-cocoaBrown" />
                  <span className="text-xs font-medium text-cocoaBrown">Gulshan, Dhaka</span>
                </div>
                
                <h3 className="text-2xl font-display text-cocoaBrown mb-8">Contact Information</h3>
                
                <div className="space-y-8">
                  {contactInfo.map((info, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-start gap-4 group"
                    >
                      <div className="p-3 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300" style={{background: 'linear-gradient(to bottom right, #C8B38A, #4A2E21)'}}>
                        <info.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-cocoaBrown mb-1">{info.title}</h4>
                        <p className="text-minkTaupe leading-relaxed">{info.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-12 pt-8 border-t border-warmOysterGold/20">
                  <h4 className="font-semibold text-cocoaBrown mb-4">Connect With Us</h4>
                  <div className="flex gap-4">
                    <a href="#" className="p-3 bg-warmOysterGold/10 hover:bg-warmOysterGold/20 rounded-xl transition-colors duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#8C7760" viewBox="0 0 24 24">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                    </a>
                    <a href="#" className="p-3 bg-warmOysterGold/10 hover:bg-warmOysterGold/20 rounded-xl transition-colors duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#8C7760" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                    <a href="#" className="p-3 bg-warmOysterGold/10 hover:bg-warmOysterGold/20 rounded-xl transition-colors duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#8C7760" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Map Section */}
      <section className="pb-20 md:pb-32">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-warmOysterGold/5 via-champagneSheen/10 to-pearlWhite/5 pointer-events-none z-10 rounded-2xl opacity-60"></div>
          <Card className="overflow-hidden shadow-xl border border-warmOysterGold/20 rounded-2xl bg-white/90 backdrop-blur-sm">
            <div className="p-4 bg-gradient-to-r from-warmOysterGold/10 to-champagneSheen/10 border-b border-warmOysterGold/10 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cocoaBrown" />
              <h3 className="font-semibold text-cocoaBrown">Find Us</h3>
            </div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9024424301397!2d90.39178561533467!3d23.779197084584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c74c1a0c2b15%3A0xeea1c1c79e1b4f0!2sGulshan%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1647881234567!5m2!1sen!2sbd"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-[300px] md:h-[450px]"
              title="Rupomoti Jewelry Store Location"
            />
          </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-20 md:pb-32 relative">
        {/* Decorative elements */}
        <div className="absolute top-40 left-0 w-96 h-96 bg-champagneSheen/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-0 w-96 h-96 bg-warmOysterGold/10 rounded-full blur-3xl"></div>
        
        <div className="container max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-2 rounded-full mb-4" style={{ background: 'linear-gradient(to bottom right, #C8B38A, #4A2E21)' }}>
              <div className="bg-pearlWhite rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8B38A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 "
              style={{ 
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                display: 'inline-block'
              }}>
              Frequently Asked Questions
            </h2>
            <p className="text-minkTaupe max-w-2xl mx-auto">
              Find answers to common questions about our jewelry services, showroom visits, and custom designs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {faqItems.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white dark:bg-cocoaBrown/5 border border-warmOysterGold/20 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="p-6 lg:p-8 flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-warmOysterGold/10 rounded-lg text-cocoaBrown shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-cocoaBrown">
                        {faq.question}
                      </h3>
                    </div>
                    <p className="text-minkTaupe leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
} 