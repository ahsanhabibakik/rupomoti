import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Rupomoti - Premium Jewelry Showroom',
  description: 'Get in touch with Rupomoti for inquiries about our premium jewelry collections, custom designs, or bespoke services. Visit our showroom in Gulshan, Dhaka or contact us online for personalized assistance.',
  keywords: 'contact rupomoti, jewelry showroom dhaka, pearl jewelry inquiries, custom jewelry design bangladesh, jewelry repair services, premium jewelry showroom, dhaka jewelry store, bridal jewelry consultation',
  openGraph: {
    title: 'Contact Us | Rupomoti - Premium Jewelry',
    description: 'Get in touch with Rupomoti for inquiries about our premium jewelry collections, custom designs, or personalized services.',
    type: 'website',
    images: [
      {
        url: '/images/branding/social-share.jpg',
        width: 1200,
        height: 630,
        alt: 'Rupomoti Contact Page'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Rupomoti',
    description: 'Get in touch with our jewelry experts for personalized assistance with your premium jewelry needs.',
    images: ['/images/branding/social-share.jpg'],
  },
  alternates: {
    canonical: 'https://rupomoti.com/contact'
  }
};
