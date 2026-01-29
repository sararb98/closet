import { Suspense } from 'react'
import { getClothingItems, getTags } from '@/lib/actions/clothing'
import { ClothingGrid } from '@/components/closet/clothing-grid'
import { LoadingGrid } from '@/components/shared/loading'
import { EmptyState } from '@/components/shared/empty-state'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ClosetPage() {
  const [items, tags] = await Promise.all([
    getClothingItems(),
    getTags(),
  ])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          My Closet
        </h1>
        <Link href="/add">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </Link>
      </div>

      <Suspense fallback={<LoadingGrid />}>
        {items.length === 0 ? (
          <EmptyState
            icon="shirt"
            title="Your closet is empty"
            description="Start building your wardrobe by adding your first clothing item."
            actionLabel="Add Your First Item"
            actionHref="/add"
          />
        ) : (
          <ClothingGrid items={items} tags={tags} />
        )}
      </Suspense>
    </div>
  )
}
