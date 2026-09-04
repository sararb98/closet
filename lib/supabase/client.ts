'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Use implicit flow so magic links and recovery links work from any
        // browser/device/email client — no PKCE code_verifier cookie needed.
        flowType: 'implicit',
      },
    }
  )
}
