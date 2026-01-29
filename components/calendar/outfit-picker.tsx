'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { format } from 'date-fns'
import { Search, X, Check, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClothingItemWithTags, CalendarOutfitWithItem, CLOTHING_TYPES } from '@/types'
import { cn } from '@/lib/utils'

interface OutfitPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  clothingItems: ClothingItemWithTags[]
  existingOutfits: CalendarOutfitWithItem[]
  onAddOutfit: (itemId: string) => void
  onRemoveOutfit: (outfitId: string) => void
  initialItemId?: string
}

export function OutfitPicker({
  open,
  onOpenChange,
  selectedDate,
  clothingItems,
  existingOutfits,
  onAddOutfit,
  onRemoveOutfit,
  initialItemId,
}: OutfitPickerProps) {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  // Get existing item IDs for this date
  const existingItemIds = useMemo(
    () => new Set(existingOutfits.map((o) => o.item_id)),
    [existingOutfits]
  )

  // Filter items
  const filteredItems = useMemo(() => {
    return clothingItems.filter((item) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        if (
          !item.name.toLowerCase().includes(searchLower) &&
          !item.brand?.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false
      }

      return true
    })
  }, [clothingItems, search, selectedType])

  // Group items by type for tabs
  const itemTypes = useMemo(() => {
    const types = new Set(clothingItems.map((item) => item.type))
    return Array.from(types).sort()
  }, [clothingItems])

  const handleItemClick = (item: ClothingItemWithTags) => {
    if (existingItemIds.has(item.id)) {
      // Find and remove the outfit
      const outfit = existingOutfits.find((o) => o.item_id === item.id)
      if (outfit) {
        onRemoveOutfit(outfit.id)
      }
    } else {
      onAddOutfit(item.id)
    }
  }

  if (!selectedDate) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Plan outfit for</span>
            <Badge variant="secondary">{format(selectedDate, 'EEEE, MMMM d')}</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Currently selected items */}
        {existingOutfits.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-zinc-500">Selected items:</p>
            <div className="flex flex-wrap gap-2">
              {existingOutfits.map((outfit) => (
                <motion.div
                  key={outfit.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  {outfit.clothing_item && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-zinc-900 dark:border-zinc-100">
                      <Image
                        src={outfit.clothing_item.image_url}
                        alt={outfit.clothing_item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                      <button
                        onClick={() => onRemoveOutfit(outfit.id)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Type tabs */}
        <Tabs value={selectedType} onValueChange={setSelectedType} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full justify-start overflow-x-auto flex-shrink-0">
            <TabsTrigger value="all">All</TabsTrigger>
            {itemTypes.map((type) => {
              const typeInfo = CLOTHING_TYPES.find((t) => t.value === type)
              return (
                <TabsTrigger key={type} value={type}>
                  {typeInfo?.icon} {typeInfo?.label || type}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value={selectedType} className="flex-1 overflow-y-auto mt-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                No items found
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => {
                    const isSelected = existingItemIds.has(item.id)
                    const isInitial = item.id === initialItemId

                    return (
                      <motion.button
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                          isSelected
                            ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/20'
                            : 'border-transparent hover:border-zinc-300',
                          isInitial && !isSelected && 'ring-2 ring-blue-500/50'
                        )}
                      >
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 33vw, 25vw"
                        />
                        {/* Selection indicator */}
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-zinc-900/50 flex items-center justify-center"
                          >
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                              <Check className="h-5 w-5 text-zinc-900" />
                            </div>
                          </motion.div>
                        )}
                        {/* Hover overlay */}
                        {!isSelected && (
                          <div className="absolute inset-0 bg-zinc-900/0 hover:bg-zinc-900/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                              <Plus className="h-5 w-5 text-zinc-900" />
                            </div>
                          </div>
                        )}
                        {/* Item name tooltip */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-4">
                          <p className="text-white text-xs truncate">{item.name}</p>
                        </div>
                      </motion.button>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
