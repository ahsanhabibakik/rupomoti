import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Order | Rupomoti - Premium Jewelry',
  description: 'Track your Rupomoti jewelry order status and get real-time updates on your delivery. Enter your order number to check your order details and shipping status with our modern tracking system.',
  keywords: 'order tracking, jewelry order status, Rupomoti order tracking, delivery status, shipment tracking, jewelry delivery, premium jewelry tracking, Bangladesh jewelry delivery',
  openGraph: {
    title: 'Track Your Order | Rupomoti - Premium Jewelry',
    description: 'Track your Rupomoti jewelry order status and get real-time updates on your delivery with our real-time order tracking system.',
    type: 'website',
    images: [
      {
        url: '/images/branding/social-share.jpg',
        width: 1200,
        height: 630,
        alt: 'Rupomoti Order Tracking'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Track Your Order | Rupomoti',
    description: 'Track your Rupomoti jewelry order status and get real-time updates on your delivery.',
    images: ['/images/branding/social-share.jpg'],
  }
};
