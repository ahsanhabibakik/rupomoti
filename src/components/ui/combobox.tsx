'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from './badge'
import { toast } from 'sonner'

interface ComboboxProps {
  tags: { id: string; name: string }[]
  selectedTagIds: string[]
  onSelectTag: (ids: string[]) => void
  onCreateTag: (tag: { id: string; name: string }) => void
}

async function createTag(name: string): Promise<{ id: string; name: string }> {
  const response = await fetch('/api/admin/newsletter-tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create tag')
  }
  return response.json()
}

export function Combobox({ tags, selectedTagIds, onSelectTag, onCreateTag }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')

  const handleSelect = (tagId: string) => {
    const newSelectedIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId]
    onSelectTag(newSelectedIds)
  }

  const handleCreate = async () => {
    const newTagName = inputValue.trim()
    if (newTagName && !tags.some(tag => tag.name.toLowerCase() === newTagName.toLowerCase())) {
      try {
        const newTag = await createTag(newTagName)
        onCreateTag(newTag)
        onSelectTag([...selectedTagIds, newTag.id])
        toast.success(`Tag "${newTag.name}" created and added.`)
        setInputValue('')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not create tag.')
      }
    }
  }

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id))

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto"
          >
            <div className="flex flex-wrap gap-1">
              {selectedTags.length > 0 ? (
                selectedTags.map(tag => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))
              ) : (
                'Select tags...'
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              placeholder="Search or create tag..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>
                {inputValue.trim() ? 'No tags found.' : 'Type to search...'}
              </CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => {
                      handleSelect(tag.id)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedTagIds.includes(tag.id) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {inputValue.trim() && !tags.some(t => t.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleCreate}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create "{inputValue.trim()}"
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
} 