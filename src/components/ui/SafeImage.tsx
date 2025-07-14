'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string
  showErrorPlaceholder?: boolean
  className?: string
}

export function SafeImage({ 
  src, 
  fallbackSrc = '/placeholder.png', 
  showErrorPlaceholder = true,
  className,
  alt,
  ...props 
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setCurrentSrc(fallbackSrc)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  if (hasError && !showErrorPlaceholder) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400 text-xs",
          className
        )}
      >
        Image not available
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-8 h-8 border-2 border-warm-oyster-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <Image
        {...props}
        src={currentSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
      />
    </div>
  )
}
