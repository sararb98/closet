import { Suspense } from 'react'
import { getCalendarOutfits } from '@/lib/actions/calendar'
import { getClothingItems } from '@/lib/actions/clothing'
import { CalendarView } from '@/components/calendar/calendar-view'
import { LoadingCalendar } from '@/components/shared/loading'
import { startOfMonth, endOfMonth, format } from 'date-fns'

interface CalendarPageProps {
  searchParams: Promise<{
    item?: string
  }>
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams
  
  // Get current month's outfits
  const currentDate = new Date()
  const startDate = startOfMonth(currentDate)
  const endDate = endOfMonth(currentDate)

  const [outfits, items] = await Promise.all([
    getCalendarOutfits(
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd')
    ),
    getClothingItems(),
  ])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Outfit Calendar
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Plan what to wear each day
        </p>
      </div>

      <Suspense fallback={<LoadingCalendar />}>
        <CalendarView
          outfits={outfits}
          clothingItems={items}
          initialItemId={params.item}
        />
      </Suspense>
    </div>
  )
}
