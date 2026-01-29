'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MonthlyActivity, TypeDistribution } from '@/lib/actions/insights'
import { CLOTHING_TYPES } from '@/types'

interface ActivityChartProps {
  data: MonthlyActivity[]
}

export function ActivityChart({ data }: ActivityChartProps) {
  if (data.length === 0 || data.every((d) => d.items_worn === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 text-center py-8">
            Plan outfits on your calendar to see activity.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value) => [`${value} items`, 'Worn']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey="items_worn"
                fill="#18181b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface TypeChartProps {
  data: TypeDistribution[]
}

export function TypeChart({ data }: TypeChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Wardrobe Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 text-center py-8">
            Add items to see your wardrobe composition.
          </p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.slice(0, 8).map((item) => {
    const typeInfo = CLOTHING_TYPES.find((t) => t.value === item.type)
    return {
      name: typeInfo?.label || item.type,
      count: item.count,
      icon: typeInfo?.icon || '📦',
    }
  })

  const totalItems = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Wardrobe Composition</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {chartData.map((item, index) => {
            const percentage = (item.count / totalItems) * 100

            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </span>
                  <span className="text-zinc-500">
                    {item.count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
