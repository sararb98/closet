import { OutfitGrid } from '@/components/outfits/outfit-grid'
import { getOutfits } from '@/lib/actions/outfits'
import { getClothingItems } from '@/lib/actions/clothing'

interface OutfitsPageProps {
  searchParams: Promise<{ item?: string }>
}

export default async function OutfitsPage({ searchParams }: Readonly<OutfitsPageProps>) {
  const { item } = await searchParams
  const [outfits, clothingItems] = await Promise.all([getOutfits(item), getClothingItems()])

  return (
    <OutfitGrid outfits={outfits} clothingItems={clothingItems} itemId={item} />
  )
}