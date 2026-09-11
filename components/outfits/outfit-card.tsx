'use client'

import Image from 'next/image'
import { Check, Link2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { OUTFIT_OCCASIONS, OutfitWithItems, SEASONS } from '@/types'
import type { ClothingType } from '@/types/clothing'
import { cn } from '@/lib/utils'

const PREVIEW_SLOTS: readonly (readonly ClothingType[])[] = [
  ['t-shirt', 'dress', 'shirt', 'blouse', 'sweater', 'jacket', 'coat', 'other'],
  ['accessories', 'bag', 'hat', 'jewelry'],
  ['pants', 'jeans', 'shorts', 'skirt'],
  ['shoes', 'sneakers', 'boots', 'sandals'],
]

interface OutfitCardProps {
  outfit: OutfitWithItems
  variant?: 'gallery' | 'picker' | 'compact'
  selected?: boolean
  onSelect?: () => void
  sourceLabel?: string
  children?: React.ReactNode
}

export function OutfitCard({
  outfit,
  variant = 'gallery',
  selected = false,
  onSelect,
  sourceLabel,
  children,
}: Readonly<OutfitCardProps>) {
  const occasion = OUTFIT_OCCASIONS.find((option) => option.value === outfit.occasion)
  const isSelectable = variant === 'picker'
  const CardElement = isSelectable ? 'label' : 'article'
  const previewSlots = PREVIEW_SLOTS.map((types) =>
    types.map((type) => outfit.items.find((item) => item.type === type) ?? null).find(Boolean) ?? null
  )

  return (
    <CardElement
      className={cn(
        'overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950',
        isSelectable && 'relative block w-full max-w-[12.5rem] cursor-pointer transition-colors hover:border-zinc-500',
        selected && 'border-zinc-950 ring-2 ring-zinc-950/30 dark:border-zinc-50 dark:ring-zinc-50/30'
      )}
    >
      {isSelectable && <input type="checkbox" checked={selected} onChange={onSelect} className="peer sr-only" aria-label={`Select ${outfit.name}`} />}
      <div className={cn('grid grid-cols-2 gap-px bg-zinc-100 dark:bg-zinc-800', variant === 'compact' && 'grid-cols-2')}>
        {previewSlots.map((item, index) => (
          <div key={item?.id ?? `empty-${index}`} className="relative aspect-square bg-zinc-100 dark:bg-zinc-900">
            {item && <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes={variant === 'compact' ? '80px' : '(max-width: 640px) 45vw, 260px'} />}
          </div>
        ))}
      </div>
      {variant !== 'compact' && (
        <div className="flex items-start justify-between gap-3 p-3">
          <div className="min-w-0">
            {sourceLabel && <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500"><Link2 className="h-3 w-3" />{sourceLabel}</p>}
            <div className="flex flex-wrap gap-1">
              {occasion && <Badge variant="secondary">{occasion.label}</Badge>}
              {outfit.season.map((seasonValue) => {
                const season = SEASONS.find((option) => option.value === seasonValue)
                return season ? <Badge key={season.value} variant="outline">{season.label}</Badge> : null
              })}
            </div>
          </div>
          {children}
        </div>
      )}
      {isSelectable && selected && (
        <span aria-hidden className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/60">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-950 shadow-lg"><Check className="h-6 w-6" /></span>
        </span>
      )}
      {isSelectable && selected && <span className="sr-only"><Check />Selected</span>}
    </CardElement>
  )
}