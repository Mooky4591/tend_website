import { createHash } from 'crypto'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export type RateLimitConfig = {
  maxAttempts: number
  windowSeconds: number
  scope: string
}

export function getTrustedClientIp(request: NextRequest) {
  const trustedHeaders = [
    'cf-connecting-ip',
    'true-client-ip',
    'x-real-ip',
    'x-vercel-forwarded-for',
  ]

  for (const header of trustedHeaders) {
    const value = request.headers.get(header)?.trim()
    if (value) return { ip: value, source: header }
  }

  return { ip: null, source: 'none' }
}

export function buildRateLimitKey(scope: string, ip: string | null, userAgent: string | null) {
  const raw = `${scope}::${ip ?? 'unknown'}::${userAgent ?? 'unknown'}`
  return createHash('sha256').update(raw).digest('hex')
}

export async function checkRateLimit(
  supabase: SupabaseClient,
  key: string,
  config: Omit<RateLimitConfig, 'scope'>,
) {
  const { data, error } = await supabase.rpc('check_sms_enrollment_rate_limit', {
    rate_key: key,
    max_attempts: config.maxAttempts,
    window_seconds: config.windowSeconds,
  })

  return { allowed: Boolean(data) && !error, error }
}
