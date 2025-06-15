'use client'

import { useEffect, useState } from 'react'
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
import { Card } from "@/components/ui/card"

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

      {filteredMedia?.length === 0 ? (
        <div className="text-center text-gray-500">No media found.</div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedia?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.url ? (
                        <img src={item.url} alt={item.alt || ''} className="h-12 w-12 object-cover rounded" />
                      ) : null}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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