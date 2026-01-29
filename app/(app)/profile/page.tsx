import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ProfilePage() {
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
          Profile
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {user.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  User ID
                </label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 font-mono">
                  {user.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Account Created
                </label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
