'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MostWornItem } from '@/lib/actions/insights'
import { CLOTHING_TYPES } from '@/types'

export interface MostWornChartProps {
  items: MostWornItem[]
}

export function MostWornChart({ items }: MostWornChartProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Most Worn Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 text-center py-8">
            No wear data yet. Start wearing items from your closet!
          </p>
        </CardContent>
      </Card>
    )
  }

  const chartData = items.slice(0, 5).map((item) => ({
    name: item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name,
    wears: item.wear_count,
    image: item.image_url,
    fullName: item.name,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Most Worn Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.slice(0, 5).map((item, index) => {
            const typeInfo = CLOTHING_TYPES.find((t) => t.value === item.type)
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-lg font-bold text-zinc-400 w-6">
                  {index + 1}
                </span>
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-sm text-zinc-500">{typeInfo?.label || item.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{item.wear_count}</p>
                  <p className="text-xs text-zinc-500">wears</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
