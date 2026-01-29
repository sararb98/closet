import { createClient } from './client'
import { STORAGE_BUCKET } from '../constants'

export async function uploadImage(
  file: File,
  userId: string
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = createClient()
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    return { error: error.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath)

  return { url: publicUrl, path: filePath }
}

export async function deleteImage(path: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path])

  if (error) {
    console.error('Delete error:', error)
    return false
  }

  return true
}

export function getImageUrl(path: string): string {
  const supabase = createClient()
  
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path)

  return publicUrl
}
