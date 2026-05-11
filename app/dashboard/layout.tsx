import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from './SignOutButton'
import DashboardNav from './DashboardNav'
import Image from 'next/image'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Image src="/logo.png" alt="Tendr" width={102} height={34} priority />
          <SignOutButton />
        </div>
      </header>
      <DashboardNav />
      <main>{children}</main>
    </div>
  )
}
