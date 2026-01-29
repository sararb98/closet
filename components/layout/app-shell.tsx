'use client'

import { ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { Header } from './header'
import { NavTabs } from './nav-tabs'

export interface AppShellProps {
  children: ReactNode
  user?: User
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Header user={user} />
      <main className="pb-24 pt-4">
        {children}
      </main>
      <NavTabs />
    </div>
  )
}
