import { validateOnboardingCompleteness } from '@/lib/services/onboardingValidator'

// Conversation row type used throughout the tests.
// Includes both user and assistant messages — the validator now fetches all roles
// to scope "I don't know" responses to the field the assistant was asking about.
type ConvoRow = { content: string; role: string }

function makeSupabase({
  user = { first_name: 'Jane', last_name: 'Doe' },
  homeDetails = {} as Record<string, unknown> | null,
  conversations = [] as ConvoRow[],
  updateResult = { error: null },
}: {
  user?: { first_name: string; last_name: string } | null
  homeDetails?: Record<string, unknown> | null
  conversations?: ConvoRow[]
  updateResult?: { error: null | { message: string } }
} = {}) {
  const updateFn = jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue(updateResult),
  })

  const fromMap: Record<string, unknown> = {
    users: {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: user }),
        }),
      }),
      update: updateFn,
    },
    home_details: {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: homeDetails }),
        }),
      }),
    },
    // The validator fetches all roles (user + assistant) with pagination:
    // .select().eq('user_id', ...).order(...).range(from, to)
    // Returning fewer than PAGE_SIZE rows causes the loop to stop after one call.
    conversations: {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({ data: conversations }),
          }),
        }),
      }),
    },
  }

  return {
    from: jest.fn((table: string) => fromMap[table]),
    _updateFn: updateFn,
  }
}

// Full home_details with no nulls — reused across several tests.
const FULL_DETAILS = {
  year_built: 1990,
  square_footage: 2000,
  roof_type: 'asphalt',
  roof_age_years: 5,
  construction_material: 'wood',
  hvac_brand: 'Carrier',
  hvac_age_years: 3,
  hvac_last_service: '2025-01-01',
  water_heater_age_years: 4,
  water_heater_last_flush: '2024-06-01',
  electrical_panel_age_years: 10,
  plumbing_type: 'copper',
  has_washer_dryer: true,
  washer_dryer_age_years: 2,
  refrigerator_age_years: 3,
  dishwasher_age_years: 3,
}

describe('validateOnboardingCompleteness', () => {
  const userId = 'user-123'

  it('returns no gaps when all required fields are populated', async () => {
    const supabase = makeSupabase({ homeDetails: FULL_DETAILS })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).toEqual([])
    expect(result.flagged).toBe(false)
  })

  it('returns gaps for null fields when user never said "I don\'t know"', async () => {
    const partialDetails = {
      ...FULL_DETAILS,
      year_built: null,
      square_footage: null,
      roof_age_years: null,
    }
    const supabase = makeSupabase({
      homeDetails: partialDetails,
      conversations: [{ content: 'My house is nice', role: 'user' }],
    })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).toContain('year_built')
    expect(result.gaps).toContain('square_footage')
    expect(result.gaps).toContain('roof_age_years')
    expect(result.flagged).toBe(true)
  })

  it('does NOT include washer_dryer_age_years as a gap when has_washer_dryer is false', async () => {
    const details = { ...FULL_DETAILS, has_washer_dryer: false, washer_dryer_age_years: null }
    const supabase = makeSupabase({ homeDetails: details })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).not.toContain('washer_dryer_age_years')
    expect(result.flagged).toBe(false)
  })

  it('DOES include washer_dryer_age_years as a gap when has_washer_dryer is true and age is null', async () => {
    const details = { ...FULL_DETAILS, washer_dryer_age_years: null }
    const supabase = makeSupabase({ homeDetails: details })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).toContain('washer_dryer_age_years')
  })

  // --- Unknown-response scoping tests ---

  it('skips a null field when the user mentions the field label in their own message', async () => {
    // User message explicitly contains "year built" — suppressed regardless of assistant context.
    const details = { ...FULL_DETAILS, year_built: null }
    const supabase = makeSupabase({
      homeDetails: details,
      conversations: [{ content: "I don't know the year built", role: 'user' }],
    })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).not.toContain('year_built')
    expect(result.flagged).toBe(false)
  })

  it('skips a null field when a bare "I don\'t know" immediately follows an assistant message mentioning the field label', async () => {
    // Core new behaviour: user says bare "I don't know"; field label is only in
    // the preceding assistant question — no label needed in the user's own message.
    const details = { ...FULL_DETAILS, year_built: null }
    const supabase = makeSupabase({
      homeDetails: details,
      conversations: [
        { content: 'What year was your home built? (year built)', role: 'assistant' },
        { content: "I don't know", role: 'user' },
      ],
    })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).not.toContain('year_built')
    expect(result.flagged).toBe(false)
  })

  it('does NOT suppress a null field when "I don\'t know" has no field label context in either message', async () => {
    // Bare "I don't know" with no preceding assistant message mentioning a field →
    // cannot be scoped → the field remains a gap.
    const details = { ...FULL_DETAILS, year_built: null }
    const supabase = makeSupabase({
      homeDetails: details,
      conversations: [{ content: "I don't know", role: 'user' }], // no preceding assistant question
    })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).toContain('year_built')
    expect(result.flagged).toBe(true)
  })

  it('does NOT suppress an unrelated null field when "I don\'t know" is scoped to a different field', async () => {
    // Assistant asks about year_built; user says "I don't know" → only year_built suppressed.
    // square_footage has no "I don't know" context → remains a gap.
    const details = { ...FULL_DETAILS, year_built: null, square_footage: null }
    const supabase = makeSupabase({
      homeDetails: details,
      conversations: [
        { content: 'What year was your home built? (year built)', role: 'assistant' },
        { content: "I don't know", role: 'user' },
      ],
    })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).not.toContain('year_built')
    expect(result.gaps).toContain('square_footage')
    expect(result.flagged).toBe(true)
  })

  it('phrases matched case-insensitively: "Not Sure" after assistant question clears the field', async () => {
    const details = { ...FULL_DETAILS, year_built: null }
    const supabase = makeSupabase({
      homeDetails: details,
      conversations: [
        { content: 'Do you know the year built?', role: 'assistant' },
        { content: 'Not Sure', role: 'user' },
      ],
    })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).not.toContain('year_built')
  })

  it('does NOT include washer_dryer_age_years as a gap when has_washer_dryer is null (never answered)', async () => {
    // Null has_washer_dryer (unanswered) must skip washer_dryer_age_years, not only false.
    const details = {
      ...FULL_DETAILS,
      has_washer_dryer: null,
      washer_dryer_age_years: null,
    }
    const supabase = makeSupabase({ homeDetails: details })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).not.toContain('washer_dryer_age_years')
    // has_washer_dryer IS a gap — it is a required field that is null
    expect(result.gaps).toContain('has_washer_dryer')
  })

  it('persists gaps and onboarding_gap_flagged = true when gaps are found', async () => {
    const details = { ...FULL_DETAILS, year_built: null }
    const updateEq = jest.fn().mockResolvedValue({ error: null })
    const updateFn = jest.fn().mockReturnValue({ eq: updateEq })
    const supabase = makeSupabase({ homeDetails: details })
    ;(supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { first_name: 'Jane', last_name: 'Doe' } }),
            }),
          }),
          update: updateFn,
        }
      }
      if (table === 'home_details') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: details }),
            }),
          }),
        }
      }
      // conversations — no "I don't know" messages, so year_built remains a gap
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({ data: [] }),
            }),
          }),
        }),
      }
    })

    await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)

    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({
        onboarding_gap_flagged: true,
        onboarding_gaps: expect.arrayContaining(['year_built']),
      }),
    )
  })

  it('persists null gaps and onboarding_gap_flagged = false when no gaps', async () => {
    const updateEq = jest.fn().mockResolvedValue({ error: null })
    const updateFn = jest.fn().mockReturnValue({ eq: updateEq })
    const supabase = makeSupabase({ homeDetails: FULL_DETAILS })
    ;(supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { first_name: 'Jane', last_name: 'Doe' } }),
            }),
          }),
          update: updateFn,
        }
      }
      if (table === 'home_details') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: FULL_DETAILS }),
            }),
          }),
        }
      }
      // conversations — all fields populated, no gaps expected
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({ data: [] }),
            }),
          }),
        }),
      }
    })

    await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)

    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({
        onboarding_gap_flagged: false,
        onboarding_gaps: null,
      }),
    )
  })

  it('logs the user name and gap fields', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const supabase = makeSupabase({ homeDetails: null })
    await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Jane Doe'))
    consoleSpy.mockRestore()
  })
})
