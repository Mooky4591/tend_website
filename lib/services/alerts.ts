import sgMail from '@sendgrid/mail'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Inserts a system_alerts row and sends an admin email via SendGrid.
 *
 * @param supabase      Supabase client (service-role to bypass RLS)
 * @param alertType     Category: "api_failure", "delivery_failure", "onboarding_stuck", etc.
 * @param userId        Optional homeowner user ID associated with the alert
 * @param description   Human-readable description of what went wrong
 */
export async function sendAdminAlert(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  alertType: string,
  userId: string | null,
  description: string,
): Promise<void> {
  const timestamp = new Date().toISOString()

  // 1. Insert into system_alerts (best-effort; don't throw on failure)
  try {
    await supabase.from('system_alerts').insert({
      alert_type: alertType,
      user_id: userId ?? null,
      description,
      resolved: false,
    })
  } catch (dbErr) {
    console.error('[Alerts] Failed to insert system_alert:', dbErr)
  }

  // 2. Send email via SendGrid (best-effort)
  const adminEmail = process.env.ADMIN_EMAIL
  const sendgridKey = process.env.SENDGRID_API_KEY

  if (!adminEmail || !sendgridKey) {
    console.warn(
      '[Alerts] ADMIN_EMAIL or SENDGRID_API_KEY not set — skipping email notification',
    )
    return
  }

  sgMail.setApiKey(sendgridKey)

  const subject = `[Tendr Alert] ${alertType}`
  const body = [
    `Alert Type: ${alertType}`,
    `Timestamp: ${timestamp}`,
    userId ? `User ID: ${userId}` : null,
    ``,
    `Description:`,
    description,
  ]
    .filter(line => line !== null)
    .join('\n')

  try {
    await sgMail.send({
      to: adminEmail,
      from: adminEmail, // SendGrid requires a verified sender
      subject,
      text: body,
    })
  } catch (emailErr) {
    console.error('[Alerts] Failed to send admin email:', emailErr)
  }
}
