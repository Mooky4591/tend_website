export const metadata = {
  title: 'Tendr SMS Consent Flow | Tendr',
  description: 'Public SMS consent flow proof page for Tendr A2P 10DLC review.',
}

const consentDisclosure =
  'By checking this box, I agree to receive SMS messages from Tendr, the Home Warranty AI Assistant, about warranty assistance, claim support, claim status updates, home maintenance reminders, and related product recommendations. Message frequency varies. Message and data rates may apply. Reply STOP to cancel. Reply HELP for help. Consent to receive SMS messages is not required to purchase or use warranty services.'

export default function SmsConsentProofPage() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tendr SMS Consent Flow</h1>
          <p className="mt-4 max-w-4xl leading-7 text-slate-700">
            This page documents how homeowners provide consent to receive SMS messages from Tendr. SMS
            consent is optional and collected through an unchecked checkbox during the home warranty
            enrollment process. Homeowners who do not check the SMS consent box are not enrolled in SMS
            messaging.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold">Step 1: Tendr SMS Enrollment Form</h2>
          <form className="mt-6 space-y-5" aria-label="Tendr enrollment form mockup">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Full Name
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  type="text"
                  defaultValue="Jordan Lee"
                  readOnly
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Mobile Phone Number
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  type="tel"
                  defaultValue="(555) 123-4567"
                  readOnly
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Email Address (optional)
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  type="email"
                  defaultValue="jordan@example.com"
                  readOnly
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Home Address
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  type="text"
                  defaultValue="123 Main St, Atlanta, GA 30303"
                  readOnly
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Warranty Provider
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  type="text"
                  defaultValue="Example Home Warranty Co."
                  readOnly
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Home System or Appliance
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  type="text"
                  defaultValue="HVAC"
                  readOnly
                />
              </label>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                  defaultChecked={false}
                />
                <span>{consentDisclosure}</span>
              </label>
              <p className="mt-3 text-sm text-slate-700">
                Terms:{' '}
                <a className="text-brand-700 underline" href="https://trytendr.org/terms">
                  https://trytendr.org/terms
                </a>
              </p>
              <p className="text-sm text-slate-700">
                Privacy Policy:{' '}
                <a className="text-brand-700 underline" href="https://trytendr.org/privacy-policy">
                  https://trytendr.org/privacy-policy
                </a>
              </p>
            </div>

            <button
              type="button"
              className="inline-flex rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Enroll in Tendr SMS
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold">Step 2: Confirmation Screen</h2>
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-2xl font-semibold text-emerald-900">Thank you</p>
            <p className="mt-3 text-slate-800">Your Tendr SMS enrollment has been submitted.</p>
            <p className="mt-3 leading-7 text-slate-700">
              If you opted in to SMS, Tendr may send you text messages related to warranty assistance,
              claim support, claim status updates, home maintenance reminders, and related product
              recommendations. Message frequency varies. Message and data rates may apply. Reply STOP to
              cancel. Reply HELP for help.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold">Step 3: Example Confirmation SMS</h2>
          <div className="mt-6 max-w-md rounded-[2rem] border-4 border-slate-900 bg-slate-100 p-4 shadow-inner">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tendr SMS</p>
              <p className="mt-2 rounded-2xl bg-brand-700 p-3 text-sm leading-6 text-white">
                Tendr: You’re now opted in to Tendr SMS updates. Msg frequency varies. Msg &amp; data
                rates may apply. Reply HELP for help or STOP to cancel. Privacy Policy:
                https://trytendr.org/privacy-policy Terms: https://trytendr.org/terms
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold">Opt-In Record Stored by Tendr</h2>
          <p className="mt-4 text-slate-700">
            After a homeowner submits the form with SMS consent checked, Tendr stores:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-700">
            <li>Full name</li>
            <li>Mobile phone number</li>
            <li>Consent timestamp</li>
            <li>Consent source URL</li>
            <li>Consent language version</li>
            <li>Terms URL</li>
            <li>Privacy Policy URL</li>
            <li>IP address</li>
            <li>User agent</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold">Consent Requirements</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>SMS consent is optional.</li>
            <li>The SMS checkbox is unchecked by default.</li>
            <li>Consent is not required to purchase or use warranty services.</li>
            <li>Tendr does not send SMS messages unless the homeowner opts in.</li>
            <li>Homeowners can reply STOP to cancel.</li>
            <li>Homeowners can reply HELP for help.</li>
            <li>Message frequency varies.</li>
            <li>Message and data rates may apply.</li>
          </ul>
          <p className="mt-6 text-sm text-slate-600">
            Questions? Contact{' '}
            <a className="text-brand-700 underline" href="mailto:support@trytendr.org">
              support@trytendr.org
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
