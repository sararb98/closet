'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'motion/react'
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
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendarDay } from './calendar-day'
import { ScheduledOutfitPicker } from './scheduled-outfit-picker'
import { ClothingItemWithTags, CalendarDay as CalendarDayType, OutfitWithItems, ScheduledOutfitWithItems } from '@/types'
import { createScheduledOutfit, removeScheduledOutfit, updateScheduledOutfitStatus } from '@/lib/actions/calendar'
import { useToast } from '@/hooks/use-toast'
import { formatDateForDB } from '@/lib/utils'

interface CalendarViewProps {
  outfits: ScheduledOutfitWithItems[]
  savedOutfits: OutfitWithItems[]
  clothingItems: ClothingItemWithTags[]
  initialItemId?: string
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarView({ outfits, savedOutfits, clothingItems, initialItemId }: Readonly<CalendarViewProps>) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarOutfits, setCalendarOutfits] = useState(outfits)
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => initialItemId ? new Date() : null)
  const [isPickerOpen, setIsPickerOpen] = useState(Boolean(initialItemId))
  const { toast } = useToast()

  // Group outfits by date
  const outfitsByDate = useMemo(() => {
    const map = new Map<string, ScheduledOutfitWithItems[]>()
    calendarOutfits.forEach((outfit) => {
      const existing = map.get(outfit.date) || []
      existing.push(outfit)
      map.set(outfit.date, existing)
    })
    return map
  }, [calendarOutfits])

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

  const handleScheduleOutfit = useCallback(async (input: { itemIds: string[]; name: string; sourceOutfitId?: string | null }) => {
    if (!selectedDate) return false

    const dateString = formatDateForDB(selectedDate)
    const items = clothingItems.filter((item) => input.itemIds.includes(item.id))
    if (items.length !== input.itemIds.length) return false

    const optimisticId = `optimistic-${Date.now()}`
    const optimisticOutfit: ScheduledOutfitWithItems = {
      id: optimisticId,
      user_id: 'optimistic',
      date: dateString,
      source_outfit_id: input.sourceOutfitId || null,
      name: input.name,
      season: [],
      occasion: null,
      notes: null,
      status: 'planned',
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items,
    }
    setCalendarOutfits((current) => [...current, optimisticOutfit])
    const result = await createScheduledOutfit({ date: dateString, ...input })

    if (result.success && result.outfit) {
      setCalendarOutfits((current) => current.map((outfit) =>
        outfit.id === optimisticId ? { ...result.outfit!, status: 'planned', items } : outfit
      ))
      toast({
        title: 'Outfit scheduled',
        description: `Scheduled for ${format(selectedDate, 'MMM d, yyyy')}`,
      })
      return true
    }

    setCalendarOutfits((current) => current.filter((outfit) => outfit.id !== optimisticId))
    toast({
      title: 'Error',
      description: result.error || 'Failed to add outfit',
      variant: 'destructive',
    })
    return false
  }, [clothingItems, selectedDate, toast])

  const handleRemoveOutfit = useCallback(async (outfitId: string) => {
    const removedOutfit = calendarOutfits.find((outfit) => outfit.id === outfitId)
    setCalendarOutfits((current) => current.filter((outfit) => outfit.id !== outfitId))
    const result = await removeScheduledOutfit(outfitId)

    if (!result.success) {
      if (removedOutfit) {
        setCalendarOutfits((current) => [...current, removedOutfit])
      }
      toast({
        title: 'Error',
        description: result.error || 'Failed to remove outfit',
        variant: 'destructive',
      })
      return false
    }
    return true
  }, [calendarOutfits, toast])

  const handleMarkWorn = useCallback(async (outfitId: string) => {
    const existing = calendarOutfits.find((outfit) => outfit.id === outfitId)
    if (!existing) return false
    setCalendarOutfits((current) => current.map((outfit) => outfit.id === outfitId ? { ...outfit, status: 'worn' } : outfit))
    const result = await updateScheduledOutfitStatus(outfitId, 'worn')
    if (!result.success) {
      setCalendarOutfits((current) => current.map((outfit) => outfit.id === outfitId ? existing : outfit))
      toast({ title: 'Error', description: result.error || 'Failed to mark outfit as worn', variant: 'destructive' })
      return false
    }
    return true
  }, [calendarOutfits, toast])

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
          />
        ))}
      </motion.div>

      {/* Outfit picker dialog */}
      <ScheduledOutfitPicker
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        selectedDate={selectedDate}
        clothingItems={clothingItems}
        savedOutfits={savedOutfits}
        scheduledOutfits={selectedDate ? outfitsByDate.get(formatDateForDB(selectedDate)) || [] : []}
        onSchedule={handleScheduleOutfit}
        onRemove={handleRemoveOutfit}
        onMarkWorn={handleMarkWorn}
        initialItemId={initialItemId}
      />
    </div>
  )
}
