import dbConnect from '@/lib/dbConnect';

export default async function AdminTestPage() {
  // Get some test products for the landing page builder
  const products = await prisma.product.findMany({
    take: 10,
    select: {
      id: true,
      name: true,
      slug: true,
      useCustomLandingPage: true,
      landingPagePublished: true
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Test - Landing Page Builder</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Available Products for Landing Page Builder</h2>
        
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-600">ID: {product.id}</p>
                  <p className="text-sm text-gray-600">Slug: {product.slug}</p>
                  <p className="text-sm text-gray-600">
                    Landing Page: {product.useCustomLandingPage ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Published: {product.landingPagePublished ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href={`/admin/products/${product.id}/landing-page-builder`}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
                  >
                    Open Landing Page Builder
                  </a>
                  <a
                    href={`/product/${product.slug}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    target="_blank"
                  >
                    View Product Page
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
