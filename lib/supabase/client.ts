'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  // Provide fallback empty strings for build-time static generation
  // The actual values will be available at runtime in the browser
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}
