'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'

const Spinner = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-12">
    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
    <p className="text-sm text-zinc-500">Signing you in…</p>
  </div>
)

function ConfirmInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const next = searchParams.get('next') ?? '/closet'
    const code = searchParams.get('code')
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type') as 'email' | 'recovery' | 'magiclink' | 'signup' | null

    let redirected = false
    const redirect = (to: string) => {
      if (redirected) return
      redirected = true
      router.replace(to)
    }

    // Primary: listen for auth events fired when Supabase processes the hash fragment
    // (implicit flow) or after an explicit exchange below.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (!session) return
        if (event === 'PASSWORD_RECOVERY') {
          redirect('/reset-password')
        } else if (event === 'SIGNED_IN') {
          redirect(next)
        }
      }
    )

    // Fallback: explicit exchanges for edge-cases (PKCE codes, token_hash from
    // Supabase email templates, or already-existing sessions).
    const handle = async () => {
      // 1. Hash fragment (implicit flow) — @supabase/ssr uses cookie storage so it
      //    does NOT auto-process the URL hash. Parse it manually and call setSession().
      console.log('[confirm] Location hash:', window.location.hash)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = new URLSearchParams(window.location.hash.slice(1))
        const accessToken = hash.get('access_token')
        const refreshToken = hash.get('refresh_token')
        const hashType = hash.get('type')
        const hashError = hash.get('error_description') ?? hash.get('error')

        console.log('[confirm] Parsed hash:', { accessToken: accessToken ? 'exists' : 'missing', refreshToken: refreshToken ? 'exists' : 'missing', hashType, hashError })

        if (hashError) {
          console.log('[confirm] Hash error, redirecting to login')
          redirect('/login?error=' + encodeURIComponent(hashError))
          return
        }

        if (accessToken && refreshToken) {
          console.log('[confirm] Calling setSession with tokens')
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          console.log('[confirm] setSession result:', { error: error?.message ?? 'success' })
          if (!error) {
            // Clear the hash so tokens don't linger in browser history
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
            if (hashType === 'recovery') {
              console.log('[confirm] Recovery type, redirecting to reset-password')
              redirect('/reset-password')
            } else {
              console.log('[confirm] Success, redirecting to', next)
              redirect(next)
            }
            return
          }
          console.log('[confirm] setSession failed, trying other methods')
        }
      }

      console.log('[confirm] No valid hash, trying code/tokenHash/session')
      // 2. PKCE code exchange (OAuth or same-browser flow)
      if (code) {
        console.log('[confirm] Attempting code exchange')
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          console.log('[confirm] Code exchange success')
          return // onAuthStateChange will fire
        }
        console.log('[confirm] Code exchange failed:', error?.message)
      }

      // 3. Token-hash OTP (Supabase email templates with {{ .TokenHash }})
      if (tokenHash && type) {
        console.log('[confirm] Attempting OTP verification')
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (!error) {
          console.log('[confirm] OTP verification success')
          return // onAuthStateChange will fire
        }
        console.log('[confirm] OTP verification failed:', error?.message)
      }

      // 4. Check existing session (prior login, already-processed cookie)
      console.log('[confirm] Checking for existing session')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[confirm] Session check:', session ? 'found' : 'not found')
      if (session) {
        console.log('[confirm] Existing session, redirecting to', next)
        redirect(next)
        return
      }

      // Nothing worked
      console.log('[confirm] All methods failed, redirecting to login')
      redirect('/login?error=Could not authenticate')
    }

    handle()

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <Spinner />
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ConfirmInner />
    </Suspense>
  )
}

