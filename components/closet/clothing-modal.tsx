'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { X, Heart, Pencil, Trash2, Calendar, Tag } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClothingItemWithTags, CLOTHING_TYPES, COLORS, SEASONS } from '@/types'
import { formatDate, cn } from '@/lib/utils'

interface ClothingModalProps {
  item: ClothingItemWithTags | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: () => void
  onDelete?: () => void
}

export function ClothingModal({
  item,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ClothingModalProps) {
  if (!item) return null

  const typeInfo = CLOTHING_TYPES.find((t) => t.value === item.type)
  const colorInfo = COLORS.find((c) => c.value === item.color)
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
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <span>{typeInfo?.icon}</span>
                  <span>{typeInfo?.label}</span>
                  {colorInfo && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full border border-zinc-200"
                          style={{ backgroundColor: colorInfo.hex }}
                        />
                        <span>{colorInfo.label}</span>
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
              <div className="flex gap-2 pt-4">
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
