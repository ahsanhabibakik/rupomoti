'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { showToast } from '@/lib/toast'

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  maxFiles?: number
}

export function ImageUpload({ value, onChange, maxFiles = 1 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = async (acceptedFiles: File[]) => {
    if (value.length + acceptedFiles.length > maxFiles) {
      showToast.error(`You can only upload a maximum of ${maxFiles} files.`)
      return
    }

    setIsUploading(true)

    const uploadedUrls: string[] = []
    for (const file of acceptedFiles) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        uploadedUrls.push(data.url)
      } catch (error) {
        showToast.error('An error occurred during upload.')
        console.error(error)
      }
    }

    if (uploadedUrls.length > 0) {
      onChange([...value, ...uploadedUrls])
      showToast.success('Image(s) uploaded successfully.')
    }
    
    setIsUploading(false)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/webp': [],
    },
  })

  const handleRemove = (imageUrl: string) => {
    onChange(value.filter(url => url !== imageUrl))
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer
          ${isDragActive ? 'border-primary' : 'border-gray-300'}
        `}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
            <p className="mt-2 text-sm text-center text-gray-500">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-500" />
            <p className="mt-2 text-sm text-center text-gray-500">
              {isDragActive
                ? 'Drop the files here ...'
                : `Drag 'n' drop some files here, or click to select files`}
            </p>
            <p className="text-xs text-gray-500">Max {maxFiles} files</p>
          </>
        )}
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <Image
                src={url}
                alt={`Uploaded image ${index + 1}`}
                width={150}
                height={150}
                className="object-cover w-full h-full rounded-lg"
              />
              <button
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 