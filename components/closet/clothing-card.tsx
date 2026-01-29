'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { Heart, MoreVertical, Pencil, Trash2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ClothingItemWithTags, CLOTHING_TYPES, COLORS } from '@/types'
import { cn } from '@/lib/utils'
import { toggleFavorite } from '@/lib/actions/clothing'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

interface ClothingCardProps {
  item: ClothingItemWithTags
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onSchedule?: () => void
  isDragging?: boolean
}

export function ClothingCard({
  item,
  onClick,
  onEdit,
  onDelete,
  onSchedule,
  isDragging = false,
}: ClothingCardProps) {
  const [isFavorite, setIsFavorite] = useState(item.is_favorite)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const typeInfo = CLOTHING_TYPES.find(t => t.value === item.type)
  const colorInfo = COLORS.find(c => c.value === item.color)

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    
    const newState = !isFavorite
    setIsFavorite(newState) // Optimistic update
    
    const result = await toggleFavorite(item.id, newState)
    
    if (!result.success) {
      setIsFavorite(!newState) // Revert on error
      toast({
        title: 'Error',
        description: result.error || 'Failed to update favorite',
        variant: 'destructive',
      })
    }
    
    setIsLoading(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        scale: isDragging ? 1.05 : 1 
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer',
        isDragging && 'shadow-xl ring-2 ring-zinc-900'
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={item.image_url}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        
        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          disabled={isLoading}
          className={cn(
            'absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm transition-all',
            'opacity-0 group-hover:opacity-100',
            isFavorite && 'opacity-100'
          )}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isFavorite ? 'fill-red-500 text-red-500' : 'text-zinc-500'
            )}
          />
        </button>

        {/* Menu */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {onSchedule && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSchedule(); }}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Wear count badge */}
        {item.wear_count > 0 && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
              {item.wear_count}× worn
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {item.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>{typeInfo?.icon}</span>
          <span>{typeInfo?.label || item.type}</span>
          {colorInfo && (
            <>
              <span>•</span>
              <div
                className="w-3 h-3 rounded-full border border-zinc-200"
                style={{ backgroundColor: colorInfo.hex }}
              />
            </>
          )}
        </div>
        
        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {item.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs"
                style={{ borderColor: tag.color, color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
            {item.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
