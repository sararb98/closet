'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { Archive, ArchiveRestore, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { getArchivedItems, setClothingItemsArchived } from '@/lib/actions/clothing'
import { ClothingItemWithTags, CLOTHING_TYPES } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function ArchivedItemsButton() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState<ClothingItemWithTags[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isRestoring, setIsRestoring] = useState(false)
  const { toast } = useToast()

  const loadItems = useCallback(async () => {
    setIsLoading(true)
    const data = await getArchivedItems()
    setItems(data)
    setIsLoading(false)
  }, [])

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setSelectedIds(new Set())
      loadItems()
    }
  }, [loadItems])

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleRestore = async (ids: string[]) => {
    setIsRestoring(true)
    const result = await setClothingItemsArchived(ids, false)
    setIsRestoring(false)

    if (result.success) {
      setItems((prev) => prev.filter((item) => !ids.includes(item.id)))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
      toast({
        title: 'Restored',
        description: `${ids.length} item${ids.length === 1 ? '' : 's'} moved back to your closet.`,
      })
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to restore item(s)',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleOpenChange(true)}
        title="Archived items"
        aria-label="Archived items"
        className="h-8 w-8 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-600 dark:hover:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Archive className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Archived Items</DialogTitle>
            <DialogDescription>
              Items you&apos;ve hidden from your closet. Restore them to see them again in your main list.
            </DialogDescription>
          </DialogHeader>

          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-zinc-100 dark:bg-zinc-900 px-3 py-2">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <Button
                size="sm"
                onClick={() => handleRestore(Array.from(selectedIds))}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                )}
                Restore
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto -mx-2 px-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-12">
                No archived items. Items you archive from your closet will show up here.
              </p>
            ) : (
              <ul className="space-y-1">
                {items.map((item) => {
                  const typeInfo = CLOTHING_TYPES.find((t) => t.value === item.type)
                  const isSelected = selectedIds.has(item.id)
                  return (
                    <li
                      key={item.id}
                      className={cn(
                        'flex items-center gap-3 rounded-lg p-2 transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-zinc-100 dark:bg-zinc-900'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                      )}
                      onClick={() => toggleSelected(item.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelected(item.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {typeInfo?.icon} {typeInfo?.label || item.type}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRestore([item.id])
                        }}
                        disabled={isRestoring}
                      >
                        Restore
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
