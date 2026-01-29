'use client'

import { useState, useMemo, useCallback } from 'react'
import { AnimatePresence, motion, LayoutGroup } from 'motion/react'
import { ClothingCard } from './clothing-card'
import { ClothingFiltersComponent } from './clothing-filters'
import { ClothingModal } from './clothing-modal'
import { EmptyState } from '@/components/shared/empty-state'
import { ClothingItemWithTags, ClothingFilters, SortOption, ClothingTag } from '@/types'
import { deleteClothingItem } from '@/lib/actions/clothing'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ClothingGridProps {
  items: ClothingItemWithTags[]
  tags: ClothingTag[]
}

export function ClothingGrid({ items, tags }: ClothingGridProps) {
  const [filters, setFilters] = useState<ClothingFilters>({
    type: null,
    season: null,
    color: null,
    tags: [],
    search: '',
    favorites: false,
  })
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedItem, setSelectedItem] = useState<ClothingItemWithTags | null>(null)
  const [itemToDelete, setItemToDelete] = useState<ClothingItemWithTags | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase()
        if (
          !item.name.toLowerCase().includes(search) &&
          !item.description?.toLowerCase().includes(search) &&
          !item.brand?.toLowerCase().includes(search)
        ) {
          return false
        }
      }

      // Type filter
      if (filters.type && item.type !== filters.type) {
        return false
      }

      // Season filter
      if (filters.season && !item.season?.includes(filters.season)) {
        return false
      }

      // Color filter
      if (filters.color && item.color !== filters.color) {
        return false
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const itemTagIds = item.tags?.map((t) => t.id) || []
        if (!filters.tags.some((tagId) => itemTagIds.includes(tagId))) {
          return false
        }
      }

      // Favorites filter
      if (filters.favorites && !item.is_favorite) {
        return false
      }

      return true
    })
  }, [items, filters])

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems]
    
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'most-worn':
        sorted.sort((a, b) => (b.wear_count || 0) - (a.wear_count || 0))
        break
      case 'least-worn':
        sorted.sort((a, b) => (a.wear_count || 0) - (b.wear_count || 0))
        break
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name))
        break
    }
    
    return sorted
  }, [filteredItems, sortBy])

  const handleDelete = useCallback(async () => {
    if (!itemToDelete) return
    
    setIsDeleting(true)
    const result = await deleteClothingItem(itemToDelete.id)
    setIsDeleting(false)
    
    if (result.success) {
      toast({
        title: 'Item deleted',
        description: `"${itemToDelete.name}" has been removed from your closet.`,
      })
      setItemToDelete(null)
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete item',
        variant: 'destructive',
      })
    }
  }, [itemToDelete, toast])

  const handleEdit = useCallback((item: ClothingItemWithTags) => {
    router.push(`/add?edit=${item.id}`)
  }, [router])

  if (items.length === 0) {
    return <EmptyState type="closet" />
  }

  return (
    <div className="space-y-4 px-4">
      <ClothingFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        tags={tags}
        totalCount={items.length}
        filteredCount={filteredItems.length}
      />

      {sortedItems.length === 0 ? (
        <EmptyState type="search" />
      ) : (
        <LayoutGroup>
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            layout
          >
            <AnimatePresence mode="popLayout">
              {sortedItems.map((item) => (
                <ClothingCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => setItemToDelete(item)}
                  onSchedule={() => router.push(`/calendar?item=${item.id}`)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      )}

      {/* Item detail modal */}
      <ClothingModal
        item={selectedItem}
        open={!!selectedItem}
        onOpenChange={(open: boolean) => !open && setSelectedItem(null)}
        onEdit={() => selectedItem && handleEdit(selectedItem)}
        onDelete={() => {
          if (selectedItem) {
            setItemToDelete(selectedItem)
            setSelectedItem(null)
          }
        }}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{itemToDelete?.name}&quot;? This action cannot be
              undone. Any calendar entries with this item will also be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
