'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMedia } from '@/hooks/useMedia'
import { ImageUpload } from '@/components/admin/ImageUpload'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function MediaPage() {
  const [search, setSearch] = useState('')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('slider')
  const [selectedAlt, setSelectedAlt] = useState<string>('')
  const { data: media, isLoading, error, createMedia, deleteMedia } = useMedia()

  const handleUpload = async (files: string[]) => {
    if (files.length === 0) return

    const file = await fetch(files[0]).then(res => res.blob())
    await createMedia(file as File, selectedType, selectedAlt)
    setIsUploadOpen(false)
    setSelectedType('slider')
    setSelectedAlt('')
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      await deleteMedia(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Error loading media</p>
      </div>
    )
  }

  const filteredMedia = media?.filter(item =>
    item.type.toLowerCase().includes(search.toLowerCase()) ||
    (item.alt && item.alt.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Media</h1>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Media
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMedia?.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square rounded-lg overflow-hidden border"
          >
            <Image
              src={item.url}
              alt={item.alt || ''}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white p-2 text-sm">
              <p className="font-medium">{item.type}</p>
              {item.alt && <p className="text-xs opacity-75">{item.alt}</p>}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slider">Slider</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="gallery">Gallery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input
                placeholder="Enter alt text"
                value={selectedAlt}
                onChange={(e) => setSelectedAlt(e.target.value)}
              />
            </div>

            <ImageUpload
              value={[]}
              onChange={handleUpload}
              maxFiles={1}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 