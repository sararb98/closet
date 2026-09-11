'use client'

import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteOutfit } from '@/lib/actions/outfits'
import { OUTFIT_OCCASIONS, OutfitWithItems, SEASONS } from '@/types'
import type { ClothingItemWithTags } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OutfitCard } from './outfit-card'
import { OutfitBuilder } from './outfit-builder'

interface OutfitGridProps {
  outfits: OutfitWithItems[]
  clothingItems: ClothingItemWithTags[]
  itemId?: string
}

export function OutfitGrid({ outfits, clothingItems, itemId }: Readonly<OutfitGridProps>) {
  const [visibleOutfits, setVisibleOutfits] = useState(outfits)
  const [seasonFilter, setSeasonFilter] = useState('all')
  const [occasionFilter, setOccasionFilter] = useState('all')
  const [outfitToDelete, setOutfitToDelete] = useState<OutfitWithItems | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const filteredOutfits = useMemo(() => visibleOutfits.filter((outfit) =>
    (seasonFilter === 'all' || outfit.season.includes(seasonFilter)) &&
    (occasionFilter === 'all' || outfit.occasion === occasionFilter)
  ), [occasionFilter, seasonFilter, visibleOutfits])

  const handleDelete = async (outfit: OutfitWithItems) => {
    setIsDeleting(true)
    setVisibleOutfits((current) => current.filter((candidate) => candidate.id !== outfit.id))
    const result = await deleteOutfit(outfit.id)
    if (!result.success) {
      setVisibleOutfits((current) => [...current, outfit])
      toast({ title: 'Error', description: result.error || 'Failed to delete outfit', variant: 'destructive' })
    }
    setIsDeleting(false)
    setOutfitToDelete(null)
  }

  return (
    <div className="space-y-4">
      <header className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Outfits</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Saved combinations for any occasion.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex sm:items-center">
            <OutfitBuilder clothingItems={clothingItems} onCreated={(outfit) => setVisibleOutfits((current) => [outfit, ...current])} triggerClassName="col-span-2 h-11 w-full sm:h-10 sm:w-[132px]" />
            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
              <SelectTrigger className="h-11 w-full sm:h-10 sm:w-36"><SelectValue placeholder="All seasons" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All seasons</SelectItem>
                {SEASONS.map((season) => <SelectItem key={season.value} value={season.value}>{season.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={occasionFilter} onValueChange={setOccasionFilter}>
              <SelectTrigger className="h-11 w-full sm:h-10 sm:w-40"><SelectValue placeholder="Occasion" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All occasions</SelectItem>
                {OUTFIT_OCCASIONS.map((occasion) => <SelectItem key={occasion.value} value={occasion.value}>{occasion.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {itemId && <p className="px-4 text-sm text-zinc-500">Showing outfits that include this item.</p>}

      {filteredOutfits.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">No saved outfits match these filters.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-3 px-4">
          {filteredOutfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit}>
              <Button variant="ghost" size="icon" aria-label={`Delete ${outfit.name}`} onClick={() => setOutfitToDelete(outfit)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </OutfitCard>
          ))}
        </div>
      )}

      <Dialog open={outfitToDelete !== null} onOpenChange={(open) => !open && !isDeleting && setOutfitToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this outfit?</DialogTitle>
            <DialogDescription>
              {outfitToDelete ? `"${outfitToDelete.name}" will be permanently removed.` : 'This outfit will be permanently removed.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOutfitToDelete(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={() => outfitToDelete && void handleDelete(outfitToDelete)} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete outfit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}