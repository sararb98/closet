import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/closet">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Settings
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Manage your preferences and application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                  Theme
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Theme settings coming soon
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                  Notifications
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Notification settings coming soon
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>
                Manage your privacy and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                  Change Password
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Password change options coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
