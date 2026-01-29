'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendarDay } from './calendar-day'
import { OutfitPicker } from './outfit-picker'
import { CalendarOutfitWithItem, ClothingItemWithTags, CalendarDay as CalendarDayType } from '@/types'
import { addOutfitToCalendar, removeOutfitFromCalendar } from '@/lib/actions/calendar'
import { useToast } from '@/hooks/use-toast'
import { formatDateForDB } from '@/lib/utils'

interface CalendarViewProps {
  outfits: CalendarOutfitWithItem[]
  clothingItems: ClothingItemWithTags[]
  initialItemId?: string
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarView({ outfits, clothingItems, initialItemId }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const { toast } = useToast()

  // Open picker if initialItemId is provided
  useState(() => {
    if (initialItemId) {
      setSelectedDate(new Date())
      setIsPickerOpen(true)
    }
  })

  // Group outfits by date
  const outfitsByDate = useMemo(() => {
    const map = new Map<string, CalendarOutfitWithItem[]>()
    outfits.forEach((outfit) => {
      const existing = map.get(outfit.date) || []
      existing.push(outfit)
      map.set(outfit.date, existing)
    })
    return map
  }, [outfits])

  // Generate calendar days
  const calendarDays = useMemo((): CalendarDayType[] => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days: CalendarDayType[] = []
    let day = startDate

    while (day <= endDate) {
      const dateString = formatDateForDB(day)
      days.push({
        date: day,
        dateString,
        isCurrentMonth: isSameMonth(day, currentMonth),
        isToday: isToday(day),
        outfits: outfitsByDate.get(dateString) || [],
      })
      day = addDays(day, 1)
    }

    return days
  }, [currentMonth, outfitsByDate])

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }, [])

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }, [])

  const handleToday = useCallback(() => {
    setCurrentMonth(new Date())
  }, [])

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date)
    setIsPickerOpen(true)
  }, [])

  const handleAddOutfit = useCallback(async (itemId: string) => {
    if (!selectedDate) return

    const dateString = formatDateForDB(selectedDate)
    const result = await addOutfitToCalendar(itemId, dateString)

    if (result.success) {
      toast({
        title: 'Outfit added',
        description: `Added to ${format(selectedDate, 'MMM d, yyyy')}`,
      })
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to add outfit',
        variant: 'destructive',
      })
    }
  }, [selectedDate, toast])

  const handleRemoveOutfit = useCallback(async (outfitId: string) => {
    const result = await removeOutfitFromCalendar(outfitId)

    if (!result.success) {
      toast({
        title: 'Error',
        description: result.error || 'Failed to remove outfit',
        variant: 'destructive',
      })
    }
  }, [toast])

  return (
    <div className="space-y-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.h2
          key={format(currentMonth, 'MMM-yyyy')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-bold"
        >
          {format(currentMonth, 'MMMM yyyy')}
        </motion.h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-zinc-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <motion.div
        key={format(currentMonth, 'MMM-yyyy')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-7 gap-1"
      >
        {calendarDays.map((day) => (
          <CalendarDay
            key={day.dateString}
            day={day}
            isSelected={selectedDate ? isSameDay(day.date, selectedDate) : false}
            onClick={() => handleDayClick(day.date)}
            onRemoveOutfit={handleRemoveOutfit}
          />
        ))}
      </motion.div>

      {/* Outfit picker dialog */}
      <OutfitPicker
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        selectedDate={selectedDate}
        clothingItems={clothingItems}
        existingOutfits={selectedDate ? outfitsByDate.get(formatDateForDB(selectedDate)) || [] : []}
        onAddOutfit={handleAddOutfit}
        onRemoveOutfit={handleRemoveOutfit}
        initialItemId={initialItemId}
      />
    </div>
  )
}
