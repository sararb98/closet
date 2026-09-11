'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CalendarOutfit, CalendarOutfitInstance, ClothingItem } from '@/types/database'
import { compareOutfitItemTypes } from '@/types/clothing'
import type { CalendarOutfitWithItem, ScheduledOutfitStatus, ScheduledOutfitWithItems } from '@/types/calendar'
import type { OutfitOccasion } from '@/types/outfit'

interface CalendarOutfitWithRelation extends CalendarOutfit {
  clothing_item: ClothingItem | null
}

interface ScheduledOutfitRelation extends CalendarOutfitInstance {
  calendar_outfit_instance_items: Array<{
    position: number
    clothing_item: ClothingItem | null
  }>
}

export async function getLegacyCalendarOutfits(
  startDate: string,
  endDate: string
): Promise<CalendarOutfitWithItem[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('calendar_outfits')
    .select(`
      *,
      clothing_item:clothing_items (*)
    `)
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('position')

  if (error) {
    console.error('Error fetching calendar outfits:', error)
    return []
  }

  return ((data || []) as unknown as CalendarOutfitWithRelation[]).map(outfit => ({
    ...outfit,
    clothing_item: outfit.clothing_item!
  })).filter(o => o.clothing_item !== null).sort((left, right) =>
    compareOutfitItemTypes(left.clothing_item, right.clothing_item)
  ) as CalendarOutfitWithItem[]
}

export async function getCalendarOutfits(
  startDate: string,
  endDate: string
): Promise<ScheduledOutfitWithItems[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('calendar_outfit_instances')
    .select('*, calendar_outfit_instance_items(position, clothing_item:clothing_items(*))')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('position')

  if (error) {
    console.error('Error fetching scheduled outfits:', error)
    return []
  }

  return ((data || []) as unknown as ScheduledOutfitRelation[]).map((outfit) => ({
    ...outfit,
    status: outfit.status as ScheduledOutfitStatus,
    items: outfit.calendar_outfit_instance_items
      .map((entry) => entry.clothing_item)
      .filter((item): item is ClothingItem => item !== null)
      .sort(compareOutfitItemTypes),
  }))
}

export async function createScheduledOutfit(input: {
  date: string
  itemIds: string[]
  name: string
  season?: string[]
  occasion?: OutfitOccasion | null
  sourceOutfitId?: string | null
}): Promise<{ success: boolean; error: string | null; outfit?: CalendarOutfitInstance }> {
  const itemIds = [...new Set(input.itemIds)]
  const name = input.name.trim()
  if (itemIds.length < 2) return { success: false, error: 'Choose at least two items' }
  if (!name) return { success: false, error: 'Enter an outfit name' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const [{ count: itemCount }, { data: lastInstance }, sourceResult] = await Promise.all([
    supabase.from('clothing_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('archived', false).in('id', itemIds),
    supabase.from('calendar_outfit_instances').select('position').eq('user_id', user.id).eq('date', input.date).order('position', { ascending: false }).limit(1).maybeSingle(),
    input.sourceOutfitId
      ? supabase.from('outfits').select('id').eq('id', input.sourceOutfitId).eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  if (itemCount !== itemIds.length) return { success: false, error: 'One or more selected items are unavailable' }
  if (input.sourceOutfitId && !sourceResult.data) return { success: false, error: 'The original outfit is unavailable' }

  const { data: outfit, error: outfitError } = await supabase
    .from('calendar_outfit_instances')
    .insert({
      user_id: user.id,
      date: input.date,
      name,
      season: input.season || [],
      occasion: input.occasion || null,
      source_outfit_id: input.sourceOutfitId || null,
      position: (lastInstance?.position ?? -1) + 1,
    })
    .select()
    .single()

  if (outfitError || !outfit) {
    console.error('Error creating scheduled outfit:', outfitError)
    return { success: false, error: outfitError?.message || 'Failed to schedule outfit' }
  }

  const { error: itemsError } = await supabase.from('calendar_outfit_instance_items').insert(
    itemIds.map((itemId, position) => ({ calendar_outfit_instance_id: outfit.id, item_id: itemId, position }))
  )
  if (itemsError) {
    await supabase.from('calendar_outfit_instances').delete().eq('id', outfit.id)
    console.error('Error creating scheduled outfit items:', itemsError)
    return { success: false, error: itemsError.message }
  }

  revalidatePath('/calendar')
  return { success: true, error: null, outfit }
}

export async function removeScheduledOutfit(outfitId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase.from('calendar_outfit_instances').delete().eq('id', outfitId).eq('user_id', user.id)
  if (error) {
    console.error('Error removing scheduled outfit:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/calendar')
  return { success: true, error: null }
}

export async function updateScheduledOutfitStatus(
  outfitId: string,
  status: ScheduledOutfitStatus
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('calendar_outfit_instances')
    .update({ status })
    .eq('id', outfitId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating scheduled outfit:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/calendar')
  revalidatePath('/insights')
  return { success: true, error: null }
}

type WearLogItem = Pick<ClothingItem, 'id' | 'wear_count' | 'last_worn_date'>

export async function createQuickWearLog(input: {
  itemId: string
  date: string
}): Promise<{ success: boolean; error: string | null; logId?: string; item?: WearLogItem }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { success: false, error: 'Choose a valid wear date' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: item } = await supabase
    .from('clothing_items')
    .select('id, name')
    .eq('id', input.itemId)
    .eq('user_id', user.id)
    .eq('archived', false)
    .maybeSingle()
  if (!item) return { success: false, error: 'This item is unavailable' }

  const { data: log, error: logError } = await supabase
    .from('calendar_outfit_instances')
    .insert({
      user_id: user.id,
      date: input.date,
      name: `Wear log for ${item.name}`,
      status: 'planned',
      position: 0,
    })
    .select('id')
    .single()
  if (logError || !log) {
    console.error('Error creating quick wear log:', logError)
    return { success: false, error: logError?.message || 'Failed to log wear' }
  }

  const { error: logItemError } = await supabase
    .from('calendar_outfit_instance_items')
    .insert({ calendar_outfit_instance_id: log.id, item_id: item.id, position: 0 })
  if (logItemError) {
    await supabase.from('calendar_outfit_instances').delete().eq('id', log.id)
    console.error('Error adding item to quick wear log:', logItemError)
    return { success: false, error: logItemError.message }
  }

  const { error: statusError } = await supabase
    .from('calendar_outfit_instances')
    .update({ status: 'worn' })
    .eq('id', log.id)
    .eq('user_id', user.id)
  if (statusError) {
    await supabase.from('calendar_outfit_instances').delete().eq('id', log.id)
    console.error('Error marking quick wear log as worn:', statusError)
    return { success: false, error: statusError.message }
  }

  const { data: updatedItem } = await supabase
    .from('clothing_items')
    .select('id, wear_count, last_worn_date')
    .eq('id', item.id)
    .single()

  revalidatePath('/calendar')
  revalidatePath('/closet')
  revalidatePath('/insights')
  return { success: true, error: null, logId: log.id, item: updatedItem || undefined }
}

export async function undoQuickWearLog(logId: string): Promise<{ success: boolean; error: string | null; item?: WearLogItem }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: logItems } = await supabase
    .from('calendar_outfit_instance_items')
    .select('item_id')
    .eq('calendar_outfit_instance_id', logId)

  const { error } = await supabase
    .from('calendar_outfit_instances')
    .delete()
    .eq('id', logId)
    .eq('user_id', user.id)
  if (error) {
    console.error('Error undoing quick wear log:', error)
    return { success: false, error: error.message }
  }

  const itemId = logItems?.[0]?.item_id
  const { data: updatedItem } = itemId
    ? await supabase.from('clothing_items').select('id, wear_count, last_worn_date').eq('id', itemId).maybeSingle()
    : { data: null }

  revalidatePath('/calendar')
  revalidatePath('/closet')
  revalidatePath('/insights')
  return { success: true, error: null, item: updatedItem || undefined }
}

export async function getOutfitsForDate(date: string): Promise<CalendarOutfitWithItem[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('calendar_outfits')
    .select(`
      *,
      clothing_item:clothing_items (*)
    `)
    .eq('user_id', user.id)
    .eq('date', date)
    .order('position')

  if (error) {
    console.error('Error fetching outfits for date:', error)
    return []
  }

  return ((data || []) as unknown as CalendarOutfitWithRelation[]).map(outfit => ({
    ...outfit,
    clothing_item: outfit.clothing_item!
  })).filter(o => o.clothing_item !== null).sort((left, right) =>
    compareOutfitItemTypes(left.clothing_item, right.clothing_item)
  ) as CalendarOutfitWithItem[]
}

export async function addOutfitToCalendar(
  itemId: string,
  date: string,
  notes?: string
): Promise<{ success: boolean; error: string | null; outfit?: CalendarOutfit }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get the next position for this date
  const { data: existingOutfits } = await supabase
    .from('calendar_outfits')
    .select('position')
    .eq('user_id', user.id)
    .eq('date', date)
    .order('position', { ascending: false })
    .limit(1)

  const existingData = existingOutfits as { position: number }[] | null
  const nextPosition = existingData && existingData.length > 0 
    ? existingData[0].position + 1 
    : 0

  const outfitData = {
    user_id: user.id,
    item_id: itemId,
    date,
    position: nextPosition,
    notes,
  }

  const { data, error } = await supabase
    .from('calendar_outfits')
    .insert(outfitData)
    .select()
    .single()

  if (error) {
    // Handle duplicate constraint
    if (error.code === '23505') {
      return { success: false, error: 'This item is already added to this date' }
    }
    console.error('Error adding outfit to calendar:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/calendar')
  revalidatePath('/closet')
  revalidatePath('/insights')
  return { success: true, error: null, outfit: data }
}

export async function removeOutfitFromCalendar(
  outfitId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('calendar_outfits')
    .delete()
    .eq('id', outfitId)

  if (error) {
    console.error('Error removing outfit from calendar:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/calendar')
  revalidatePath('/insights')
  return { success: true, error: null }
}

export async function updateOutfitPosition(
  outfitId: string,
  newPosition: number
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('calendar_outfits')
    .update({ position: newPosition })
    .eq('id', outfitId)

  if (error) {
    console.error('Error updating outfit position:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/calendar')
  return { success: true, error: null }
}

export async function moveOutfitToDate(
  outfitId: string,
  newDate: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get the next position for the new date
  const { data: existingOutfits } = await supabase
    .from('calendar_outfits')
    .select('position')
    .eq('user_id', user.id)
    .eq('date', newDate)
    .order('position', { ascending: false })
    .limit(1)

  const existingData = existingOutfits as { position: number }[] | null
  const nextPosition = existingData && existingData.length > 0 
    ? existingData[0].position + 1 
    : 0

  const { error } = await supabase
    .from('calendar_outfits')
    .update({ 
      date: newDate,
      position: nextPosition 
    })
    .eq('id', outfitId)

  if (error) {
    console.error('Error moving outfit to date:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/calendar')
  return { success: true, error: null }
}
