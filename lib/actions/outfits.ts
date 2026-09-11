'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { compareOutfitItemTypes } from '@/types/clothing'
import type { ClothingItem, Outfit } from '@/types/database'
import type { OutfitOccasion, OutfitWithItems } from '@/types/outfit'

interface OutfitWithRelation extends Outfit {
  outfit_items: Array<{
    position: number
    clothing_item: ClothingItem | null
  }>
}

export async function getOutfits(itemId?: string): Promise<OutfitWithItems[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('outfits')
    .select('*, outfit_items(position, clothing_item:clothing_items(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching outfits:', error)
    return []
  }

  return ((data || []) as unknown as OutfitWithRelation[])
    .map((outfit) => ({
      ...outfit,
      items: outfit.outfit_items
        .map((entry) => entry.clothing_item)
        .filter((item): item is ClothingItem => item !== null)
        .sort(compareOutfitItemTypes),
    }))
    .filter((outfit) => !itemId || outfit.items.some((item) => item.id === itemId))
}

export async function createOutfit(input: {
  name: string
  itemIds: string[]
  season: string[]
  occasion: OutfitOccasion | null
}): Promise<{ success: boolean; error: string | null }> {
  const name = input.name.trim()
  const itemIds = [...new Set(input.itemIds)]
  if (!name) return { success: false, error: 'Enter an outfit name' }
  if (itemIds.length < 2) return { success: false, error: 'Choose at least two items' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: outfit, error: outfitError } = await supabase
    .from('outfits')
    .insert({
      user_id: user.id,
      name,
      season: input.season,
      occasion: input.occasion,
    })
    .select()
    .single()

  if (outfitError || !outfit) {
    console.error('Error creating outfit:', outfitError)
    return { success: false, error: outfitError?.message || 'Failed to create outfit' }
  }

  const { error: itemError } = await supabase.from('outfit_items').insert(
    itemIds.map((itemId, position) => ({ outfit_id: outfit.id, item_id: itemId, position }))
  )

  if (itemError) {
    await supabase.from('outfits').delete().eq('id', outfit.id)
    console.error('Error adding outfit items:', itemError)
    return { success: false, error: itemError.message }
  }

  revalidatePath('/outfits')
  revalidatePath('/closet')
  return { success: true, error: null }
}

export async function deleteOutfit(outfitId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase.from('outfits').delete().eq('id', outfitId).eq('user_id', user.id)
  if (error) {
    console.error('Error deleting outfit:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/outfits')
  revalidatePath('/closet')
  return { success: true, error: null }
}