import { ImageResponse } from 'next/og'
import productsData from '@/data/products.json'

export const runtime = 'edge'

export const alt = 'Product Image'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
  const product = productsData.products.find(p => p.id === params.id)

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {product?.name || 'Product Not Found'}
      </div>
    )
  )
} 