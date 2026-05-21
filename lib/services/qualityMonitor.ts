import Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'
import { sendAdminAlert } from './alerts'

const REVIEW_PROMPT_HEADER = `You are a quality assurance reviewer for an AI-powered SMS home assistant. Review the following conversation between the AI assistant and a homeowner. Also review the homeowner's current home details record provided below.`

const REVIEW_PROMPT_INSTRUCTIONS = `
Check for ALL of the following issues and return a JSON object only, with no additional text:

{
  "flagged": true or false,
  "issues": [
    {
      "type": "missed_data_collection",
      "description": "The user mentioned or implied they have a pool but pool-related equipment was never asked about"
    },
    {
      "type": "missed_followup",
      "description": "The user said their AC wasn't cooling properly but the AI never offered to open a claim"
    },
    {
      "type": "hallucinated_coverage",
      "description": "The AI stated something was covered without having warranty document context to support that"
    },
    {
      "type": "unclear_response",
      "description": "The AI response was confusing or likely misunderstood by the user"
    },
    {
      "type": "missed_onboarding_data",
      "description": "The user volunteered information during conversation that should have been saved to home_details but was not"
    },
    {
      "type": "incorrect_advice",
      "description": "The AI gave maintenance advice that was technically incorrect or potentially harmful"
    },
    {
      "type": "missed_upsell",
      "description": "A maintenance reminder was sent but the AI did not offer to help find the right product when it clearly should have"
    }
  ]
}

Return only valid JSON. If there are no issues, return flagged: false and an empty issues array. Include only issues that actually occurred in this conversation — do not invent issues.`

export interface QualityIssue {
  type: string
  description: string
}

export interface QualityReviewResult {
  flagged: boolean
  issues: QualityIssue[]
}

export interface NightlyReviewSummary {
  reviewed: number
  flagged: number
}

function buildPrompt(homeDetailsJson: string, conversationThread: string): string {
  return `${REVIEW_PROMPT_HEADER}

Homeowner's current home details:
${homeDetailsJson}

Conversation from the last 24 hours:
${conversationThread}
${REVIEW_PROMPT_INSTRUCTIONS}`
}

/**
 * Reviews a single user's conversation thread using Claude.
 */
export async function reviewUserConversation(
  client: Anthropic,
  homeDetailsJson: string,
  conversationThread: string,
): Promise<QualityReviewResult> {
  const prompt = buildPrompt(homeDetailsJson, conversationThread)

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content
    .filter(block => block.type === 'text')
    .map(block => (block as { type: 'text'; text: string }).text)
    .join('')

  // Strip any markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()

  const parsed = JSON.parse(cleaned) as QualityReviewResult
  return {
    flagged: parsed.flagged === true,
    issues: Array.isArray(parsed.issues) ? parsed.issues : [],
  }
}

/**
 * Runs the nightly quality review over all conversations from the last 24 hours.
 * Groups conversations by user, sends each user's thread to Claude, and flags
 * conversations with detected issues.
 *
 * @param supabase  Service-role Supabase client (bypasses RLS)
 */
export async function runNightlyQualityReview(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
): Promise<NightlyReviewSummary> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // 1. Pull all conversations from the last 24 hours, paginating in chunks of
  //    PAGE_SIZE to avoid Supabase's default 1,000-row cap silently truncating
  //    high-volume periods.
  const PAGE_SIZE = 1000
  type ConvoRow = { id: string; user_id: string; role: string; content: string; created_at: string }
  const allConversations: ConvoRow[] = []
  let from = 0

  for (;;) {
    const { data, error: convError } = await supabase
      .from('conversations')
      .select('id, user_id, role, content, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (convError) {
      console.error('[QualityMonitor] Failed to fetch conversations:', convError.message)
      await sendAdminAlert('api_failure', null, `Quality review failed to fetch conversations: ${convError.message}`)
      return { reviewed: 0, flagged: 0 }
    }

    if (data && data.length > 0) {
      allConversations.push(...(data as ConvoRow[]))
    }

    // If fewer than PAGE_SIZE rows returned, we have reached the last page.
    if (!data || data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  if (allConversations.length === 0) {
    console.log('[QualityMonitor] No conversations in the last 24 hours.')
    return { reviewed: 0, flagged: 0 }
  }

  // 2. Group by user_id
  const byUser = new Map<string, ConvoRow[]>()
  for (const convo of allConversations) {
    const list = byUser.get(convo.user_id) ?? []
    list.push(convo)
    byUser.set(convo.user_id, list)
  }

  let reviewed = 0
  let flagged = 0

  for (const [userId, messages] of Array.from(byUser)) {
    // 3. Assemble conversation thread
    const thread = messages
      .map(m => {
        const role = m.role === 'user' ? 'Homeowner' : m.role === 'assistant' ? 'Assistant' : 'Staff'
        const ts = new Date(m.created_at).toLocaleString()
        return `[${ts}] ${role}: ${m.content}`
      })
      .join('\n')

    // 4. Pull home_details
    const { data: homeDetails } = await supabase
      .from('home_details')
      .select('*')
      .eq('user_id', userId)
      .single()

    const homeDetailsJson = JSON.stringify(homeDetails ?? {}, null, 2)

    // 5. Send to Claude for review
    let result: QualityReviewResult
    try {
      result = await reviewUserConversation(anthropic, homeDetailsJson, thread)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.error(`[QualityMonitor] Claude API error for user ${userId}:`, errMsg)
      await sendAdminAlert('api_failure', userId, `Quality review Claude API error: ${errMsg}`)
      continue
    }

    reviewed++

    // 6. If flagged, update the most recent conversation row
    if (result.flagged && result.issues.length > 0) {
      flagged++
      const mostRecentId = messages[messages.length - 1].id
      const reason = result.issues.map(i => `[${i.type}] ${i.description}`).join('; ')

      await supabase
        .from('conversations')
        .update({
          ai_quality_flag: true,
          ai_quality_reason: reason,
        })
        .eq('id', mostRecentId)
    }
  }

  console.log(
    `[QualityMonitor] Nightly review complete — reviewed: ${reviewed}, flagged: ${flagged}`,
  )

  return { reviewed, flagged }
}
