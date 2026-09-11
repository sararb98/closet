'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { Check, Heart, PackageCheck, Pencil, Trash2, Tag } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClothingItemWithTags, CLOTHING_TYPES, COLORS, SEASONS } from '@/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface ClothingModalProps {
  item: ClothingItemWithTags | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: () => void
  onDelete?: () => void
  onWearToday?: () => void
  isLoggingWear?: boolean
  onAvailabilityChange?: (status: 'clean' | 'laundry' | 'packed') => void
}

export function ClothingModal({
  item,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onWearToday,
  isLoggingWear = false,
  onAvailabilityChange,
}: Readonly<ClothingModalProps>) {
  if (!item) return null

  const typeInfo = CLOTHING_TYPES.find((t) => t.value === item.type)
  const colorInfo = COLORS.find((c) => c.value === item.color)
  const swatchHex = item.color_hex || colorInfo?.hex
  const seasonInfo = item.season?.map((s) => SEASONS.find((season) => season.value === s))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative aspect-square md:aspect-auto md:h-full bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {item.is_favorite && (
                <div className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80">
                  <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-xl">{item.name}</DialogTitle>
                <DialogDescription className="sr-only">Details and actions for this clothing item.</DialogDescription>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <span>{typeInfo?.icon}</span>
                  <span>{typeInfo?.label}</span>
                  {(colorInfo || swatchHex) && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full border border-zinc-200"
                          style={{ backgroundColor: swatchHex }}
                        />
                        <span>{colorInfo?.label}</span>
                      </div>
                    </>
                  )}
                </div>
              </DialogHeader>

              {item.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {item.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-zinc-200 dark:border-zinc-800">
                <div>
                  <p className="text-sm text-zinc-500">Times worn</p>
                  <p className="text-2xl font-semibold">{item.wear_count || 0}</p>
                </div>
                {item.last_worn_date && (
                  <div>
                    <p className="text-sm text-zinc-500">Last worn</p>
                    <p className="text-sm font-medium">{formatDate(item.last_worn_date)}</p>
                  </div>
                )}
              </div>

              {onAvailabilityChange && (
                <div className="space-y-2">
                  <p className="text-sm text-zinc-500">Availability</p>
                  <div className="flex flex-wrap gap-2">
                    {(['clean', 'laundry', 'packed'] as const).map((status) => <Button key={status} type="button" size="sm" variant={item.availability_status === status ? 'secondary' : 'outline'} onClick={() => onAvailabilityChange(status)}>{status === 'clean' ? <PackageCheck className="mr-1 h-4 w-4" /> : null}{status[0].toUpperCase() + status.slice(1)}</Button>)}
                  </div>
                </div>
              )}

              {/* Seasons */}
              {seasonInfo && seasonInfo.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-zinc-500">Seasons</p>
                  <div className="flex flex-wrap gap-2">
                    {seasonInfo.map(
                      (season) =>
                        season && (
                          <Badge
                            key={season.value}
                            variant="secondary"
                            style={{ backgroundColor: `${season.color}20`, color: season.color }}
                          >
                            {season.icon} {season.label}
                          </Badge>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-zinc-500 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Tags
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        style={{ borderColor: tag.color, color: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand & Details */}
              {(item.brand || item.purchase_price) && (
                <div className="space-y-1 text-sm">
                  {item.brand && (
                    <p>
                      <span className="text-zinc-500">Brand:</span> {item.brand}
                    </p>
                  )}
                  {item.purchase_price && (
                    <p>
                      <span className="text-zinc-500">Price:</span> ${item.purchase_price}
                    </p>
                  )}
                  {item.purchase_date && (
                    <p>
                      <span className="text-zinc-500">Purchased:</span>{' '}
                      {formatDate(item.purchase_date)}
                    </p>
                  )}
                </div>
              )}

              {/* Notes */}
              {item.notes && (
                <div className="space-y-1">
                  <p className="text-sm text-zinc-500">Notes</p>
                  <p className="text-sm">{item.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4">
                {onWearToday && (
                  <Button onClick={onWearToday} disabled={isLoggingWear}>
                    <Check className="mr-2 h-4 w-4" />
                    {isLoggingWear ? 'Logging...' : 'Worn today'}
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href={`/outfits?item=${item.id}`} onClick={(event) => event.stopPropagation()}>
                    Outfits
                  </Link>
                </Button>
                {onEdit && (
                  <Button variant="outline" className="flex-1" onClick={onEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button variant="outline" className="text-red-600" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
