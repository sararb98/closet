'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { format } from 'date-fns'
import { X } from 'lucide-react'
import { CalendarDay as CalendarDayType } from '@/types'
import { cn } from '@/lib/utils'

interface CalendarDayProps {
  day: CalendarDayType
  isSelected: boolean
  onClick: () => void
  onRemoveOutfit: (outfitId: string) => void
}

export function CalendarDay({ day, isSelected, onClick, onRemoveOutfit }: CalendarDayProps) {
  const { date, isCurrentMonth, isToday, outfits } = day

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative aspect-square rounded-lg border p-1 transition-colors text-left',
        isCurrentMonth
          ? 'bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600'
          : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400',
        isSelected && 'ring-2 ring-zinc-900 dark:ring-zinc-100',
        isToday && 'border-zinc-900 dark:border-zinc-100'
      )}
    >
      {/* Date number */}
      <span
        className={cn(
          'absolute top-1 left-1.5 text-xs font-medium',
          isToday &&
            'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 w-5 h-5 rounded-full flex items-center justify-center'
        )}
      >
        {format(date, 'd')}
      </span>

      {/* Outfit thumbnails */}
      {outfits.length > 0 && (
        <div className="absolute inset-0 pt-6 p-1 overflow-hidden">
          <div className="flex flex-wrap gap-0.5">
            {outfits.slice(0, 4).map((outfit, index) => (
              <motion.div
                key={outfit.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
                onClick={(e) => e.stopPropagation()}
              >
                {outfit.clothing_item && (
                  <div className="relative w-6 h-6 md:w-8 md:h-8 rounded overflow-hidden">
                    <Image
                      src={outfit.clothing_item.image_url}
                      alt={outfit.clothing_item.name}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                    {/* Remove button on hover */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveOutfit(outfit.id)
                      }}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      <X className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            {outfits.length > 4 && (
              <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <span className="text-[10px] font-medium text-zinc-500">
                  +{outfits.length - 4}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.button>
  )
}
