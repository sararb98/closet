'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ClothingItem, ClothingTag, NewClothingItem, UpdateClothingItem } from '@/types/database'
import type { ClothingItemWithTags } from '@/types/clothing'

interface ItemTagRelation {
  tag_id: string
  clothing_tags: ClothingTag | null
}

interface ClothingItemWithRelations extends ClothingItem {
  item_tags: ItemTagRelation[] | null
}

export async function getClothingItems(): Promise<ClothingItemWithTags[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('clothing_items')
    .select(`
      *,
      item_tags (
        tag_id,
        clothing_tags (*)
      )
    `)
    .eq('user_id', user.id)
    .eq('archived', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clothing items:', error)
    return []
  }

  // Transform the data to include tags array
  return ((data || []) as unknown as ClothingItemWithRelations[]).map(item => ({
    ...item,
    tags: item.item_tags?.map(it => it.clothing_tags).filter((t): t is ClothingTag => t !== null) || []
  }))
}

export async function getArchivedItems(): Promise<ClothingItemWithTags[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('clothing_items')
    .select(`
      *,
      item_tags (
        tag_id,
        clothing_tags (*)
      )
    `)
    .eq('user_id', user.id)
    .eq('archived', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching archived items:', error)
    return []
  }

  // Transform the data to include tags array
  return ((data || []) as unknown as ClothingItemWithRelations[]).map(item => ({
    ...item,
    tags: item.item_tags?.map(it => it.clothing_tags).filter((t): t is ClothingTag => t !== null) || []
  }))
}

export async function getClothingItem(id: string): Promise<ClothingItemWithTags | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('clothing_items')
    .select(`
      *,
      item_tags (
        tag_id,
        clothing_tags (*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching clothing item:', error)
    return null
  }

  const itemData = data as unknown as ClothingItemWithRelations
  return {
    ...itemData,
    tags: itemData.item_tags?.map(it => it.clothing_tags).filter((t): t is ClothingTag => t !== null) || []
  }
}

export async function createClothingItem(
  item: Omit<NewClothingItem, 'user_id'>
): Promise<{ data: ClothingItem | null; error: string | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const insertData = {
    ...item,
    user_id: user.id,
  } as NewClothingItem

  const { data, error } = await supabase
    .from('clothing_items')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating clothing item:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/closet')
  revalidatePath('/calendar')
  return { data, error: null }
}

export async function updateClothingItem(
  id: string,
  updates: UpdateClothingItem
): Promise<{ data: ClothingItem | null; error: string | null }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('clothing_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating clothing item:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/closet')
  revalidatePath('/calendar')
  return { data, error: null }
}

export async function deleteClothingItem(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('clothing_items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting clothing item:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/closet')
  revalidatePath('/calendar')
  return { success: true, error: null }
}

export async function toggleFavorite(
  id: string,
  isFavorite: boolean
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('clothing_items')
    .update({ is_favorite: isFavorite })
    .eq('id', id)

  if (error) {
    console.error('Error toggling favorite:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/closet')
  return { success: true, error: null }
}

export async function setClothingItemsArchived(
  ids: string[],
  archived: boolean
): Promise<{ success: boolean; error: string | null }> {
  if (ids.length === 0) {
    return { success: true, error: null }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('clothing_items')
    .update({ archived })
    .in('id', ids)

  if (error) {
    console.error('Error updating archived status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/closet')
  revalidatePath('/calendar')
  return { success: true, error: null }
}

// Tags
export async function getTags() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('clothing_tags')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  return data || []
}

export async function createTag(
  name: string,
  color?: string
): Promise<{ data: unknown; error: string | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const tagData = {
    user_id: user.id,
    name,
    color: color || '#6366f1',
  }

  const { data, error } = await supabase
    .from('clothing_tags')
    .insert(tagData)
    .select()
    .single()

  if (error) {
    console.error('Error creating tag:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function addTagToItem(
  itemId: string,
  tagId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  
  const itemTagData = {
    item_id: itemId,
    tag_id: tagId,
  }
  
  const { error } = await supabase
    .from('item_tags')
    .insert(itemTagData)

  if (error) {
    console.error('Error adding tag to item:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/closet')
  return { success: true, error: null }
}

export async function removeTagFromItem(
  itemId: string,
  tagId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('item_tags')
    .delete()
    .eq('item_id', itemId)
    .eq('tag_id', tagId)

  if (error) {
    console.error('Error removing tag from item:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/closet')
  return { success: true, error: null }
}
