'use client'

import { useState } from 'react'
import { createEmailLinkClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface PasswordResetRequestProps {
  email: string
}

export function PasswordResetRequest({ email }: Readonly<PasswordResetRequestProps>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleRequest = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createEmailLinkClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/confirm?next=/reset-password`,
    })

    if (error) {
      const errorMessage = error.message.toLowerCase()
      setError(
        errorMessage.includes('security purposes') || errorMessage.includes('seconds')
          ? 'Please wait at least 60 seconds before requesting another reset email.'
          : error.message
      )
    } else {
      setMessage('Password reset link sent. Check your email.')
    }

    setLoading(false)
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Change Password</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            We&apos;ll email a secure link to {email}.
          </p>
        </div>
        <Button type="button" onClick={handleRequest} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {message && <p className="mt-3 text-sm text-green-600 dark:text-green-400">{message}</p>}
    </div>
  )
}