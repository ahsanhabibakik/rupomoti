import { Badge } from '@/components/ui/badge'

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Badge className="mb-4">Terms & Conditions</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">
          Terms and Conditions
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Please read these terms and conditions carefully before using our service.
        </p>
      </div>

      <div className="max-w-3xl mx-auto prose prose-gray">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using this website, you accept and agree to be bound by the
            terms and provision of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Product Information</h2>
          <p className="text-muted-foreground">
            We strive to provide accurate product descriptions and images. However,
            we do not warrant that product descriptions or other content is accurate,
            complete, reliable, current, or error-free.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Pricing and Payment</h2>
          <p className="text-muted-foreground">
            All prices are in Bangladeshi Taka (BDT). We reserve the right to modify
            prices without notice. Payment must be made in full before delivery.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Shipping and Delivery</h2>
          <p className="text-muted-foreground">
            Delivery times are estimates only. We are not responsible for any delays
            caused by shipping carriers or customs clearance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Returns and Refunds</h2>
          <p className="text-muted-foreground">
            Products can be returned within 7 days of delivery if they are unused
            and in their original packaging. Refunds will be processed within 14
            business days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Privacy Policy</h2>
          <p className="text-muted-foreground">
            Your privacy is important to us. Please review our Privacy Policy to
            understand how we collect, use, and protect your personal information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
          <p className="text-muted-foreground">
            All content on this website is the property of Rupomoti and is protected
            by copyright laws. Any unauthorized use is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
          <p className="text-muted-foreground">
            If you have any questions about these Terms and Conditions, please contact
            us at support@rupomoti.com.
          </p>
        </section>
      </div>
    </div>
  )
} 