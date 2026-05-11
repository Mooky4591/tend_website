import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ConversationPanel from './ConversationPanel'
import MessageForm from './MessageForm'
import RemindersPanel from './RemindersPanel'
import PhoneNumberEditor from './PhoneNumberEditor'

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: homeowner },
    { data: conversations },
    { data: reminders },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('id, first_name, phone_number, address, city, state, zip, onboarding_complete, opted_out')
      .eq('id', params.id)
      .single(),
    supabase
      .from('conversations')
      .select('id, role, content, created_at')
      .eq('user_id', params.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('reminders')
      .select('id, reminder_type, due_date, sent')
      .eq('user_id', params.id)
      .order('due_date', { ascending: true }),
  ])

  if (!homeowner) notFound()

  const location = [homeowner.address, homeowner.city, homeowner.state, homeowner.zip]
    .filter(Boolean).join(', ')

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link href="/dashboard/users" className="text-sm text-muted-foreground/60 hover:text-muted-foreground">
          ← Back to homeowners
        </Link>
      </div>

      <div className="mb-6">
        <div className="bg-white rounded-2xl border border-border/20 p-4 lg:max-w-2xl">
          <h1 className="text-2xl font-bold text-foreground mb-2">{homeowner.first_name ?? 'Homeowner'}</h1>
          {(homeowner.onboarding_complete || homeowner.opted_out) && (
            <div className="flex gap-2 mb-4">
              {homeowner.onboarding_complete && (
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-success/10 text-success">Onboarding complete</span>
              )}
              {homeowner.opted_out && (
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-error/10 text-error">Opted out</span>
              )}
            </div>
          )}
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Homeowner Information</h2>
          <PhoneNumberEditor userId={params.id} phoneNumber={homeowner.phone_number} />
          {location && <p className="text-muted-foreground/60 text-sm mt-2">{location}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation thread */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border/20 flex flex-col" style={{ minHeight: '500px' }}>
          <div className="px-4 py-3 border-b border-border/20">
            <h2 className="text-sm font-semibold text-muted-foreground">Conversation</h2>
          </div>
          <ConversationPanel messages={(conversations ?? []) as Parameters<typeof ConversationPanel>[0]['messages']} />
          <MessageForm userId={params.id} />
        </div>

        {/* Reminders */}
        <div className="bg-muted rounded-2xl border border-border/20 p-4">
          <RemindersPanel reminders={reminders ?? []} userId={params.id} />
        </div>
      </div>
    </div>
  )
}
