'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductImageGalleryProps {
  images: { url: string; id: string }[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square relative bg-gray-100 rounded-lg flex items-center justify-center">
        <Image src="/placeholder.svg" alt="No image available" width={300} height={300} className="opacity-50" />
      </div>
    )
  }

  const nextImage = () => setSelectedImage(prev => (prev + 1) % images.length)
  const prevImage = () => setSelectedImage(prev => (prev - 1 + images.length) % images.length)

  return (
    <div className="relative">
      <div className="aspect-square relative rounded-lg overflow-hidden">
        <Image
          src={images[selectedImage].url}
          alt={`${productName} - Image ${selectedImage + 1}`}
          fill
          className="object-cover"
          priority={true}
        />
      </div>

      {images.length > 1 && (
        <>
          <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-all">
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-primary' : 'border-transparent'}`}
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={image.url}
              alt={`Thumbnail of ${productName} ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
} 