import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ConversationPanel from './ConversationPanel'
import MessageForm from './MessageForm'
import RemindersPanel from './RemindersPanel'

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
        <Link href="/dashboard/users" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to homeowners
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{homeowner.first_name ?? 'Homeowner'}</h1>
        <p className="text-slate-500 text-sm mt-1 font-mono">{homeowner.phone_number}</p>
        {location && <p className="text-slate-500 text-sm">{location}</p>}
        <div className="flex gap-2 mt-2">
          {homeowner.onboarding_complete && (
            <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Onboarding complete</span>
          )}
          {homeowner.opted_out && (
            <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Opted out</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation thread */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 flex flex-col" style={{ minHeight: '500px' }}>
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-700">Conversation</h2>
          </div>
          <ConversationPanel messages={(conversations ?? []) as Parameters<typeof ConversationPanel>[0]['messages']} />
          <MessageForm userId={params.id} />
        </div>

        {/* Reminders */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
          <RemindersPanel reminders={reminders ?? []} userId={params.id} />
        </div>
      </div>
    </div>
  )
}
