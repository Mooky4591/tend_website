import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { runNightlyQualityReview } from '@/lib/services/qualityMonitor'

/**
 * POST /api/cron/quality-review
 *
 * Nightly AI quality review endpoint. Called by Railway's scheduler (or any
 * HTTP-based cron service) at 02:00 every night.
 *
 * Authentication: requires the `x-cron-secret` header to match CRON_SECRET.
 *
 * To configure in Railway:
 *   Schedule: 0 2 * * *  (daily at 2am UTC)
 *   HTTP Method: POST
 *   URL: https://your-domain.com/api/cron/quality-review
 *   Headers: x-cron-secret: <CRON_SECRET value>
 */
export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get('x-cron-secret')
  if (!process.env.CRON_SECRET || !cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  try {
    const summary = await runNightlyQualityReview(supabase)
    return NextResponse.json({ ok: true, ...summary })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[CronQualityReview] Fatal error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
