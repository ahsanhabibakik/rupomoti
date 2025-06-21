import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Error deleting image:', error)
    throw new Error('Failed to delete image')
  }
}

export const getPublicIdFromUrl = (url: string): string => {
  const parts = url.split('/')
  const filename = parts[parts.length - 1]
  return filename.split('.')[0]
} 