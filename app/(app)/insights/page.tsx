import { Suspense } from 'react'
import {
  getMostWornItems,
  getSeasonalUsage,
  getTypeDistribution,
  getColorDistribution,
  getMonthlyActivity,
  getClosetStats,
  getWardrobeValueInsights,
} from '@/lib/actions/insights'
import { StatsCards } from '@/components/insights/stats-cards'
import { MostWornChart } from '@/components/insights/most-worn-chart'
import { SeasonalChart } from '@/components/insights/seasonal-chart'
import { ColorChart } from '@/components/insights/color-chart'
import { ActivityChart } from '@/components/insights/activity-chart'
import { LoadingSpinner } from '@/components/shared/loading'
import { EmptyState } from '@/components/shared/empty-state'
import { ArrowRight, Calendar, CircleAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default async function InsightsPage() {
  const [stats, mostWorn, seasonalUsage, typeDistribution, colorDistribution, monthlyActivity, valueInsights] =
    await Promise.all([
      getClosetStats(),
      getMostWornItems(10),
      getSeasonalUsage(),
      getTypeDistribution(),
      getColorDistribution(),
      getMonthlyActivity(),
      getWardrobeValueInsights(),
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
              icon="chart"
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

              <ColorChart data={colorDistribution} />

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

              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/closet?filter=never-worn" className="block">
                  <Card className="h-full transition-colors hover:border-zinc-400">
                    <CardContent className="flex items-center gap-3 p-4">
                      <CircleAlert className="h-5 w-5 text-amber-600" />
                      <div className="min-w-0 flex-1"><p className="font-medium">{stats.neverWorn} never worn</p><p className="text-sm text-zinc-500">Review items ready for a first wear.</p></div>
                      <ArrowRight className="h-4 w-4" />
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/calendar" className="block">
                  <Card className="h-full transition-colors hover:border-zinc-400">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                      <div className="min-w-0 flex-1"><p className="font-medium">Plan your next outfit</p><p className="text-sm text-zinc-500">Open the calendar to see your schedule.</p></div>
                      <ArrowRight className="h-4 w-4" />
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {valueInsights && <div className="grid gap-3 sm:grid-cols-3">
                <Card><CardContent className="p-4"><p className="text-sm text-zinc-500">Average cost per wear</p><p className="mt-1 text-2xl font-semibold">{valueInsights.averageCostPerWear === null ? 'Add prices' : `$${valueInsights.averageCostPerWear.toFixed(2)}`}</p><p className="mt-1 text-xs text-zinc-500">${valueInsights.trackedValue.toFixed(2)} tracked across your closet.</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-sm text-zinc-500">Category gaps</p><p className="mt-1 font-medium capitalize">{valueInsights.gaps.length ? valueInsights.gaps.join(', ') : 'Well balanced'}</p><p className="mt-1 text-xs text-zinc-500">Types with only one item need a backup.</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-sm text-zinc-500">Closet balance</p><p className="mt-1 font-medium capitalize">{valueInsights.overrepresented ? `${valueInsights.overrepresented} heavy` : 'No dominant type'}</p><p className="mt-1 text-xs text-zinc-500">{valueInsights.unpricedItems} items have no purchase price.</p></CardContent></Card>
              </div>}
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}
