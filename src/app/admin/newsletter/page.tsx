import { Mail } from 'lucide-react'
import NewsletterClient from '@/components/admin/NewsletterClient'

export const metadata = {
  title: 'Newsletter Subscribers',
  description: 'Manage your newsletter subscribers.',
}

export default function NewsletterPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center mb-6">
        <Mail className="h-7 w-7 mr-3 text-primary" />
        <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Here you can view, search, export, and manage your newsletter subscribers.
      </p>
      <NewsletterClient />
    </div>
  )
} 