'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
// Import Mongoose models to replace Prisma models

import { Download, Search, PlusCircle, Tag as TagIcon, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { Combobox } from '@/components/ui/combobox'

type SubscriptionWithTags = NewsletterSubscription & { tags: NewsletterTag[] }

// API fetching functions
async function getSubscriptions(): Promise<SubscriptionWithTags[]> {
  const response = await fetch('/api/admin/newsletter')
  if (!response.ok) throw new Error('Failed to fetch subscribers')
  return response.json()
}

async function getTags(): Promise<NewsletterTag[]> {
  const response = await fetch('/api/admin/newsletter-tags')
  if (!response.ok) throw new Error('Failed to fetch tags')
  return response.json()
}

async function addSubscriber(email: string, tagIds: string[]): Promise<SubscriptionWithTags> {
    const response = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tagIds }),
    })
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add subscriber')
    }
    return response.json()
}


export default function NewsletterClient() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithTags[]>([])
  const [tags, setTags] = useState<NewsletterTag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isAddDialogOpen, setAddDialogOpen] = useState(false)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [subsData, tagsData] = await Promise.all([getSubscriptions(), getTags()])
        setSubscriptions(subsData)
        setTags(tagsData)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Memoized filtering
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.email.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((sub) => 
        selectedTags.length === 0 || 
        selectedTags.every(tagId => sub.tags.some(subTag => subTag.id === tagId))
      )
  }, [subscriptions, searchTerm, selectedTags])

  // Handlers
  const handleAddSubscriber = async (email: string, newTagIds: string[]) => {
    try {
        const newSubscriber = await addSubscriber(email, newTagIds)
        setSubscriptions([newSubscriber, ...subscriptions])
        toast.success(`Successfully subscribed ${email}!`)
        setAddDialogOpen(false)
    } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to add subscriber')
    }
  }

  const handleCreateTag = (newTag: NewsletterTag) => {
    setTags([...tags, newTag]);
  };

  if (loading) return <div>Loading subscribers...</div>

  return (
    <div>
      {/* Filters and Actions */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
        <div className="flex flex-wrap gap-2 items-center">
            <div className="relative w-full sm:w-auto max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full"
                />
            </div>
            <TagFilterDropdown 
                tags={tags} 
                selectedTags={selectedTags} 
                setSelectedTags={setSelectedTags}
            />
        </div>
        <div className="flex gap-2">
            <Button onClick={() => {}} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
            </Button>
            <AddSubscriberDialog
                open={isAddDialogOpen}
                onOpenChange={setAddDialogOpen}
                onAddSubscriber={handleAddSubscriber}
                tags={tags}
                onCreateTag={handleCreateTag}
            />
        </div>
      </div>
      
      {/* Subscribers Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Subscribed Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length > 0 ? (
              filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">{subscription.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {subscription.tags.map(tag => (
                        <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(subscription.createdAt), 'PPP p')}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No subscribers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


// Sub-components for better organization

function AddSubscriberDialog({ open, onOpenChange, onAddSubscriber, tags, onCreateTag }: any) {
  const [email, setEmail] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddSubscriber(email, selectedTagIds)
    setEmail('')
    setSelectedTagIds([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Subscriber
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Add New Subscriber</DialogTitle>
                <DialogDescription>
                    Manually add a new subscriber and assign tags.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                    <Input
                        id="email"
                        type="email"
                        placeholder="subscriber@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Combobox
                        tags={tags}
                        selectedTagIds={selectedTagIds}
                        onSelectTag={setSelectedTagIds}
                        onCreateTag={onCreateTag}
                    />
                </div>
                <DialogFooter>
                    <Button type="submit">Add Subscriber</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  )
}

function TagFilterDropdown({ tags, selectedTags, setSelectedTags }: any) {
    const handleSelect = (tagId: string) => {
        setSelectedTags((prev: string[]) => 
            prev.includes(tagId) 
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <TagIcon className="mr-2 h-4 w-4" />
                    Filter by Tag ({selectedTags.length})
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {tags.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No tags available.</div>
                ) : (
                    tags.map((tag: NewsletterTag) => (
                        <DropdownMenuCheckboxItem
                            key={tag.id}
                            checked={selectedTags.includes(tag.id)}
                            onSelect={() => handleSelect(tag.id)}
                        >
                            {tag.name}
                        </DropdownMenuCheckboxItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
} 