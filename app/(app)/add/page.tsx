import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getClothingItem } from '@/lib/actions/clothing'
import { ItemForm } from '@/components/forms/item-form'
import { LoadingSpinner } from '@/components/shared/loading'

export const dynamic = 'force-dynamic'

interface AddPageProps {
  searchParams: Promise<{
    edit?: string
  }>
}

export default async function AddPage({ searchParams }: AddPageProps) {
  const params = await searchParams
  const editId = params.edit

  // If editing, fetch the item
  let editItem = null
  if (editId) {
    editItem = await getClothingItem(editId)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {editItem ? 'Edit Item' : 'Add New Item'}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          {editItem
            ? 'Update your clothing item details'
            : 'Add a new piece to your wardrobe'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Suspense fallback={<LoadingSpinner />}>
          <ItemForm item={editItem} />
        </Suspense>
      </div>
    </div>
  )
}
