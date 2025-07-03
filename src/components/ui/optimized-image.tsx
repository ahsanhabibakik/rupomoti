'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getCategoryImageWithFallback } from '@/utils/category-utils'

interface OptimizedImageProps {
  src?: string | null
  alt: string
  width?: number
  height?: number
  className?: string
  categoryName?: string
  fallbackSrc?: string
}

export function OptimizedImage({
  src,
  alt,
  width = 40,
  height = 40,
  className = '',
  categoryName = '',
  fallbackSrc = '/images/categories/default.svg'
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(
    getCategoryImageWithFallback(src, categoryName)
  )

  const handleError = () => {
    if (!imageError) {
      setImageError(true)
      setCurrentSrc(fallbackSrc)
    }
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={`object-cover ${className}`}
      onError={handleError}
      loading="lazy"
    />
  )
}
