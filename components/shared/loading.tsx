'use client'

import { motion } from 'motion/react'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="h-8 w-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function LoadingCalendar() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-10 w-48 mx-auto" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-6" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}
