'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CalendarOutfit, ClothingItem } from '@/types/database'
import type { CalendarOutfitWithItem } from '@/types/calendar'

interface CalendarOutfitWithRelation extends CalendarOutfit {
  clothing_item: ClothingItem | null
}

export async function getCalendarOutfits(
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
  })).filter(o => o.clothing_item !== null) as CalendarOutfitWithItem[]
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
  })).filter(o => o.clothing_item !== null) as CalendarOutfitWithItem[]
}

export async function addOutfitToCalendar(
  itemId: string,
  date: string,
  notes?: string
): Promise<{ success: boolean; error: string | null }> {
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

  const { error } = await supabase
    .from('calendar_outfits')
    .insert(outfitData as any)

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
  return { success: true, error: null }
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
    .update({ position: newPosition } as any)
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
    } as any)
    .eq('id', outfitId)

  if (error) {
    console.error('Error moving outfit to date:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/calendar')
  return { success: true, error: null }
}
