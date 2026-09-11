'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BookmarkPlus, Check, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { OutfitCard } from '@/components/outfits/outfit-card'
import { ClothingItemWithTags, OutfitOccasion, OutfitWithItems, ScheduledOutfitWithItems } from '@/types'
import { cn } from '@/lib/utils'
import { createOutfit } from '@/lib/actions/outfits'
import { useToast } from '@/hooks/use-toast'

interface ScheduledOutfitPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  clothingItems: ClothingItemWithTags[]
  savedOutfits: OutfitWithItems[]
  scheduledOutfits: ScheduledOutfitWithItems[]
  onSchedule: (input: { itemIds: string[]; name: string; sourceOutfitId?: string | null }) => Promise<boolean>
  onRemove: (outfitId: string) => Promise<boolean>
  onMarkWorn: (outfitId: string) => Promise<boolean>
  initialItemId?: string
}

export function ScheduledOutfitPicker({
  open,
  onOpenChange,
  selectedDate,
  clothingItems,
  savedOutfits,
  scheduledOutfits,
  onSchedule,
  onRemove,
  onMarkWorn,
  initialItemId,
}: Readonly<ScheduledOutfitPickerProps>) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sourceOutfitId, setSourceOutfitId] = useState<string>('none')
  const [variationItemIds, setVariationItemIds] = useState<string[]>(initialItemId ? [initialItemId] : [])
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'saved' | 'variation'>(initialItemId ? 'variation' : 'saved')
  const [savedScheduleIds, setSavedScheduleIds] = useState<string[]>([])
  const { toast } = useToast()

  if (!selectedDate) return null

  const toggleSavedOutfit = (outfitId: string) => {
    setSelectedIds((current) => current.includes(outfitId) ? current.filter((id) => id !== outfitId) : [...current, outfitId])
  }

  const selectSourceOutfit = (outfitId: string) => {
    setSourceOutfitId(outfitId)
    const source = savedOutfits.find((outfit) => outfit.id === outfitId)
    if (source) {
      setVariationItemIds(source.items.map((item) => item.id))
    } else {
      setVariationItemIds(initialItemId ? [initialItemId] : [])
    }
  }

  const toggleVariationItem = (itemId: string) => {
    setVariationItemIds((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId])
  }

  const addSelectedOutfits = async () => {
    setIsSaving(true)
    const outfitsToSchedule = savedOutfits.filter((outfit) => selectedIds.includes(outfit.id))
    for (const outfit of outfitsToSchedule) {
      const success = await onSchedule({ itemIds: outfit.items.map((item) => item.id), name: outfit.name, sourceOutfitId: outfit.id })
      if (!success) break
    }
    setSelectedIds([])
    setIsSaving(false)
  }

  const addVariation = async () => {
    setIsSaving(true)
    const source = savedOutfits.find((outfit) => outfit.id === sourceOutfitId)
    const success = await onSchedule({
      itemIds: variationItemIds,
      name: source?.name || 'Custom outfit',
      sourceOutfitId: source?.id || null,
    })
    if (success) setVariationItemIds([])
    setIsSaving(false)
  }

  const saveScheduledOutfit = async (outfit: ScheduledOutfitWithItems) => {
    const result = await createOutfit({
      name: outfit.name,
      itemIds: outfit.items.map((item) => item.id),
      season: outfit.season,
      occasion: outfit.occasion as OutfitOccasion | null,
    })
    if (!result.success) {
      toast({ title: 'Error', description: result.error || 'Failed to save outfit', variant: 'destructive' })
      return
    }
    setSavedScheduleIds((current) => [...current, outfit.id])
    toast({ title: 'Outfit saved', description: 'Available in your outfit library.' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[calc(100dvh-2rem)] max-h-[44rem] max-w-5xl flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Plan outfits for {format(selectedDate, 'EEEE, MMMM d')}</DialogTitle>
          <DialogDescription>Choose saved outfits or build a custom variation for this day.</DialogDescription>
        </DialogHeader>

        {scheduledOutfits.length > 0 && (
          <section className="shrink-0 border-y py-3">
            <p className="mb-2 text-sm font-medium">Scheduled</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {scheduledOutfits.map((outfit) => (
                <div key={outfit.id} className="relative w-24 shrink-0">
                  <OutfitCard outfit={outfit} variant="compact" />
                  <div className="absolute right-1 top-1 flex gap-1 bg-white/90 dark:bg-zinc-950/90">
                    {!savedScheduleIds.includes(outfit.id) && <Button size="icon" variant="ghost" aria-label={`Save ${outfit.name} to outfits`} onClick={() => void saveScheduledOutfit(outfit)}><BookmarkPlus className="h-4 w-4" /></Button>}
                    {outfit.status === 'planned' && <Button size="icon" variant="ghost" aria-label={`Mark ${outfit.name} as worn`} onClick={() => void onMarkWorn(outfit.id)}><Check className="h-4 w-4 text-emerald-600" /></Button>}
                    <Button size="icon" variant="ghost" aria-label={`Remove ${outfit.name}`} onClick={() => void onRemove(outfit.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'saved' | 'variation')} className="flex min-h-0 flex-1 flex-col">
          <TabsList className="shrink-0 self-start">
            <TabsTrigger value="saved">My outfits</TabsTrigger>
            <TabsTrigger value="variation">Custom variation</TabsTrigger>
          </TabsList>
          <TabsContent value="saved" className="min-h-0 flex-1 space-y-4 overflow-y-auto py-4">
            {savedOutfits.length === 0 ? <p className="text-sm text-zinc-500">Create saved outfits from the custom variation tab.</p> : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,12.5rem))] justify-start gap-3">
                {savedOutfits.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} variant="picker" selected={selectedIds.includes(outfit.id)} onSelect={() => toggleSavedOutfit(outfit.id)} />)}
              </div>
            )}
          </TabsContent>
          <TabsContent value="variation" className="min-h-0 flex-1 space-y-4 overflow-y-auto py-4">
            <div className="space-y-2">
              <Button type="button" variant={sourceOutfitId === 'none' ? 'secondary' : 'outline'} onClick={() => selectSourceOutfit('none')}>Start from scratch</Button>
              {savedOutfits.length > 0 && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,12.5rem))] justify-start gap-3">
                  {savedOutfits.map((outfit) => <OutfitCard key={outfit.id} outfit={outfit} variant="picker" selected={sourceOutfitId === outfit.id} onSelect={() => selectSourceOutfit(outfit.id)} />)}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {clothingItems.map((item) => {
                const selected = variationItemIds.includes(item.id)
                return (
                  <label key={item.id} className={cn('relative block cursor-pointer overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800', selected && 'border-zinc-950 ring-2 ring-zinc-950/30 dark:border-zinc-50 dark:ring-zinc-50/30')}>
                    <input type="checkbox" checked={selected} onChange={() => toggleVariationItem(item.id)} className="peer sr-only" aria-label={`Include ${item.name}`} />
                    <div className="relative aspect-square"><Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="(max-width: 640px) 30vw, 160px" /></div>
                    {selected && <span aria-hidden className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/60"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-950 shadow-lg"><Check className="h-6 w-6" /></span></span>}
                  </label>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex shrink-0 justify-end border-t pt-3">
          {activeTab === 'saved'
            ? <Button disabled={selectedIds.length === 0 || isSaving} onClick={() => void addSelectedOutfits()}><Plus className="mr-2 h-4 w-4" />Add selected ({selectedIds.length})</Button>
            : <Button disabled={variationItemIds.length < 2 || isSaving} onClick={() => void addVariation()}><Plus className="mr-2 h-4 w-4" />Add variation</Button>}
        </div>
      </DialogContent>
    </Dialog>
  )
}