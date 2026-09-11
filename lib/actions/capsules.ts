'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Capsule, ClothingItem } from '@/types/database'

export interface CapsuleWithItems extends Capsule {
  items: ClothingItem[]
}

interface CapsuleRelation extends Capsule {
  capsule_items: Array<{ clothing_item: ClothingItem | null }>
}

export async function getCapsules(): Promise<CapsuleWithItems[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('capsules')
    .select('*, capsule_items(clothing_item:clothing_items(*))')
    .eq('user_id', user.id)
    .order('start_date')
  if (error) {
    console.error('Error fetching capsules:', error)
    return []
  }

  return ((data || []) as unknown as CapsuleRelation[]).map((capsule) => ({
    ...capsule,
    items: capsule.capsule_items.map((entry) => entry.clothing_item).filter((item): item is ClothingItem => item !== null),
  }))
}

export async function createCapsule(input: { name: string; startDate: string; endDate: string; notes?: string }): Promise<{ success: boolean; error: string | null; capsule?: Capsule }> {
  const name = input.name.trim()
  if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(input.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(input.endDate) || input.endDate < input.startDate) {
    return { success: false, error: 'Enter a name and valid trip dates' }
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  const { data, error } = await supabase.from('capsules').insert({ user_id: user.id, name, start_date: input.startDate, end_date: input.endDate, notes: input.notes?.trim() || null }).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath('/capsules')
  return { success: true, error: null, capsule: data }
}

export async function setCapsuleItem(capsuleId: string, itemId: string, included: boolean): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  const { data: capsule } = await supabase.from('capsules').select('id').eq('id', capsuleId).eq('user_id', user.id).maybeSingle()
  if (!capsule) return { success: false, error: 'Trip not found' }
  const result = included
    ? await supabase.from('capsule_items').insert({ capsule_id: capsuleId, item_id: itemId })
    : await supabase.from('capsule_items').delete().eq('capsule_id', capsuleId).eq('item_id', itemId)
  if (result.error) return { success: false, error: result.error.message }
  revalidatePath('/capsules')
  return { success: true, error: null }
}

export async function deleteCapsule(capsuleId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  const { error } = await supabase.from('capsules').delete().eq('id', capsuleId).eq('user_id', user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/capsules')
  return { success: true, error: null }
}