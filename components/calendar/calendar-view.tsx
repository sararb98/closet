'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
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
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendarDay } from './calendar-day'
import { ScheduledOutfitPicker } from './scheduled-outfit-picker'
import { ClothingItemWithTags, CalendarDay as CalendarDayType, OutfitWithItems, ScheduledOutfitWithItems, WeatherForecastDay } from '@/types'
import { createScheduledOutfit, removeScheduledOutfit, updateScheduledOutfitStatus } from '@/lib/actions/calendar'
import { useToast } from '@/hooks/use-toast'
import { formatDateForDB } from '@/lib/utils'

interface CalendarViewProps {
  outfits: ScheduledOutfitWithItems[]
  savedOutfits: OutfitWithItems[]
  clothingItems: ClothingItemWithTags[]
  forecast: WeatherForecastDay[]
  initialItemId?: string
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarView({ outfits, savedOutfits, clothingItems, forecast, initialItemId }: Readonly<CalendarViewProps>) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarOutfits, setCalendarOutfits] = useState(outfits)
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date())
  const [isPickerOpen, setIsPickerOpen] = useState(Boolean(initialItemId))
  const { toast } = useToast()
  const forecastByDate = useMemo(() => new Map(forecast.map((day) => [day.date, day])), [forecast])

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
  }, [])

  const handleScheduleOutfit = useCallback(async (input: { itemIds: string[]; sourceOutfitId?: string | null }) => {
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
        title: 'Day plan saved',
        description: `Clothes saved for ${format(selectedDate, 'MMM d, yyyy')}`,
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

  const selectedOutfits = selectedDate ? outfitsByDate.get(formatDateForDB(selectedDate)) || [] : []

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
          <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-6">
        <div>
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => <div key={day} className="py-2 text-center text-sm font-medium text-zinc-500">{day}</div>)}
          </div>
          <motion.div
            key={format(currentMonth, 'MMM-yyyy')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-7 gap-1"
          >
            {calendarDays.map((day) => (
              <CalendarDay key={day.dateString} day={day} weather={forecastByDate.get(day.dateString)} isSelected={selectedDate ? isSameDay(day.date, selectedDate) : false} onClick={() => handleDayClick(day.date)} />
            ))}
          </motion.div>
        </div>

        {selectedDate && (
          <section className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0" aria-label={`Agenda for ${format(selectedDate, 'MMMM d')}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">{format(selectedDate, 'EEEE, MMM d')}</h3>
                <p className="text-sm text-zinc-500">{selectedOutfits.length} plan{selectedOutfits.length === 1 ? '' : 's'} for this day</p>
              </div>
              <Button size="sm" onClick={() => setIsPickerOpen(true)}><Plus className="mr-1 h-4 w-4" />Plan</Button>
            </div>
            <div className="mt-3 space-y-2">
              {selectedOutfits.length === 0 ? (
                <p className="py-4 text-sm text-zinc-500">Nothing planned yet.</p>
              ) : selectedOutfits.map((outfit) => (
                <article key={outfit.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                    {outfit.items[0] && <Image src={outfit.items[0].image_url} alt={outfit.items[0].name} fill className="object-cover" sizes="48px" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{outfit.items.length} selected item{outfit.items.length === 1 ? '' : 's'}</p>
                    <p className="text-xs capitalize text-zinc-500">{outfit.status}{outfit.occasion ? ` · ${outfit.occasion}` : ''}</p>
                  </div>
                  <div className="flex shrink-0">
                    {outfit.status === 'planned' && <Button size="icon" variant="ghost" aria-label="Mark day plan as worn" onClick={() => void handleMarkWorn(outfit.id)}><Check className="h-4 w-4 text-emerald-600" /></Button>}
                    <Button size="icon" variant="ghost" aria-label="Remove day plan" onClick={() => void handleRemoveOutfit(outfit.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Outfit picker dialog */}
      <ScheduledOutfitPicker
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        selectedDate={selectedDate}
        clothingItems={clothingItems}
        savedOutfits={savedOutfits}
        scheduledOutfits={selectedOutfits}
        onSchedule={handleScheduleOutfit}
        onRemove={handleRemoveOutfit}
        onMarkWorn={handleMarkWorn}
        initialItemId={initialItemId}
      />
    </div>
  )
}
