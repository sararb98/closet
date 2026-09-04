'use client'

import { useState, useMemo, useCallback } from 'react'
import { AnimatePresence, motion, LayoutGroup } from 'motion/react'
import { ClothingCard } from './clothing-card'
import { ClothingFiltersComponent } from './clothing-filters'
import { ClothingModal } from './clothing-modal'
import { EmptyState } from '@/components/shared/empty-state'
import { ClothingItemWithTags, ClothingFilters, SortOption, ClothingTag } from '@/types'
import { deleteClothingItem, setClothingItemsArchived } from '@/lib/actions/clothing'
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
import { Archive, Loader2 } from 'lucide-react'

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
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isArchiving, setIsArchiving] = useState(false)
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

  const toggleSelectMode = useCallback(() => {
    setSelectMode((prev) => !prev)
    setSelectedIds(new Set())
  }, [])

  const toggleItemSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleArchiveSelected = useCallback(async () => {
    if (selectedIds.size === 0) return

    const ids = Array.from(selectedIds)
    setIsArchiving(true)
    const result = await setClothingItemsArchived(ids, true)
    setIsArchiving(false)

    if (result.success) {
      toast({
        title: 'Items archived',
        description: `${ids.length} item${ids.length === 1 ? '' : 's'} moved to Archived.`,
      })
      setSelectedIds(new Set())
      setSelectMode(false)
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to archive items',
        variant: 'destructive',
      })
    }
  }, [selectedIds, toast])

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
        selectMode={selectMode}
        onToggleSelectMode={toggleSelectMode}
      />

      <AnimatePresence>
        {selectMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2"
          >
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {selectedIds.size} selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                Clear
              </Button>
              <Button size="sm" onClick={handleArchiveSelected} disabled={isArchiving}>
                {isArchiving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="mr-2 h-4 w-4" />
                )}
                Archive
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  selectMode={selectMode}
                  selected={selectedIds.has(item.id)}
                  onToggleSelect={() => toggleItemSelected(item.id)}
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
