import useSWR from 'swr'
import { showToast } from '@/lib/toast'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useMedia() {
  const { data, error, mutate } = useSWR('/api/media', fetcher)

  const uploadMedia = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return showToast.promise(
      fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to upload media')
        mutate()
        return res.json()
      }),
      {
        loading: 'Uploading media...',
        success: 'Media uploaded successfully',
        error: 'Failed to upload media',
      }
    )
  }

  const deleteMedia = async (id: string) => {
    return showToast.promise(
      fetch(`/api/media/${id}`, {
        method: 'DELETE',
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to delete media')
        mutate()
      }),
      {
        loading: 'Deleting media...',
        success: 'Media deleted successfully',
        error: 'Failed to delete media',
      }
    )
  }

  return {
    data,
    isLoading: !error && !data,
    error,
    uploadMedia,
    deleteMedia,
  }
} 