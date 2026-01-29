'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SeasonalUsage } from '@/lib/actions/insights'
import { SEASONS } from '@/types'

interface SeasonalChartProps {
  data: SeasonalUsage[]
}

export function SeasonalChart({ data }: SeasonalChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seasonal Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 text-center py-8">
            Add season tags to your items to see this chart.
          </p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item) => {
    const seasonInfo = SEASONS.find((s) => s.value === item.season)
    return {
      name: seasonInfo?.label || item.season,
      value: item.count,
      color: seasonInfo?.color || '#6b7280',
      icon: seasonInfo?.icon || '📅',
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Seasonal Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} items`]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.icon}</span>
              <span className="text-zinc-600 dark:text-zinc-400">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
