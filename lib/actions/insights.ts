'use server'

import { createClient } from '@/lib/supabase/server'

export interface MostWornItem {
  id: string
  name: string
  image_url: string
  wear_count: number
  type: string
}

export interface SeasonalUsage {
  season: string
  count: number
}

export interface TypeDistribution {
  type: string
  count: number
}

export interface ColorDistribution {
  color: string
  count: number
}

export interface MonthlyActivity {
  month: string
  items_worn: number
}

interface SeasonRow {
  season: string[] | null
}

interface TypeRow {
  type: string
}

interface ColorRow {
  color: string | null
}

interface OutfitDateRow {
  date: string
  calendar_outfit_instance_items: Array<{
    clothing_item: { archived: boolean } | null
  }>
}

interface StatsRow {
  id: string
  wear_count: number | null
  is_favorite: boolean
}

export interface WardrobeValueInsights {
  averageCostPerWear: number | null
  trackedValue: number
  unpricedItems: number
  gaps: string[]
  overrepresented: string | null
}

export async function getWardrobeValueInsights(): Promise<WardrobeValueInsights | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('clothing_items').select('type, purchase_price, wear_count').eq('user_id', user.id).eq('archived', false)
  if (error) return null
  const items = data || []
  const pricedItems = items.filter((item) => item.purchase_price !== null)
  const totalWearCost = pricedItems.reduce((sum, item) => sum + Number(item.purchase_price) / Math.max(item.wear_count, 1), 0)
  const counts = items.reduce<Record<string, number>>((result, item) => ({ ...result, [item.type]: (result[item.type] || 0) + 1 }), {})
  const entries = Object.entries(counts).sort((left, right) => right[1] - left[1])
  return {
    averageCostPerWear: pricedItems.length ? Math.round((totalWearCost / pricedItems.length) * 100) / 100 : null,
    trackedValue: pricedItems.reduce((sum, item) => sum + Number(item.purchase_price), 0),
    unpricedItems: items.length - pricedItems.length,
    gaps: entries.filter(([, count]) => count === 1).map(([type]) => type).slice(0, 3),
    overrepresented: entries[0] && entries[0][1] / Math.max(items.length, 1) >= 0.4 ? entries[0][0] : null,
  }
}

export async function getMostWornItems(limit: number = 10): Promise<MostWornItem[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('clothing_items')
    .select('id, name, image_url, wear_count, type')
    .eq('user_id', user.id)
    .eq('archived', false)
    .gt('wear_count', 0)
    .order('wear_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching most worn items:', error)
    return []
  }

  return (data || []) as MostWornItem[]
}

export async function getSeasonalUsage(): Promise<SeasonalUsage[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('clothing_items')
    .select('season')
    .eq('user_id', user.id)
    .eq('archived', false)

  if (error) {
    console.error('Error fetching seasonal usage:', error)
    return []
  }

  // Count seasons (items can have multiple seasons)
  const seasonCounts: Record<string, number> = {}
  const items = (data || []) as SeasonRow[]
  
  items.forEach(item => {
    item.season?.forEach((s: string) => {
      seasonCounts[s] = (seasonCounts[s] || 0) + 1
    })
  })

  return Object.entries(seasonCounts)
    .map(([season, count]) => ({ season, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getTypeDistribution(): Promise<TypeDistribution[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('clothing_items')
    .select('type')
    .eq('user_id', user.id)
    .eq('archived', false)

  if (error) {
    console.error('Error fetching type distribution:', error)
    return []
  }

  // Count types
  const typeCounts: Record<string, number> = {}
  const items = (data || []) as TypeRow[]
  
  items.forEach(item => {
    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1
  })

  return Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

// Groups by the `color` category field (not `color_hex`) so items sampled to
// slightly different exact hexes - e.g. several photos of "burgundy" shoes -
// still roll up into one bucket for analytics instead of fragmenting into
// one slice per unique hex.
export async function getColorDistribution(): Promise<ColorDistribution[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('clothing_items')
    .select('color')
    .eq('user_id', user.id)
    .eq('archived', false)

  if (error) {
    console.error('Error fetching color distribution:', error)
    return []
  }

  const colorCounts: Record<string, number> = {}
  const items = (data || []) as ColorRow[]

  items.forEach(item => {
    if (!item.color) return
    colorCounts[item.color] = (colorCounts[item.color] || 0) + 1
  })

  return Object.entries(colorCounts)
    .map(([color, count]) => ({ color, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getMonthlyActivity(months: number = 6): Promise<MonthlyActivity[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months + 1)
  startDate.setDate(1)

  const { data, error } = await supabase
    .from('calendar_outfit_instances')
    .select('date, calendar_outfit_instance_items(clothing_item:clothing_items(archived))')
    .eq('user_id', user.id)
    .eq('status', 'worn')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])

  if (error) {
    console.error('Error fetching monthly activity:', error)
    return []
  }

  // Group by month
  const monthCounts: Record<string, number> = {}
  
  // Initialize all months
  for (let i = 0; i < months; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    monthCounts[monthKey] = 0
  }

  // Count non-archived worn items per month.
  const outfits = (data || []) as unknown as OutfitDateRow[]
  outfits.forEach(outfit => {
    const date = new Date(outfit.date)
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    if (monthCounts[monthKey] !== undefined) {
      monthCounts[monthKey] += outfit.calendar_outfit_instance_items.filter((item) => !item.clothing_item?.archived).length
    }
  })

  return Object.entries(monthCounts)
    .map(([month, items_worn]) => ({ month, items_worn }))
    .reverse()
}

export async function getClosetStats() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [itemsResult, outfitsResult, tagsResult] = await Promise.all([
    supabase
      .from('clothing_items')
      .select('id, wear_count, is_favorite')
      .eq('user_id', user.id)
      .eq('archived', false),
    supabase
      .from('calendar_outfit_instances')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'worn'),
    supabase
      .from('clothing_tags')
      .select('id')
      .eq('user_id', user.id)
  ])

  const items = (itemsResult.data || []) as StatsRow[]
  const totalItems = items.length
  const totalWears = items.reduce((sum, item) => sum + (item.wear_count || 0), 0)
  const favorites = items.filter(item => item.is_favorite).length
  const neverWorn = items.filter(item => !item.wear_count || item.wear_count === 0).length

  return {
    totalItems,
    totalWears,
    favorites,
    neverWorn,
    totalOutfits: outfitsResult.data?.length || 0,
    totalTags: tagsResult.data?.length || 0,
    avgWearCount: totalItems > 0 ? Math.round((totalWears / totalItems) * 10) / 10 : 0
  }
}
