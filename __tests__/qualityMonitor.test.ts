import { reviewUserConversation, runNightlyQualityReview, QUALITY_REVIEW_MODEL } from '@/lib/services/qualityMonitor'
import type Anthropic from '@anthropic-ai/sdk'

// Mock @anthropic-ai/sdk
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn(),
    },
  }))
})

// Mock the alerts service
jest.mock('@/lib/services/alerts', () => ({
  sendAdminAlert: jest.fn().mockResolvedValue(undefined),
}))

import { sendAdminAlert } from '@/lib/services/alerts'

function makeAnthropicResponse(jsonText: string): { content: Array<{ type: string; text: string }> } {
  return { content: [{ type: 'text', text: jsonText }] }
}

describe('reviewUserConversation', () => {
  it('returns { flagged: false, issues: [] } when Claude reports no issues', async () => {
    const client = {
      messages: {
        create: jest.fn().mockResolvedValue(makeAnthropicResponse('{"flagged":false,"issues":[]}')),
      },
    }
    const result = await reviewUserConversation(client as unknown as Anthropic, '{}', 'thread')
    expect(result).toEqual({ flagged: false, issues: [] })
  })

  it('returns flagged issues when Claude flags the conversation', async () => {
    const client = {
      messages: {
        create: jest.fn().mockResolvedValue(
          makeAnthropicResponse(
            JSON.stringify({
              flagged: true,
              issues: [{ type: 'missed_followup', description: 'AC issue not addressed' }],
            }),
          ),
        ),
      },
    }
    const result = await reviewUserConversation(client as unknown as Anthropic, '{}', 'thread')
    expect(result.flagged).toBe(true)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].type).toBe('missed_followup')
  })

  it('strips markdown code fences before parsing JSON', async () => {
    const client = {
      messages: {
        create: jest.fn().mockResolvedValue(
          makeAnthropicResponse('```json\n{"flagged":false,"issues":[]}\n```'),
        ),
      },
    }
    const result = await reviewUserConversation(client as unknown as Anthropic, '{}', 'thread')
    expect(result.flagged).toBe(false)
  })

  it('throws when Claude returns invalid JSON', async () => {
    const client = {
      messages: {
        create: jest.fn().mockResolvedValue(makeAnthropicResponse('not-json')),
      },
    }
    await expect(reviewUserConversation(client as unknown as Anthropic, '{}', 'thread')).rejects.toThrow()
  })

  it('calls client.messages.create with the QUALITY_REVIEW_MODEL identifier', async () => {
    const mockCreate = jest.fn().mockResolvedValue(makeAnthropicResponse('{"flagged":false,"issues":[]}'))
    const client = { messages: { create: mockCreate } }
    await reviewUserConversation(client as unknown as Anthropic, '{}', 'thread')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: QUALITY_REVIEW_MODEL }),
    )
    // Explicitly assert the string value so any drift in the constant is caught here.
    expect(QUALITY_REVIEW_MODEL).toBe('claude-opus-4-7')
  })
})

describe('runNightlyQualityReview', () => {
  function makeSupabase({
    conversations = [] as Array<Record<string, unknown>>,
    homeDetails = null as Record<string, unknown> | null,
    updateResult = { error: null },
    convError = null as { message: string } | null,
  } = {}) {
    const updateFn = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue(updateResult),
    })
    // range() terminates the fetch chain and resolves the page.
    // Returning fewer than PAGE_SIZE rows (1000) stops the pagination loop.
    const mockRange = jest.fn().mockResolvedValue({ data: conversations, error: convError })

    return {
      from: jest.fn((table: string) => {
        if (table === 'conversations') {
          return {
            select: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({ range: mockRange }),
              }),
            }),
            update: updateFn,
          }
        }
        if (table === 'home_details') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: homeDetails }),
              }),
            }),
          }
        }
        return {}
      }),
      _updateFn: updateFn,
      _mockRange: mockRange,
    }
  }

  it('returns { reviewed: 0, flagged: 0 } when no conversations exist', async () => {
    const supabase = makeSupabase({ conversations: [] })
    const result = await runNightlyQualityReview(supabase as unknown as Parameters<typeof runNightlyQualityReview>[0])
    expect(result).toEqual({ reviewed: 0, flagged: 0 })
  })

  it('calls sendAdminAlert when conversations fetch fails', async () => {
    const supabase = makeSupabase({ convError: { message: 'DB down' } })
    await runNightlyQualityReview(supabase as unknown as Parameters<typeof runNightlyQualityReview>[0])
    expect(sendAdminAlert).toHaveBeenCalledWith(
      'api_failure',
      null,
      expect.stringContaining('DB down'),
    )
  })

  it('calls sendAdminAlert on Claude API errors and continues to next user', async () => {
    // Mock Anthropic to throw
    const AnthropicMock = jest.requireMock('@anthropic-ai/sdk')
    AnthropicMock.mockImplementation(() => ({
      messages: {
        create: jest.fn().mockRejectedValue(new Error('Claude API error')),
      },
    }))

    const convos = [
      { id: 'c1', user_id: 'u1', role: 'user', content: 'Hello', created_at: new Date().toISOString() },
    ]
    const supabase = makeSupabase({ conversations: convos })
    const result = await runNightlyQualityReview(supabase as unknown as Parameters<typeof runNightlyQualityReview>[0])

    expect(sendAdminAlert).toHaveBeenCalledWith(
      'api_failure',
      'u1',
      expect.stringContaining('Claude API error'),
    )
    expect(result.flagged).toBe(0)
  })

  it('labels staff messages as "Staff" and assistant messages as "Assistant" in the review thread', async () => {
    const AnthropicMock = jest.requireMock('@anthropic-ai/sdk')
    const mockCreate = jest.fn().mockResolvedValue(makeAnthropicResponse('{"flagged":false,"issues":[]}'))
    AnthropicMock.mockImplementation(() => ({
      messages: { create: mockCreate },
    }))

    const ts = new Date().toISOString()
    const convos = [
      { id: 'c1', user_id: 'u1', role: 'user',      content: 'Homeowner says hi',   created_at: ts },
      { id: 'c2', user_id: 'u1', role: 'assistant',  content: 'AI responds',          created_at: ts },
      { id: 'c3', user_id: 'u1', role: 'staff',      content: 'Staff note here',      created_at: ts },
    ]
    const supabase = makeSupabase({ conversations: convos })
    await runNightlyQualityReview(supabase as unknown as Parameters<typeof runNightlyQualityReview>[0])

    const prompt: string = mockCreate.mock.calls[0][0].messages[0].content
    expect(prompt).toContain('Homeowner:')
    expect(prompt).toContain('Assistant:')
    expect(prompt).toContain('Staff:')
    // Staff messages must NOT be mislabelled as Assistant
    expect(prompt).not.toContain('Assistant: Staff note here')
  })

  it('updates ai_quality_flag and ai_quality_reason when flagged', async () => {
    // Mock Anthropic to return flagged result
    const AnthropicMock = jest.requireMock('@anthropic-ai/sdk')
    AnthropicMock.mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue(
          makeAnthropicResponse(
            JSON.stringify({
              flagged: true,
              issues: [{ type: 'missed_followup', description: 'AC not addressed' }],
            }),
          ),
        ),
      },
    }))

    const convos = [
      { id: 'c1', user_id: 'u1', role: 'user', content: 'Hello', created_at: new Date().toISOString() },
    ]
    const updateEq = jest.fn().mockResolvedValue({ error: null })
    const updateFn = jest.fn().mockReturnValue({ eq: updateEq })

    const supabase = {
      from: jest.fn((table: string) => {
        if (table === 'conversations') {
          return {
            select: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  range: jest.fn().mockResolvedValue({ data: convos, error: null }),
                }),
              }),
            }),
            update: updateFn,
          }
        }
        if (table === 'home_details') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null }),
              }),
            }),
          }
        }
        return {}
      }),
    }

    const result = await runNightlyQualityReview(supabase as unknown as Parameters<typeof runNightlyQualityReview>[0])
    expect(result.flagged).toBe(1)
    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({ ai_quality_flag: true, ai_quality_reason: expect.any(String) }),
    )
  })

  it('fetches a second page when the first returns exactly PAGE_SIZE (1000) rows', async () => {
    const AnthropicMock = jest.requireMock('@anthropic-ai/sdk')
    AnthropicMock.mockImplementation(() => ({
      messages: { create: jest.fn().mockResolvedValue(makeAnthropicResponse('{"flagged":false,"issues":[]}')) },
    }))

    // First page: exactly 1000 rows for u1 → triggers second page fetch.
    const firstPage = Array.from({ length: 1000 }, (_, i) => ({
      id: `c${i}`,
      user_id: 'u1',
      role: 'user',
      content: `message ${i}`,
      created_at: new Date().toISOString(),
    }))
    // Second page: empty → loop stops.
    const mockRange = jest.fn()
      .mockResolvedValueOnce({ data: firstPage, error: null })
      .mockResolvedValueOnce({ data: [],        error: null })

    const supabase = {
      from: jest.fn((table: string) => {
        if (table === 'conversations') {
          return {
            select: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({ range: mockRange }),
              }),
            }),
            update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
          }
        }
        if (table === 'home_details') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null }),
              }),
            }),
          }
        }
        return {}
      }),
    }

    const result = await runNightlyQualityReview(supabase as unknown as Parameters<typeof runNightlyQualityReview>[0])
    // range should have been called twice: page 0 and page 1000
    expect(mockRange).toHaveBeenCalledTimes(2)
    expect(mockRange).toHaveBeenNthCalledWith(1, 0, 999)
    expect(mockRange).toHaveBeenNthCalledWith(2, 1000, 1999)
    // u1 was reviewed from the 1000 rows on page 1
    expect(result.reviewed).toBe(1)
  })
})
