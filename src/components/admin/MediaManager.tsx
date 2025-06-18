'use client'

import { useState, useEffect } from 'react'
import { Upload, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Image from 'next/image'

interface Media {
  id: string
  name: string
  url: string
  alt?: string
  type: string
  section: string
  position: number
  isActive: boolean
}

const SECTIONS = [
  {
    name: 'hero-slider',
    title: 'Hero Slider',
    description: 'Main banner images for the homepage',
    guidelines: '1920x800px, JPG/PNG, max 2MB'
  },
  {
    name: 'logo',
    title: 'Logo',
    description: 'Website logo and branding',
    guidelines: '300x100px, PNG with transparent background'
  },
  {
    name: 'banner',
    title: 'Banners',
    description: 'Promotional banners and ads',
    guidelines: '1200x400px, JPG/PNG, max 1MB'
  }
]

export function MediaManager() {
  const [media, setMedia] = useState<Media[]>([])
  const [selectedSection, setSelectedSection] = useState('hero-slider')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    name: '',
    alt: '',
    section: 'hero-slider'
  })

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/media')
      if (response.ok) {
        const data = await response.json()
        setMedia(data)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
      toast.error('Failed to load media')
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadData(prev => ({ ...prev, file, name: file.name }))
    }
  }

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.name) {
      toast.error('Please select a file and enter a name')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', uploadData.file)
      formData.append('name', uploadData.name)
      formData.append('alt', uploadData.alt)
      formData.append('section', uploadData.section)
      formData.append('type', 'image')

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast.success('Media uploaded successfully')
        setIsUploadOpen(false)
        setUploadData({ file: null, name: '', alt: '', section: 'hero-slider' })
        fetchMedia()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading:', error)
      toast.error('Upload failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const response = await fetch(`/api/media?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Media deleted successfully')
        fetchMedia()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Delete failed')
    }
  }

  const filteredMedia = media.filter(m => m.section === selectedSection).sort((a, b) => a.position - b.position)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Media Manager</h1>
          <p className="text-neutral-light">Manage your website's images and media content</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="w-full sm:w-auto">
          <Upload className="w-4 h-4 mr-2" />
          Upload Media
        </Button>
      </div>

      <Tabs value={selectedSection} onValueChange={setSelectedSection} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {SECTIONS.map((section) => (
            <TabsTrigger key={section.name} value={section.name}>
              {section.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTIONS.map((section) => (
          <TabsContent key={section.name} value={section.name} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  {section.title}
                </CardTitle>
                <p className="text-sm text-neutral-light">{section.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMedia.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="relative aspect-video">
                        <Image
                          src={item.url}
                          alt={item.alt || item.name}
                          fill
                          className="object-cover"
                        />
                        <Badge 
                          variant={item.isActive ? "default" : "secondary"}
                          className="absolute top-2 left-2"
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-neutral-light truncate">{item.alt}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-neutral-light">#{item.position}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                            className="h-6 w-6 p-0 text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {filteredMedia.length === 0 && (
                  <div className="text-center py-8 text-neutral-light">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No media in this section yet</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsUploadOpen(true)}
                      className="mt-2"
                    >
                      Add First Item
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Image Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-light">{section.guidelines}</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Section</Label>
              <Select value={uploadData.section} onValueChange={(value) => setUploadData(prev => ({ ...prev, section: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((section) => (
                    <SelectItem key={section.name} value={section.name}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>File</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            <div>
              <Label>Name</Label>
              <Input
                placeholder="Enter media name"
                value={uploadData.name}
                onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label>Alt Text</Label>
              <Textarea
                placeholder="Enter alt text for accessibility"
                value={uploadData.alt}
                onChange={(e) => setUploadData(prev => ({ ...prev, alt: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpload} className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
