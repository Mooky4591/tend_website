import { validateOnboardingCompleteness } from '@/lib/services/onboardingValidator'

function makeSupabase({
  user = { first_name: 'Jane', last_name: 'Doe' },
  homeDetails = {} as Record<string, unknown> | null,
  conversations = [] as Array<{ content: string; role: string }>,
  updateResult = { error: null },
}: {
  user?: { first_name: string; last_name: string } | null
  homeDetails?: Record<string, unknown> | null
  conversations?: Array<{ content: string; role: string }>
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
    conversations: {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: conversations }),
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

describe('validateOnboardingCompleteness', () => {
  const userId = 'user-123'

  it('returns no gaps when all required fields are populated', async () => {
    const fullDetails = {
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
    const supabase = makeSupabase({ homeDetails: fullDetails })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).toEqual([])
    expect(result.flagged).toBe(false)
  })

  it('returns gaps for null fields when user never said "I don\'t know"', async () => {
    const partialDetails = {
      year_built: null,
      square_footage: null,
      roof_type: 'asphalt',
      roof_age_years: null,
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
    const details = {
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
      has_washer_dryer: false,
      washer_dryer_age_years: null, // null but should be skipped
      refrigerator_age_years: 3,
      dishwasher_age_years: 3,
    }
    const supabase = makeSupabase({ homeDetails: details })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).not.toContain('washer_dryer_age_years')
    expect(result.flagged).toBe(false)
  })

  it('DOES include washer_dryer_age_years as a gap when has_washer_dryer is true and age is null', async () => {
    const details = {
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
      washer_dryer_age_years: null,
      refrigerator_age_years: 3,
      dishwasher_age_years: 3,
    }
    const supabase = makeSupabase({ homeDetails: details })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).toContain('washer_dryer_age_years')
  })

  it('skips a null field (no gap) when the user says "I don\'t know" without mentioning the field label', async () => {
    // Core new behaviour: the field label is NOT required in the user's message.
    // In real onboarding flows the field name appears in the AI's question; the user
    // just replies "I don't know", and that bare phrase is sufficient to suppress the gap.
    const details = {
      year_built: null, // null — user's bare "I don't know" should suppress this
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
    const supabase = makeSupabase({
      homeDetails: details,
      conversations: [{ content: "I don't know", role: 'user' }], // no field label
    })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).not.toContain('year_built')
    expect(result.flagged).toBe(false)
  })

  it('suppresses all null fields when any user message contains an unknown phrase', async () => {
    // A single "I don't know" response in the conversation clears all null fields,
    // because we cannot determine which AI question the response was answering without
    // inspecting assistant-role messages (which are not in userMessages).
    const details = {
      year_built: null,
      square_footage: null,
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
      has_washer_dryer: false,
      washer_dryer_age_years: null,
      refrigerator_age_years: 3,
      dishwasher_age_years: 3,
    }
    const supabase = makeSupabase({
      homeDetails: details,
      conversations: [{ content: "I don't know", role: 'user' }],
    })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).not.toContain('year_built')
    expect(result.gaps).not.toContain('square_footage')
    expect(result.flagged).toBe(false)
  })

  it('does NOT include washer_dryer_age_years as a gap when has_washer_dryer is null (never answered)', async () => {
    // Verifies the P2 fix: null has_washer_dryer (unanswered) must also skip
    // washer_dryer_age_years, not only false.
    const details = {
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
      has_washer_dryer: null,         // never answered
      washer_dryer_age_years: null,   // null but should be skipped
      refrigerator_age_years: 3,
      dishwasher_age_years: 3,
    }
    const supabase = makeSupabase({ homeDetails: details })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    // washer_dryer_age_years must not appear — the washer/dryer question is unanswered
    expect(result.gaps).not.toContain('washer_dryer_age_years')
    // has_washer_dryer IS a gap — it is a required field that is null
    expect(result.gaps).toContain('has_washer_dryer')
  })

  it('persists gaps and onboarding_gap_flagged = true when gaps are found', async () => {
    const details = {
      year_built: null,
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
      has_washer_dryer: false,
      washer_dryer_age_years: null,
      refrigerator_age_years: 3,
      dishwasher_age_years: 3,
    }
    const updateEq = jest.fn().mockResolvedValue({ error: null })
    const updateFn = jest.fn().mockReturnValue({ eq: updateEq })
    const supabase = makeSupabase({ homeDetails: details, updateResult: { error: null } })
    // Replace the update mock
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
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [] }),
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
    const fullDetails = {
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
    const updateEq = jest.fn().mockResolvedValue({ error: null })
    const updateFn = jest.fn().mockReturnValue({ eq: updateEq })
    const supabase = makeSupabase({ homeDetails: fullDetails })
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
              single: jest.fn().mockResolvedValue({ data: fullDetails }),
            }),
          }),
        }
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [] }),
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

  it('phrases matched case-insensitively: bare "Not Sure" clears gaps', async () => {
    const details = {
      year_built: null,
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
      has_washer_dryer: false,
      washer_dryer_age_years: null,
      refrigerator_age_years: 3,
      dishwasher_age_years: 3,
    }
    const supabase = makeSupabase({
      homeDetails: details,
      conversations: [{ content: 'Not Sure', role: 'user' }], // no field label needed
    })
    const result = await validateOnboardingCompleteness(supabase as unknown as Parameters<typeof validateOnboardingCompleteness>[0], userId)
    expect(result.gaps).not.toContain('year_built')
  })
})
