'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

// Use environment variables for Cloudinary settings
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'rupomoti_uploads';
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dotinshdj';

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  maxFiles?: number
  section?: string
  maxSize?: number // in megabytes
}

export function ImageUpload({ 
  value, 
  onChange, 
  maxFiles = 1, 
  section = 'general',
  maxSize = 5 // Default 5MB
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})

  // Function to upload file through our server API
  const uploadToServer = useCallback(async (file: File): Promise<string> => {
    // Create unique identifier for this upload to track progress
    const uploadId = `${file.name}-${Date.now()}`;
    
    try {
      // Special handling for SVG files to ensure they don't get saved locally
      const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg');
      
      // Use FormData to prepare the upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('section', section || 'general');
      
      if (isSvg) {
        // Mark this as an SVG file so the server knows to handle it properly
        formData.append('isSvg', 'true');
      }
      
      // Set initial progress
      setProgress(prev => ({
        ...prev,
        [uploadId]: 10 // Start with 10% to show activity
      }));
      
      // Use fetch with our API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // Note: We can't track upload progress with fetch API as easily as with XHR
      });
      
      // Update progress to 90% after server receives it
      setProgress(prev => ({
        ...prev,
        [uploadId]: 90
      }));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Set progress to 100% on completion
      setProgress(prev => ({
        ...prev,
        [uploadId]: 100
      }));
      
      if (data.url) {
        return data.url;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }, [section]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (value.length + acceptedFiles.length > maxFiles) {
      toast.error(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }

    // Validate file sizes and types
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} is not a valid image.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setProgress({});

    try {
      // Use Promise.all to upload files in parallel
      const uploadPromises = validFiles.map(file => uploadToServer(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully.`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Upload failed: ${errorMessage}`);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/webp': [],
      'image/svg+xml': [], // Add SVG support for logo
    },
    disabled: isUploading
  });

  const handleRemove = (imageUrl: string) => {
    onChange(value.filter(url => url !== imageUrl));
  };

  // Get progress display
  const progressDisplay = () => {
    const avgProgress = Object.values(progress).reduce((sum, val) => sum + val, 0) / Math.max(1, Object.values(progress).length);
    return Math.round(avgProgress);
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${isUploading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="mt-2 text-sm text-center text-gray-600 font-medium">Uploading... {progressDisplay()}%</p>
            <div className="w-full max-w-xs mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out" 
                style={{ width: `${progressDisplay()}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-500" />
            <p className="mt-2 text-sm text-center text-gray-600 font-medium">
              {isDragActive
                ? 'Drop the files here ...'
                : `Drag 'n' drop ${maxFiles > 1 ? 'images' : 'an image'} here, or click to select`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {maxFiles > 1 ? `Maximum ${maxFiles} files` : 'Single file upload'} • Max size: {maxSize}MB
            </p>
          </>
        )}
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {value.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <Image
                src={url}
                alt={`Uploaded image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, 33vw"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/placeholder.png";
                }}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent dropzone from opening
                    handleRemove(url);
                  }}
                  className="p-1.5 bg-red-500 text-white rounded-full"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 