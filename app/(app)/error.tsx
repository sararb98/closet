'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AppError({ reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500" />
      <h2 className="mt-4 text-xl font-semibold">We couldn&apos;t load this page</h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">Try again to return to your closet.</p>
      <Button className="mt-5" onClick={reset}><RefreshCw className="mr-2 h-4 w-4" />Try again</Button>
    </div>
  )
}