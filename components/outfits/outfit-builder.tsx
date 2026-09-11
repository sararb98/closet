'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createOutfit } from '@/lib/actions/outfits'
import { ClothingItemWithTags, CLOTHING_TYPES, OUTFIT_OCCASIONS, OutfitWithItems, SEASONS, Season, OutfitOccasion } from '@/types'
import type { ClothingType } from '@/types/clothing'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface OutfitBuilderProps {
  clothingItems: ClothingItemWithTags[]
  onCreated: (outfit: OutfitWithItems) => void
  triggerClassName?: string
}

export function OutfitBuilder({ clothingItems, onCreated, triggerClassName }: Readonly<OutfitBuilderProps>) {
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [name, setName] = useState('')
  const [season, setSeason] = useState<Season | 'none'>('none')
  const [occasion, setOccasion] = useState<OutfitOccasion | 'none'>('none')
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ClothingType | 'all'>('all')
  const [itemFilter, setItemFilter] = useState<'all' | 'favorites' | 'recent'>('all')
  const { toast } = useToast()

  const matchingItems = clothingItems
    .filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((item) => typeFilter === 'all' || item.type === typeFilter)
    .filter((item) => itemFilter !== 'favorites' || item.is_favorite)
    .sort((left, right) => itemFilter === 'recent'
      ? new Date(right.last_worn_date ?? right.created_at).getTime() - new Date(left.last_worn_date ?? left.created_at).getTime()
      : 0)
  const selectedItemLabel = selectedIds.length === 1 ? 'item' : 'items'
  const selectionMessage = isSaving ? 'Saving outfit.' : `${selectedIds.length} ${selectedItemLabel} selected`

  const toggleItem = (itemId: string) => {
    setSelectedIds((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId])
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSelectedIds([])
      setName('')
      setSeason('none')
      setOccasion('none')
      setSearch('')
      setTypeFilter('all')
      setItemFilter('all')
    }
  }

  const handleCreate = async () => {
    setIsSaving(true)
    const result = await createOutfit({
      name,
      itemIds: selectedIds,
      season: season === 'none' ? [] : [season],
      occasion: occasion === 'none' ? null : occasion,
    })
    setIsSaving(false)
    if (!result.success || !result.outfit) {
      toast({ title: 'Error', description: result.error || 'Failed to save outfit', variant: 'destructive' })
      return
    }

    const items = clothingItems.filter((item) => selectedIds.includes(item.id))
    onCreated({ ...result.outfit, items })
    toast({ title: 'Outfit saved', description: 'Available in your outfit library.' })
    handleOpenChange(false)
  }

  return (
    <>
      <Button className={triggerClassName} onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Create outfit</Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex h-[calc(100dvh-2rem)] max-h-[44rem] max-w-4xl flex-col overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle>Create outfit</DialogTitle><DialogDescription>Choose at least two items, then save this combination to your outfit library.</DialogDescription></DialogHeader>
          <div className="grid shrink-0 gap-3 sm:grid-cols-3">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Outfit name" />
            <Select value={season} onValueChange={(value) => setSeason(value as Season | 'none')}>
              <SelectTrigger><SelectValue placeholder="Season" /></SelectTrigger>
              <SelectContent><SelectItem value="none">Any season</SelectItem>{SEASONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={occasion} onValueChange={(value) => setOccasion(value as OutfitOccasion | 'none')}>
              <SelectTrigger><SelectValue placeholder="Occasion" /></SelectTrigger>
              <SelectContent><SelectItem value="none">Any occasion</SelectItem>{OUTFIT_OCCASIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="shrink-0 space-y-3 border-y py-3">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your closet" aria-label="Search clothing items" />
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Button type="button" size="sm" variant={itemFilter === 'all' ? 'secondary' : 'outline'} onClick={() => setItemFilter('all')}>All</Button>
              <Button type="button" size="sm" variant={itemFilter === 'favorites' ? 'secondary' : 'outline'} onClick={() => setItemFilter('favorites')}>Favorites</Button>
              <Button type="button" size="sm" variant={itemFilter === 'recent' ? 'secondary' : 'outline'} onClick={() => setItemFilter('recent')}>Recently worn</Button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Button type="button" size="sm" variant={typeFilter === 'all' ? 'secondary' : 'outline'} onClick={() => setTypeFilter('all')}>All types</Button>
              {CLOTHING_TYPES.map((type) => (
                <Button key={type.value} type="button" size="sm" variant={typeFilter === type.value ? 'secondary' : 'outline'} onClick={() => setTypeFilter(type.value)}>{type.label}</Button>
              ))}
            </div>
          </div>
          <p className="sr-only" aria-live="polite">{selectionMessage}</p>
          <div className="min-h-0 flex-1 overflow-y-auto py-4">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {matchingItems.map((item) => {
                const selected = selectedIds.includes(item.id)
                return (
                  <label key={item.id} className={cn('relative block cursor-pointer overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800', selected && 'border-zinc-950 ring-2 ring-zinc-950/30 dark:border-zinc-50 dark:ring-zinc-50/30')}>
                    <input type="checkbox" checked={selected} onChange={() => toggleItem(item.id)} className="peer sr-only" aria-label={`Include ${item.name}`} />
                    <div className="relative aspect-square"><Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="(max-width: 640px) 30vw, 160px" /></div>
                    <p className="truncate border-t border-zinc-200 px-2 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">{item.name}</p>
                    {selected && <span aria-hidden className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/60"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-950 shadow-lg"><Check className="h-6 w-6" /></span></span>}
                  </label>
                )
              })}
            </div>
            {matchingItems.length === 0 && <p className="py-12 text-center text-sm text-zinc-500">No items match these filters.</p>}
          </div>
          <div className="flex shrink-0 justify-end border-t pt-3"><Button disabled={!name.trim() || selectedIds.length < 2 || isSaving} onClick={() => void handleCreate()}>{isSaving ? 'Saving...' : `Save outfit (${selectedIds.length})`}</Button></div>
        </DialogContent>
      </Dialog>
    </>
  )
}