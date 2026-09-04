'use client'

import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ColorDistribution } from '@/lib/actions/insights'
import { COLORS } from '@/types'

interface ColorChartProps {
  data: ColorDistribution[]
}

export function ColorChart({ data }: ColorChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Color Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 text-center py-8">
            Add colors to your items to see this chart.
          </p>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Color Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((entry, index) => {
            const colorInfo = COLORS.find((c) => c.value === entry.color)

            return (
              <motion.div
                key={entry.color}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <div
                  className="h-4 w-4 rounded-full shrink-0 border border-zinc-200 dark:border-zinc-700"
                  style={{ background: colorInfo?.hex || '#6b7280' }}
                />
                <span className="w-16 shrink-0 text-sm text-zinc-600 dark:text-zinc-400 truncate">
                  {colorInfo?.label || entry.color}
                </span>
                <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: colorInfo?.hex || '#6b7280' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(entry.count / maxCount) * 100}%` }}
                    transition={{ delay: index * 0.05 + 0.1, duration: 0.4 }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {entry.count}
                </span>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
