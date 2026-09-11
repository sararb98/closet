import { OutfitGrid } from '@/components/outfits/outfit-grid'
import { getOutfits } from '@/lib/actions/outfits'

interface OutfitsPageProps {
  searchParams: Promise<{ item?: string }>
}

export default async function OutfitsPage({ searchParams }: OutfitsPageProps) {
  const { item } = await searchParams
  const outfits = await getOutfits(item)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Outfits</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Saved combinations for any occasion.</p>
      </div>
      <OutfitGrid outfits={outfits} itemId={item} />
    </div>
  )
}