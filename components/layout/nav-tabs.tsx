'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Shirt, Calendar, Plus, BarChart3 } from 'lucide-react'

const navItems = [
  { href: '/closet', label: 'Closet', icon: Shirt },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/add', label: 'Add', icon: Plus },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
]

export function NavTabs() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center py-3 px-4 transition-colors',
                isActive
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="relative z-10 h-5 w-5" />
              <span className="relative z-10 text-xs mt-1 font-medium">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
