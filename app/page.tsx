import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams

  // Supabase redirects to the Site URL when /confirm isn't in the Redirect URLs
  // allowlist yet. Forward the code/token_hash to the confirm page so the
  // exchange can happen client-side.
  if (params.code || params.token_hash) {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter((entry): entry is [string, string] => entry[1] !== undefined)
      )
    ).toString()
    redirect(`/confirm?${qs}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/closet')
  } else {
    redirect('/login')
  }
}
