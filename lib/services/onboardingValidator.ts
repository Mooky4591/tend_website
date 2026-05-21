import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * The full list of home_details fields that must be collected during onboarding.
 * washer_dryer_age_years is conditionally required (only when has_washer_dryer is true).
 */
export const REQUIRED_HOME_DETAIL_FIELDS = [
  'year_built',
  'square_footage',
  'roof_type',
  'roof_age_years',
  'construction_material',
  'hvac_brand',
  'hvac_age_years',
  'hvac_last_service',
  'water_heater_age_years',
  'water_heater_last_flush',
  'electrical_panel_age_years',
  'plumbing_type',
  'has_washer_dryer',
  'washer_dryer_age_years',
  'refrigerator_age_years',
  'dishwasher_age_years',
] as const

export type HomeDetailField = (typeof REQUIRED_HOME_DETAIL_FIELDS)[number]

/** Phrases that indicate a user explicitly said they don't know or don't have a value. */
const UNKNOWN_PHRASES = [
  "i don't know",
  "i dont know",
  "not sure",
  "unknown",
  "i don't have one",
  "i dont have one",
  "not applicable",
  "n/a",
  "no idea",
]

function containsUnknownPhrase(text: string): boolean {
  const lower = text.toLowerCase()
  return UNKNOWN_PHRASES.some(phrase => lower.includes(phrase))
}

export interface OnboardingValidatorResult {
  gaps: string[]
  flagged: boolean
}

/**
 * Runs a completeness check on a user's home_details record immediately after
 * onboarding_complete is set to true. Saves gaps to the users table and logs a summary.
 *
 * @param supabase  Supabase client (service role to bypass RLS)
 * @param userId    The homeowner's user ID
 * @returns         The list of gap field names and whether any were found
 */
export async function validateOnboardingCompleteness(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  userId: string,
): Promise<OnboardingValidatorResult> {
  // 1. Fetch the user's name for logging
  const { data: userRow } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', userId)
    .single()

  const displayName = [userRow?.first_name, userRow?.last_name].filter(Boolean).join(' ') || userId

  // 2. Fetch the home_details record
  const { data: homeDetails } = await supabase
    .from('home_details')
    .select('*')
    .eq('user_id', userId)
    .single()

  // 3. Fetch all user conversations for context (role: 'user' messages only)
  const { data: conversations } = await supabase
    .from('conversations')
    .select('content, role')
    .eq('user_id', userId)
    .eq('role', 'user')
    .order('created_at', { ascending: true })

  const userMessages = (conversations ?? []).map(c => c.content ?? '')

  // 4. Determine which fields are gaps
  const gaps: string[] = []

  for (const field of REQUIRED_HOME_DETAIL_FIELDS) {
    // Skip washer_dryer_age_years unless the user has explicitly confirmed they
    // have a washer/dryer. Null (never answered) and false both bypass this field.
    if (field === 'washer_dryer_age_years') {
      const hasWasherDryer = homeDetails?.has_washer_dryer
      if (hasWasherDryer !== true) continue
    }

    const value = homeDetails?.[field]
    const isMissing = value === null || value === undefined

    if (!isMissing) continue

    // Check if the user ever said they don't know.
    // Field-label co-occurrence is NOT required: in real onboarding flows the user
    // answers "I don't know" to the AI's question, and the field label only appears
    // in the AI's message (which is not in userMessages). Requiring the label here
    // causes false-positive gaps for valid "I don't know" answers.
    const userSaidUnknown = userMessages.some(msg => containsUnknownPhrase(msg))

    if (!userSaidUnknown) {
      gaps.push(field)
    }
  }

  // 5. Persist gaps to the user record
  const flagged = gaps.length > 0
  await supabase
    .from('users')
    .update({
      onboarding_gaps: flagged ? gaps : null,
      onboarding_gap_flagged: flagged,
    })
    .eq('id', userId)

  // 6. Log summary
  if (flagged) {
    console.log(
      `[OnboardingValidator] User "${displayName}" (${userId}) — ${gaps.length} gap(s) found: ${gaps.join(', ')}`,
    )
  } else {
    console.log(
      `[OnboardingValidator] User "${displayName}" (${userId}) — onboarding complete, no gaps.`,
    )
  }

  return { gaps, flagged }
}
