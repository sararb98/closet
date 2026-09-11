import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

/**
 * Server-side auth callback.
 *
 * Handles token_hash links (from Supabase email templates using {{ .TokenHash }}).
 * PKCE code exchange is handled by the client-side /auth/confirm page instead,
 * because the code_verifier lives in the browser client's cookie storage.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/closet'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      const destination = type === 'recovery' ? '/reset-password' : next
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  // If no token_hash, forward to client-side confirm page to attempt code exchange
  const code = searchParams.get('code')
  if (code) {
    const params = new URLSearchParams({ code })
    if (next !== '/closet') params.set('next', next)
    return NextResponse.redirect(`${origin}/confirm?${params}`)
  }

  // Implicit-flow tokens arrive in the URL fragment, which is never sent to
  // this server route. The confirmation page can read that fragment and set
  // the browser session, so preserve the requested destination there.
  const params = new URLSearchParams()
  if (next !== '/closet') params.set('next', next)
  const confirmUrl = `${origin}/confirm${params.size ? `?${params}` : ''}`
  return NextResponse.redirect(confirmUrl)
}
