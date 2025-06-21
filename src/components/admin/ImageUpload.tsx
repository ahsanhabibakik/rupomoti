'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Image as ImageIcon, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  maxFiles?: number
}

export function ImageUpload({ value = [], onChange, maxFiles = 5 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (value.length + acceptedFiles.length > maxFiles) {
        setUploadError(`You can only upload up to ${maxFiles} images`)
        return
      }

      setIsUploading(true)
      setUploadError(null)

      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const data = await response.json();
          return data.url;
        });
        
        const urls = await Promise.all(uploadPromises)
        onChange([...value, ...urls])
      } catch (error) {
        console.error('Error uploading images:', error)
        setUploadError('Failed to upload images')
      } finally {
        setIsUploading(false)
      }
    },
    [value, onChange, maxFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: maxFiles - value.length,
    disabled: isUploading || value.length >= maxFiles
  })

  const removeImage = (index: number) => {
    const newImages = [...value]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          (isUploading || value.length >= maxFiles) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-center">
          {isUploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          ) : (
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {isUploading
              ? 'Uploading images...'
              : value.length >= maxFiles
              ? `Maximum ${maxFiles} images allowed`
              : `Drag & drop images here, or click to select files (${value.length}/${maxFiles})`}
          </p>
        </div>
      </div>

      {uploadError && (
        <p className="text-sm text-destructive">{uploadError}</p>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {value.map((url, index) => (
            <div key={url} className="group relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={url}
                alt={`Uploaded image ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 