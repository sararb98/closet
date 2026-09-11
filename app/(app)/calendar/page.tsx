import { Suspense } from 'react'
import { getCalendarOutfits } from '@/lib/actions/calendar'
import { getClothingItems } from '@/lib/actions/clothing'
import { getOutfits } from '@/lib/actions/outfits'
import { CalendarView } from '@/components/calendar/calendar-view'
import { LoadingCalendar } from '@/components/shared/loading'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { WeatherForecastDay } from '@/types/calendar'

interface CalendarPageProps {
  searchParams: Promise<{
    item?: string
  }>
}

async function getValenciaForecast(): Promise<WeatherForecastDay[]> {
  try {
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=39.4699&longitude=-0.3763&daily=weather_code,temperature_2m_max,temperature_2m_min&past_days=7&forecast_days=7&timezone=Europe%2FMadrid',
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return []

    const data = await response.json() as {
      daily?: { time?: string[]; weather_code?: number[]; temperature_2m_max?: number[]; temperature_2m_min?: number[] }
    }
    const daily = data.daily
    if (!daily?.time || !daily.weather_code || !daily.temperature_2m_max || !daily.temperature_2m_min) return []

    return daily.time.flatMap((date, index) => {
      const high = daily.temperature_2m_max?.[index]
      const low = daily.temperature_2m_min?.[index]
      const weatherCode = daily.weather_code?.[index]
      return typeof high === 'number' && typeof low === 'number' && typeof weatherCode === 'number'
        ? [{ date, high, low, weatherCode }]
        : []
    })
  } catch {
    return []
  }
}

export default async function CalendarPage({ searchParams }: Readonly<CalendarPageProps>) {
  const params = await searchParams
  
  // Get current month's outfits
  const currentDate = new Date()
  const startDate = startOfMonth(currentDate)
  const endDate = endOfMonth(currentDate)

  const [outfits, items, savedOutfits, forecast] = await Promise.all([
    getCalendarOutfits(
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd')
    ),
    getClothingItems(),
    getOutfits(),
    getValenciaForecast(),
  ])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div><h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Outfit Calendar
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Plan what to wear each day
        </p></div><Button variant="outline" size="sm" asChild><Link href="/capsules">Plan a trip</Link></Button>
      </div>

      <Suspense fallback={<LoadingCalendar />}>
        <CalendarView
          outfits={outfits}
          savedOutfits={savedOutfits}
          clothingItems={items}
          forecast={forecast}
          initialItemId={params.item}
        />
      </Suspense>
    </div>
  )
}
