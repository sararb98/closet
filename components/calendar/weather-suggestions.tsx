'use client'

import { useState } from 'react'
import Image from 'next/image'
import { LocateFixed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ClothingItemWithTags } from '@/types/clothing'

interface WeatherSuggestionsProps { items: ClothingItemWithTags[] }

export function WeatherSuggestions({ items }: Readonly<WeatherSuggestionsProps>) {
  const [temperature, setTemperature] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const loadWeather = () => navigator.geolocation?.getCurrentPosition(async ({ coords }) => {
    setLoading(true); setError(null)
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m`)
      const data = await response.json() as { current?: { temperature_2m?: number } }
      if (typeof data.current?.temperature_2m !== 'number') throw new Error('No current temperature returned')
      setTemperature(data.current.temperature_2m)
    } catch { setError('Weather is unavailable right now.') } finally { setLoading(false) }
  }, () => setError('Location permission is needed for local weather.'))
  let season = 'all-season'
  if (temperature !== null && temperature <= 10) season = 'winter'
  if (temperature !== null && temperature >= 24) season = 'summer'
  const suggestions = temperature === null ? [] : items.filter((item) => item.availability_status === 'clean' && (item.season.includes(season) || item.season.includes('all-season'))).slice(0, 4)
  const weatherDescription = temperature === null
    ? 'Use your location for local conditions.'
    : `${Math.round(temperature)}°C now. Showing clean ${season} pieces.`
  return <section className="border-b border-zinc-200 p-4 dark:border-zinc-800"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Weather-aware picks</h2><p className="text-sm text-zinc-500">{weatherDescription}</p></div><Button variant="outline" onClick={loadWeather} disabled={loading}><LocateFixed className="mr-2 h-4 w-4" />{loading ? 'Checking...' : 'Check weather'}</Button></div>{error && <p className="mt-2 text-sm text-red-600">{error}</p>}{suggestions.length > 0 && <div className="mt-3 flex gap-3 overflow-x-auto">{suggestions.map((item) => <div key={item.id} className="flex w-36 shrink-0 items-center gap-2"><div className="relative h-12 w-12 overflow-hidden rounded"><Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="48px" /></div><p className="truncate text-sm font-medium">{item.name}</p></div>)}</div>}</section>
}