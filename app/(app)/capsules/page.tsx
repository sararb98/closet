import { getCapsules } from '@/lib/actions/capsules'
import { getClothingItems } from '@/lib/actions/clothing'
import { CapsulePlanner } from '@/components/capsules/capsule-planner'

export default async function CapsulesPage() {
  const [capsules, items] = await Promise.all([getCapsules(), getClothingItems()])
  return <div className="flex h-full flex-col"><div className="border-b border-zinc-200 p-4 dark:border-zinc-800"><h1 className="text-xl font-semibold">Trip Capsules</h1><p className="mt-1 text-sm text-zinc-500">Build a packing list from your closet.</p></div><CapsulePlanner capsules={capsules} items={items} /></div>
}