'use client'

import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Plus, Shirt, Calendar, BarChart3 } from 'lucide-react'
import Link from 'next/link'

type IconType = 'shirt' | 'calendar' | 'chart' | 'plus'

export interface EmptyStateProps {
  type?: 'closet' | 'calendar' | 'insights' | 'search'
  icon?: IconType
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

const emptyStates = {
  closet: {
    icon: 'shirt' as IconType,
    title: 'Your closet is empty',
    description: 'Start building your digital wardrobe by adding your first item.',
    action: { label: 'Add your first item', href: '/add' },
  },
  calendar: {
    icon: 'calendar' as IconType,
    title: 'No outfits planned',
    description: 'Plan your outfits by dragging items onto calendar days.',
    action: { label: 'Go to closet', href: '/closet' },
  },
  insights: {
    icon: 'chart' as IconType,
    title: 'No data yet',
    description: 'Start wearing items from your closet to see insights and statistics.',
    action: { label: 'Go to closet', href: '/closet' },
  },
  search: {
    icon: 'shirt' as IconType,
    title: 'No items found',
    description: 'Try adjusting your filters or search terms.',
    action: null,
  },
}

const iconMap: Record<IconType, React.ComponentType<{ className?: string }>> = {
  shirt: Shirt,
  calendar: Calendar,
  chart: BarChart3,
  plus: Plus,
}

export function EmptyState({ 
  type,
  icon,
  title,
  description,
  actionLabel,
  actionHref
}: EmptyStateProps) {
  const state = type ? emptyStates[type] : null
  const iconKey = icon || state?.icon || 'shirt'
  const Icon = iconMap[iconKey]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-zinc-400" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title || state?.title || 'No items found'}
      </h3>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
        {description || state?.description || 'No data to display.'}
      </p>
      {(actionHref || state?.action) && (
        <Button asChild>
          <Link href={actionHref || state?.action?.href || '/'}>
            <Plus className="mr-2 h-4 w-4" />
            {actionLabel || state?.action?.label || 'Action'}
          </Link>
        </Button>
      )}
    </motion.div>
  )
}
