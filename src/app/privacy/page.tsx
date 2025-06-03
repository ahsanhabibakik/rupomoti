import { Badge } from '@/components/ui/badge'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Badge className="mb-4">Privacy Policy</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your privacy is important to us. This Privacy Policy explains how we collect,
          use, and protect your personal information.
        </p>
      </div>

      <div className="max-w-3xl mx-auto prose prose-gray">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 mt-2 text-muted-foreground">
            <li>Name and contact information</li>
            <li>Billing and shipping addresses</li>
            <li>Payment information</li>
            <li>Order history</li>
            <li>Communication preferences</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="text-muted-foreground">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mt-2 text-muted-foreground">
            <li>Process your orders and payments</li>
            <li>Communicate with you about your orders</li>
            <li>Send you marketing communications (with your consent)</li>
            <li>Improve our products and services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
          <p className="text-muted-foreground">
            We do not sell or rent your personal information to third parties. We may
            share your information with:
          </p>
          <ul className="list-disc pl-6 mt-2 text-muted-foreground">
            <li>Service providers who assist in our operations</li>
            <li>Payment processors</li>
            <li>Shipping partners</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="text-muted-foreground">
            We implement appropriate security measures to protect your personal
            information from unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <p className="text-muted-foreground">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mt-2 text-muted-foreground">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
          <p className="text-muted-foreground">
            We use cookies and similar technologies to enhance your browsing experience
            and analyze website traffic. You can control cookie preferences through
            your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Changes to Privacy Policy</h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy from time to time. We will notify you
            of any changes by posting the new Privacy Policy on this page.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact us at
            privacy@rupomoti.com.
          </p>
        </section>
      </div>
    </div>
  )
} 