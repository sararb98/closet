'use client'

import { motion } from 'motion/react'
import { Shirt, Calendar, Heart, Tag, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatsCardsProps {
  stats: {
    totalItems: number
    totalWears: number
    favorites: number
    neverWorn: number
    totalOutfits: number
    totalTags: number
    avgWearCount: number
  } | null
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null

  const cards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: Shirt,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Wears',
      value: stats.totalWears,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Favorites',
      value: stats.favorites,
      icon: Heart,
      color: 'bg-red-500',
    },
    {
      title: 'Never Worn',
      value: stats.neverWorn,
      icon: AlertCircle,
      color: 'bg-amber-500',
    },
    {
      title: 'Planned Outfits',
      value: stats.totalOutfits,
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      title: 'Avg. Wears',
      value: stats.avgWearCount,
      icon: Tag,
      color: 'bg-cyan-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-zinc-500">{card.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
