'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface SortSelectorProps {
  currentSort?: string
}

export default function SortSelector({ currentSort }: SortSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('sort', newSort)
    router.push(`?${params.toString()}`)
  }

  return (
    <select 
      className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
      value={currentSort || 'createdAt'}
      onChange={(e) => handleSortChange(e.target.value)}
    >
      <option value="createdAt">Newest First</option>
      <option value="price">Price: Low to High</option>
      <option value="name">Name: A to Z</option>
    </select>
  )
}
