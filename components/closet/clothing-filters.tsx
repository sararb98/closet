'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, SlidersHorizontal, X, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ClothingFilters, CLOTHING_TYPES, SEASONS, COLORS, SORT_OPTIONS, SortOption, ClothingTag } from '@/types'
import { cn } from '@/lib/utils'

interface ClothingFiltersProps {
  filters: ClothingFilters
  onFiltersChange: (filters: ClothingFilters) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  tags: ClothingTag[]
  totalCount: number
  filteredCount: number
}

export function ClothingFiltersComponent({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  tags,
  totalCount,
  filteredCount,
}: ClothingFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.type) count++
    if (filters.season) count++
    if (filters.color) count++
    if (filters.tags.length > 0) count++
    if (filters.favorites) count++
    return count
  }, [filters])

  const clearFilters = () => {
    onFiltersChange({
      type: null,
      season: null,
      color: null,
      tags: [],
      search: '',
      favorites: false,
    })
  }

  return (
    <div className="space-y-4">
      {/* Search and controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search items..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter button */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 min-w-5 h-5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              {/* Type filter */}
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) =>
                    onFiltersChange({ ...filters, type: value === 'all' ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {CLOTHING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Season filter */}
              <div className="space-y-2">
                <Label>Season</Label>
                <Select
                  value={filters.season || 'all'}
                  onValueChange={(value) =>
                    onFiltersChange({ ...filters, season: value === 'all' ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All seasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All seasons</SelectItem>
                    {SEASONS.map((season) => (
                      <SelectItem key={season.value} value={season.value}>
                        {season.icon} {season.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color filter */}
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          color: filters.color === color.value ? null : color.value,
                        })
                      }
                      className={cn(
                        'w-6 h-6 rounded-full border-2 transition-all',
                        filters.color === color.value
                          ? 'border-zinc-900 dark:border-zinc-100 scale-110'
                          : 'border-zinc-200 dark:border-zinc-700'
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Tags filter */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={filters.tags.includes(tag.id) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        style={
                          filters.tags.includes(tag.id)
                            ? { backgroundColor: tag.color }
                            : { borderColor: tag.color, color: tag.color }
                        }
                        onClick={() => {
                          const newTags = filters.tags.includes(tag.id)
                            ? filters.tags.filter((t) => t !== tag.id)
                            : [...filters.tags, tag.id]
                          onFiltersChange({ ...filters, tags: newTags })
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorites filter */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="favorites"
                  checked={filters.favorites}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ ...filters, favorites: checked === true })
                  }
                />
                <Label htmlFor="favorites" className="flex items-center gap-1 cursor-pointer">
                  <Star className="h-4 w-4" />
                  Favorites only
                </Label>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active filters display */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-sm text-zinc-500">
              {filteredCount} of {totalCount} items
            </span>
            {filters.type && (
              <Badge variant="secondary" className="gap-1">
                {CLOTHING_TYPES.find((t) => t.value === filters.type)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...filters, type: null })}
                />
              </Badge>
            )}
            {filters.season && (
              <Badge variant="secondary" className="gap-1">
                {SEASONS.find((s) => s.value === filters.season)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...filters, season: null })}
                />
              </Badge>
            )}
            {filters.color && (
              <Badge variant="secondary" className="gap-1">
                {COLORS.find((c) => c.value === filters.color)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...filters, color: null })}
                />
              </Badge>
            )}
            {filters.favorites && (
              <Badge variant="secondary" className="gap-1">
                Favorites
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...filters, favorites: false })}
                />
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
