import useSWR from 'swr'
import { toast } from '@/components/ui/use-toast'
import { uploadImage } from '@/lib/cloudinary'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useMedia() {
  const { data, error, mutate } = useSWR('/api/media', fetcher)

  const createMedia = async (file: File, type: string, alt?: string) => {
    try {
      // Upload to Cloudinary
      const url = await uploadImage(file)

      // Create media record
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, type, alt }),
      })

      if (!response.ok) {
        throw new Error('Failed to create media')
      }

      const newMedia = await response.json()
      mutate()
      toast({
        title: 'Success',
        description: 'Media uploaded successfully',
      })
      return newMedia
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload media',
        variant: 'destructive',
      })
      throw error
    }
  }

  const updateMedia = async (id: string, mediaData: any) => {
    try {
      const response = await fetch('/api/media', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...mediaData }),
      })

      if (!response.ok) {
        throw new Error('Failed to update media')
      }

      const updatedMedia = await response.json()
      mutate()
      toast({
        title: 'Success',
        description: 'Media updated successfully',
      })
      return updatedMedia
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update media',
        variant: 'destructive',
      })
      throw error
    }
  }

  const deleteMedia = async (id: string) => {
    try {
      const response = await fetch(`/api/media?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete media')
      }

      mutate()
      toast({
        title: 'Success',
        description: 'Media deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete media',
        variant: 'destructive',
      })
      throw error
    }
  }

  return {
    data,
    isLoading: !error && !data,
    error,
    createMedia,
    updateMedia,
    deleteMedia,
  }
} 