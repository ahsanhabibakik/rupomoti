import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CategoryComboboxProps {
  categories: { id: string; name: string }[]
  value: string
  onChange: (value: string) => void
  onCreateCategory: () => void
  disabled?: boolean
}

export function CategoryCombobox({ categories, value, onChange, onCreateCategory, disabled }: CategoryComboboxProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query
    ? categories.filter(cat => cat.name.toLowerCase().includes(query.toLowerCase()))
    : categories

  const handleSelect = (id: string) => {
    onChange(id)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={query || (categories.find(c => c.id === value)?.name || '')}
        onChange={e => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        placeholder="Search or select category"
        disabled={disabled}
        className="pr-10"
      />
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
          {filtered.length > 0 ? (
            filtered.map(cat => (
              <div
                key={cat.id}
                className={cn(
                  'px-4 py-2 cursor-pointer hover:bg-primary/10',
                  value === cat.id && 'bg-primary/10 font-semibold'
                )}
                onMouseDown={() => handleSelect(cat.id)}
              >
                {cat.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 flex items-center justify-between">
              <span>No categories found.</span>
              <Button type="button" size="sm" variant="link" onMouseDown={onCreateCategory}>
                Create new
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 