'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RootError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500" />
      <h1 className="mt-4 text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">We couldn&apos;t load this page. Try again to continue.</p>
      <Button className="mt-5" onClick={reset}><RefreshCw className="mr-2 h-4 w-4" />Try again</Button>
    </main>
  )
}