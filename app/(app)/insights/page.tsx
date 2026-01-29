import { Suspense } from 'react'
import {
  getMostWornItems,
  getSeasonalUsage,
  getTypeDistribution,
  getMonthlyActivity,
  getClosetStats,
} from '@/lib/actions/insights'
import { StatsCards } from '@/components/insights/stats-cards'
import { MostWornChart } from '@/components/insights/most-worn-chart'
import { SeasonalChart } from '@/components/insights/seasonal-chart'
import { ActivityChart } from '@/components/insights/activity-chart'
import { LoadingSpinner } from '@/components/shared/loading'
import { EmptyState } from '@/components/shared/empty-state'
import { BarChart3 } from 'lucide-react'

export default async function InsightsPage() {
  const [stats, mostWorn, seasonalUsage, typeDistribution, monthlyActivity] =
    await Promise.all([
      getClosetStats(),
      getMostWornItems(10),
      getSeasonalUsage(),
      getTypeDistribution(),
      getMonthlyActivity(),
    ])

  const hasData = stats && stats.totalItems > 0

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Wardrobe Insights
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Discover patterns in your clothing choices
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<LoadingSpinner />}>
          {!hasData ? (
            <EmptyState
              icon={BarChart3}
              title="No data yet"
              description="Add items to your closet and start planning outfits to see insights about your wardrobe."
              actionLabel="Add Your First Item"
              actionHref="/add"
            />
          ) : stats && (
            <div className="p-4 space-y-6">
              <StatsCards stats={stats} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MostWornChart items={mostWorn} />
                <SeasonalChart data={seasonalUsage} />
              </div>

              <ActivityChart data={monthlyActivity} />

              {typeDistribution.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                    Items by Type
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {typeDistribution.map((item) => (
                      <div
                        key={item.type}
                        className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 text-center"
                      >
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                          {item.count}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">
                          {item.type.replace('_', ' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}
