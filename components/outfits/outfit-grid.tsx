'use client'

import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteOutfit } from '@/lib/actions/outfits'
import { OUTFIT_OCCASIONS, OutfitWithItems, SEASONS } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OutfitCard } from './outfit-card'

interface OutfitGridProps {
  outfits: OutfitWithItems[]
  itemId?: string
}

export function OutfitGrid({ outfits, itemId }: Readonly<OutfitGridProps>) {
  const [visibleOutfits, setVisibleOutfits] = useState(outfits)
  const [seasonFilter, setSeasonFilter] = useState('all')
  const [occasionFilter, setOccasionFilter] = useState('all')
  const { toast } = useToast()

  const filteredOutfits = useMemo(() => visibleOutfits.filter((outfit) =>
    (seasonFilter === 'all' || outfit.season.includes(seasonFilter)) &&
    (occasionFilter === 'all' || outfit.occasion === occasionFilter)
  ), [occasionFilter, seasonFilter, visibleOutfits])

  const handleDelete = async (outfit: OutfitWithItems) => {
    setVisibleOutfits((current) => current.filter((candidate) => candidate.id !== outfit.id))
    const result = await deleteOutfit(outfit.id)
    if (!result.success) {
      setVisibleOutfits((current) => [...current, outfit])
      toast({ title: 'Error', description: result.error || 'Failed to delete outfit', variant: 'destructive' })
    }
  }

  if (outfits.length === 0) {
    return <p className="p-4 text-sm text-zinc-500">No saved outfits yet. Select at least two items on a calendar day, then save them as an outfit.</p>
  }

  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <Select value={seasonFilter} onValueChange={setSeasonFilter}>
          <SelectTrigger><SelectValue placeholder="All seasons" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All seasons</SelectItem>
            {SEASONS.map((season) => <SelectItem key={season.value} value={season.value}>{season.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={occasionFilter} onValueChange={setOccasionFilter}>
          <SelectTrigger><SelectValue placeholder="All uses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All uses</SelectItem>
            {OUTFIT_OCCASIONS.map((occasion) => <SelectItem key={occasion.value} value={occasion.value}>{occasion.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {itemId && <p className="text-sm text-zinc-500">Showing outfits that include this item.</p>}

      {filteredOutfits.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">No outfits match these filters.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-3">
          {filteredOutfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit}>
              <Button variant="ghost" size="icon" aria-label={`Delete ${outfit.name}`} onClick={() => void handleDelete(outfit)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </OutfitCard>
          ))}
        </div>
      )}
    </div>
  )
}