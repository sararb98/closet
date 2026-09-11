'use client'

import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

let emailLinkClient: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // /confirm handles email-link tokens explicitly. @supabase/ssr forces
        // PKCE internally, so its automatic handler would reject implicit
        // recovery links before that page can establish the session.
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    }
  )
}

// @supabase/ssr always enforces PKCE. Email links are commonly opened in a
// different browser, where that verifier cookie is unavailable, so issue
// those links with the implicit flow and establish the SSR session on /confirm.
export function createEmailLinkClient() {
  if (emailLinkClient) return emailLinkClient

  emailLinkClient = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        detectSessionInUrl: false,
        flowType: 'implicit',
        persistSession: false,
        storageKey: 'closet-email-link',
      },
    }
  )

  return emailLinkClient
}
