export const metadata = {
  title: 'Enroll in Tendr SMS Home Warranty Assistance | Tendr',
  description: 'Public SMS opt-in enrollment form for Tendr home warranty assistance.',
}

const consentDisclosure =
  'By checking this box, I agree to receive SMS messages from Tendr, the Home Warranty AI Assistant, about warranty assistance, claim support, claim status updates, home maintenance reminders, and related product recommendations. Message frequency varies. Message and data rates may apply. Reply STOP to cancel. Reply HELP for help. Consent to receive SMS messages is not required to purchase or use warranty services.'

const statusCopy: Record<string, { tone: string, message: string }> = {
  success: {
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    message: 'Thank you. Your SMS opt-in was saved by Tendr and your enrollment has been submitted.',
  },
  'no-consent': {
    tone: 'border-blue-200 bg-blue-50 text-blue-900',
    message: 'Enrollment submitted without SMS opt-in. Tendr will not enroll this phone number in SMS messaging.',
  },
  'missing-required': {
    tone: 'border-amber-200 bg-amber-50 text-amber-900',
    message: 'Please complete all required fields before submitting the enrollment form.',
  },
  error: {
    tone: 'border-rose-200 bg-rose-50 text-rose-900',
    message: 'We could not save your enrollment right now. Please try again or contact support@trytendr.org.',
  },
}

export default function SmsEnrollmentPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {
  const status = searchParams?.status
  const statusMessage = status ? statusCopy[status] : null

  return (
    <main className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Enroll in Tendr SMS Home Warranty Assistance</h1>
          <p className="mt-4 leading-7 text-slate-700">Tendr helps homeowners receive SMS support for home warranty assistance, claim support, claim status updates, home maintenance reminders, and related product recommendations.</p>
          <p className="mt-3 leading-7 text-slate-700">SMS enrollment is optional. You do not need to enroll in Tendr SMS messages to purchase or use your home warranty services.</p>

          {statusMessage && (
            <p className={`mt-6 rounded-lg border px-4 py-3 text-sm ${statusMessage.tone}`}>{statusMessage.message}</p>
          )}

          <form className="mt-6 space-y-5" action="/api/sms-enrollment" method="post">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">Full Name<input name="fullName" className="w-full rounded-lg border border-slate-300 px-3 py-2" type="text" required /></label>
              <label className="space-y-2 text-sm font-medium text-slate-700">Mobile Phone Number<input name="mobilePhone" className="w-full rounded-lg border border-slate-300 px-3 py-2" type="tel" required /></label>
              <label className="space-y-2 text-sm font-medium text-slate-700">Email Address Optional<input name="email" className="w-full rounded-lg border border-slate-300 px-3 py-2" type="email" /></label>
              <label className="space-y-2 text-sm font-medium text-slate-700">Home Address<input name="homeAddress" className="w-full rounded-lg border border-slate-300 px-3 py-2" type="text" required /></label>
              <label className="space-y-2 text-sm font-medium text-slate-700">Warranty Provider<input name="warrantyProvider" className="w-full rounded-lg border border-slate-300 px-3 py-2" type="text" required /></label>
              <label className="space-y-2 text-sm font-medium text-slate-700">Home System or Appliance Optional<input name="homeSystemOrAppliance" className="w-full rounded-lg border border-slate-300 px-3 py-2" type="text" /></label>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                <input type="checkbox" name="smsConsent" className="mt-1 h-4 w-4 rounded border-slate-300" defaultChecked={false} />
                <span>{consentDisclosure}</span>
              </label>
              <p className="mt-3 text-sm text-slate-700">Terms: <a className="text-brand-700 underline" href="https://trytendr.org/terms">https://trytendr.org/terms</a></p>
              <p className="text-sm text-slate-700">Privacy Policy: <a className="text-brand-700 underline" href="https://trytendr.org/privacy-policy">https://trytendr.org/privacy-policy</a></p>
            </div>

            <button type="submit" className="inline-flex rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">Enroll in Tendr SMS</button>
          </form>
        </section>
      </div>
    </main>
  )
}
