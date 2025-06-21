'use client'

import { useState, useEffect } from 'react'
import { Upload, Edit, Trash2, Image as ImageIcon, PlusCircle, XCircle } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'

interface Media {
  id: string
  name: string
  url: string
  alt?: string
  type: string
  section: string
  position: number
  isActive: boolean
  metadata?: {
    mobileUrl?: string
  }
}

const SECTIONS = [
  {
    name: 'hero-slider',
    title: 'Hero Slider',
    description: 'Main banner images for the homepage',
    guidelines: 'Desktop: 1920x800px (3:1 ratio). Mobile: 800x1000px (4:5 ratio). Max 10 images.'
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

interface UploadItem {
  id: number;
  desktopFile: File | null;
  mobileFile: File | null;
  name: string;
  alt: string;
}

export function MediaManager() {
  const [media, setMedia] = useState<Media[]>([])
  const [selectedSection, setSelectedSection] = useState('hero-slider')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingMedia, setEditingMedia] = useState<Media | null>(null)
  
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([{
    id: 1,
    desktopFile: null,
    mobileFile: null,
    name: '',
    alt: ''
  }]);

  useEffect(() => {
    if (!isUploadOpen) {
      // Reset upload form when dialog closes
      setUploadItems([{ id: 1, desktopFile: null, mobileFile: null, name: '', alt: '' }]);
    }
  }, [isUploadOpen]);

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/admin/media')
      if (response.ok) {
        const data = await response.json()
        setMedia(data)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
      toast.error('Failed to load media')
    }
  }

  const addUploadItem = () => {
    if (uploadItems.length >= 10) {
      toast.error('You can add a maximum of 10 items at a time.');
      return;
    }
    setUploadItems(prev => [...prev, {
      id: prev.length > 0 ? Math.max(...prev.map(item => item.id)) + 1 : 1,
      desktopFile: null,
      mobileFile: null,
      name: '',
      alt: ''
    }]);
  };

  const removeUploadItem = (id: number) => {
    setUploadItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUploadItemChange = (id: number, field: keyof Omit<UploadItem, 'id'>, value: string | File | null) => {
    setUploadItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'desktopFile' && value instanceof File) {
          updatedItem.name = value.name;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleUpload = async () => {
    const validItems = uploadItems.filter(item => item.desktopFile && item.name);
    if (validItems.length === 0) {
      toast.error('Please add at least one valid banner with a desktop image and name.');
      return;
    }

    toast.info(`Uploading ${validItems.length} banner(s)...`);

    const uploadPromises = validItems.map(item => {
      const formData = new FormData();
      formData.append('file', item.desktopFile!);
      if (item.mobileFile && selectedSection === 'hero-slider') {
        formData.append('mobileFile', item.mobileFile);
      }
      formData.append('name', item.name);
      formData.append('alt', item.alt);
      formData.append('section', selectedSection);
      formData.append('type', 'image');
      
      return fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      });
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      let successfulUploads = 0;
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.ok) {
          successfulUploads++;
        }
      });
      
      if (successfulUploads > 0) {
        toast.success(`${successfulUploads} banner(s) uploaded successfully!`);
        setIsUploadOpen(false);
        fetchMedia();
      }

      if (successfulUploads < validItems.length) {
        toast.error(`${validItems.length - successfulUploads} upload(s) failed.`);
      }
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('An unexpected error occurred during upload.');
    }
  };

  const handleEditOpen = (mediaItem: Media) => {
    setEditingMedia(mediaItem);
    setIsEditOpen(true);
  }

  const handleUpdate = async (updatePayload: any) => {
    if (!editingMedia) return;

    try {
      const response = await fetch(`/api/admin/media/${editingMedia.id}`, {
        method: 'POST', // Using POST for FormData
        body: updatePayload,
      });

      if (response.ok) {
        toast.success('Media updated successfully!');
        setIsEditOpen(false);
        setEditingMedia(null);
        fetchMedia();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating:', error);
      toast.error('An unexpected error occurred during update.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const response = await fetch(`/api/admin/media?id=${id}`, {
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
          <p className="text-neutral-light">Manage your website&apos;s images and media content</p>
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
                    <Card key={item.id} className="overflow-hidden group">
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
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditOpen(item)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload New Banners</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-1 pr-4 space-y-4">
            {uploadItems.map((item, index) => (
              <Card key={item.id} className="p-4 relative">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Banner {index + 1}</h4>
                  {uploadItems.length > 1 && (
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeUploadItem(item.id)}>
                      <XCircle className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`desktop-file-${item.id}`}>Desktop Image*</Label>
                    <Input id={`desktop-file-${item.id}`} type="file" onChange={(e) => handleUploadItemChange(item.id, 'desktopFile', e.target.files?.[0] || null)} />
                  </div>
                  {selectedSection === 'hero-slider' && (
                    <div>
                      <Label htmlFor={`mobile-file-${item.id}`}>Mobile Image</Label>
                      <Input id={`mobile-file-${item.id}`} type="file" onChange={(e) => handleUploadItemChange(item.id, 'mobileFile', e.target.files?.[0] || null)} />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Label htmlFor={`name-${item.id}`}>Name*</Label>
                  <Input id={`name-${item.id}`} value={item.name} onChange={(e) => handleUploadItemChange(item.id, 'name', e.target.value)} placeholder="e.g., Summer Sale Banner" />
                </div>
                <div className="mt-4">
                  <Label htmlFor={`alt-${item.id}`}>Alt Text</Label>
                  <Input id={`alt-${item.id}`} value={item.alt} onChange={(e) => handleUploadItemChange(item.id, 'alt', e.target.value)} placeholder="e.g., A woman smiling and holding a product" />
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={addUploadItem} className="w-full">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Another Banner
            </Button>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Upload {uploadItems.length} Banner(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      {editingMedia && (
        <EditMediaDialog 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen} 
          media={editingMedia}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}

// EditMediaDialog Component
function EditMediaDialog({ 
  open, 
  onOpenChange, 
  media, 
  onUpdate 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  media: Media, 
  onUpdate: (payload: FormData) => void 
}) {
  const [name, setName] = useState(media.name);
  const [alt, setAlt] = useState(media.alt || '');
  const [isActive, setIsActive] = useState(media.isActive);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newMobileFile, setNewMobileFile] = useState<File | null>(null);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('alt', alt);
    formData.append('isActive', String(isActive));
    if (newFile) {
      formData.append('file', newFile);
    }
    if (newMobileFile) {
      formData.append('mobileFile', newMobileFile);
    }
    onUpdate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Media</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Current Image</Label>
              <Image src={media.url} alt={media.name} width={200} height={120} className="rounded object-cover aspect-video" />
            </div>
            {media.metadata?.mobileUrl && (
              <div>
                <Label>Current Mobile Image</Label>
                <Image src={media.metadata.mobileUrl} alt={media.name} width={200} height={250} className="rounded object-cover aspect-[4/5]" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-alt">Alt Text</Label>
            <Textarea id="edit-alt" value={alt} onChange={(e) => setAlt(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Replace Image</Label>
            <Input type="file" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
          </div>
          {media.section === 'hero-slider' && (
            <div className="space-y-2">
              <Label>Replace Mobile Image</Label>
              <Input type="file" onChange={(e) => setNewMobileFile(e.target.files?.[0] || null)} />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Switch id="edit-isActive" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="edit-isActive">Active</Label>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
