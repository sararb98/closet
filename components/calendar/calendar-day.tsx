'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { format } from 'date-fns'
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Plus, Sun } from 'lucide-react'
import { CalendarDay as CalendarDayType, WeatherForecastDay } from '@/types'
import { cn } from '@/lib/utils'

interface CalendarDayProps {
  day: CalendarDayType
  weather?: WeatherForecastDay
  isSelected: boolean
  onClick: () => void
}

function WeatherIcon({ weatherCode }: Readonly<{ weatherCode: number }>) {
  const className = 'h-3 w-3 shrink-0'
  if (weatherCode === 0) return <Sun className={className} />
  if (weatherCode <= 2) return <CloudSun className={className} />
  if (weatherCode === 3) return <Cloud className={className} />
  if (weatherCode <= 48) return <CloudFog className={className} />
  if (weatherCode <= 67) return <CloudRain className={className} />
  if (weatherCode <= 77) return <CloudSnow className={className} />
  if (weatherCode <= 82) return <CloudRain className={className} />
  return <CloudLightning className={className} />
}

export function CalendarDay({ day, weather, isSelected, onClick }: Readonly<CalendarDayProps>) {
  const { date, isCurrentMonth, isToday, outfits } = day

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative min-h-[5.5rem] rounded-lg border p-1 transition-colors text-left sm:min-h-0 sm:aspect-square',
        isCurrentMonth
          ? 'bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600'
          : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400',
        isSelected && 'ring-2 ring-zinc-900 dark:ring-zinc-100',
        isToday && 'border-zinc-900 dark:border-zinc-100'
      )}
    >
      <span
        className={cn(
          'absolute left-1 top-1 text-xs font-medium',
          isToday &&
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
        )}
      >
        {format(date, 'd')}
      </span>
      {weather && (
        <span className="absolute right-1 top-1 hidden shrink-0 items-center gap-px text-[8px] font-medium leading-none text-zinc-600 sm:flex sm:gap-0.5 sm:text-[10px] dark:text-zinc-300" aria-label={`Weather: ${Math.round(weather.high)} degrees high, ${Math.round(weather.low)} degrees low`}>
          <WeatherIcon weatherCode={weather.weatherCode} />
          <span>{Math.round(weather.high)}°</span>
          <span className="hidden sm:inline">/{Math.round(weather.low)}°</span>
        </span>
      )}

      {/* Outfit thumbnails */}
      {outfits.length > 0 && (
        <div className="absolute inset-x-1 bottom-1 top-8 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative grid h-full grid-cols-2 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800"
          >
            {outfits[0].items.slice(0, 4).map((item) => (
              <div key={item.id} className="relative aspect-square">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ))}
            {outfits.length > 1 && (
              <span
                className="absolute bottom-1 right-1 flex h-5 min-w-5 items-center justify-center gap-px rounded-full bg-zinc-950 px-1 text-[10px] font-semibold text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-950"
                aria-label={`${outfits.length - 1} more outfit${outfits.length === 2 ? '' : 's'} planned`}
                title={`${outfits.length - 1} more outfit${outfits.length === 2 ? '' : 's'} planned`}
              >
                <Plus className="h-2.5 w-2.5" aria-hidden="true" />
                {outfits.length - 1}
              </span>
            )}
          </motion.div>
        </div>
      )}
    </motion.button>
  )
}
