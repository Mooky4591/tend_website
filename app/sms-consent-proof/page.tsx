export const metadata = {
  title: 'SMS Consent Proof | Tendr',
  description: 'Public A2P 10DLC SMS consent flow documentation for Tendr.',
}

const consentDisclosure =
  'By checking this box, I agree to receive SMS messages from Tendr, the Home Warranty AI Assistant, about warranty assistance, claim support, claim status updates, home maintenance reminders, and related product recommendations. Message frequency varies. Message and data rates may apply. Reply STOP to cancel. Reply HELP for help. Consent to receive SMS messages is not required to purchase or use warranty services.'

export default function SmsConsentProofPage() {
  return (
    <main className="bg-background text-foreground">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="rounded-2xl border border-border/20 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tendr SMS Consent Flow</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            This page documents how homeowners provide consent to receive SMS messages from Tendr. SMS consent is optional and collected through an unchecked checkbox during the home warranty enrollment process. Homeowners who do not check the SMS consent box are not enrolled in SMS messaging.
          </p>
        </header>

        <section className="rounded-2xl border border-border/20 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold">Step 1: Tendr SMS Enrollment Form</h2>
          <div className="mt-5 rounded-xl border border-border/20 bg-muted p-4 sm:p-6">
            <form className="space-y-4" aria-label="Tendr SMS enrollment form mockup">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="fullName">Full Name</label>
                <input id="fullName" type="text" className="w-full rounded-md border border-border/30 bg-white px-3 py-2 text-sm" placeholder="Jane Homeowner" readOnly />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="mobilePhone">Mobile Phone Number</label>
                <input id="mobilePhone" type="tel" className="w-full rounded-md border border-border/30 bg-white px-3 py-2 text-sm" placeholder="(555) 123-4567" readOnly />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="emailAddress">Email Address (optional)</label>
                <input id="emailAddress" type="email" className="w-full rounded-md border border-border/30 bg-white px-3 py-2 text-sm" placeholder="jane@example.com" readOnly />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="homeAddress">Home Address</label>
                <input id="homeAddress" type="text" className="w-full rounded-md border border-border/30 bg-white px-3 py-2 text-sm" placeholder="123 Main St, Atlanta, GA" readOnly />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="warrantyProvider">Warranty Provider</label>
                  <input id="warrantyProvider" type="text" className="w-full rounded-md border border-border/30 bg-white px-3 py-2 text-sm" placeholder="Provider Name" readOnly />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="systemAppliance">Home System or Appliance</label>
                  <input id="systemAppliance" type="text" className="w-full rounded-md border border-border/30 bg-white px-3 py-2 text-sm" placeholder="HVAC" readOnly />
                </div>
              </div>

              <div className="rounded-lg border border-border/20 bg-white p-4">
                <label className="flex items-start gap-3">
                  <input type="checkbox" readOnly className="mt-1 h-4 w-4 rounded border-border/30" />
                  <span className="text-sm leading-6 text-muted-foreground">{consentDisclosure}</span>
                </label>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>
                    Terms:{' '}
                    <a className="text-brand-700 underline" href="https://trytendr.org/terms">https://trytendr.org/terms</a>
                  </p>
                  <p>
                    Privacy Policy:{' '}
                    <a className="text-brand-700 underline" href="https://trytendr.org/privacy-policy">https://trytendr.org/privacy-policy</a>
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 sm:w-auto"
              >
                Enroll in Tendr SMS
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-2xl border border-border/20 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold">Step 2: Confirmation Screen</h2>
          <div className="mt-5 rounded-xl border border-success/20 bg-success/10 p-5 sm:p-6">
            <p className="text-xl font-semibold text-success">Thank you</p>
            <p className="mt-3 text-foreground">Your Tendr SMS enrollment has been submitted.</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              If you opted in to SMS, Tendr may send you text messages related to warranty assistance, claim support,
              claim status updates, home maintenance reminders, and related product recommendations. Message frequency
              varies. Message and data rates may apply. Reply STOP to cancel. Reply HELP for help.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-border/20 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold">Step 3: Example Confirmation SMS</h2>
          <div className="mt-5 mx-auto max-w-md rounded-[2rem] border-8 border-navy bg-sand p-4 shadow-inner">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/60">SMS from Tendr</p>
              <div className="mt-3 rounded-2xl bg-brand-700 p-3 text-sm leading-6 text-white">
                Tendr: You’re now opted in to Tendr SMS updates. Msg frequency varies. Msg &amp; data rates may apply.
                Reply HELP for help or STOP to cancel. Privacy Policy: https://trytendr.org/privacy-policy Terms:
                https://trytendr.org/terms
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/20 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold">Opt-In Record Stored by Tendr</h2>
          <p className="mt-4 text-muted-foreground">
            After a homeowner submits the enrollment form with SMS consent checked, Tendr stores the following consent
            record details:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
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

        <section className="rounded-2xl border border-border/20 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold">Consent Requirements</h2>
          <ul className="mt-4 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>SMS consent is optional.</li>
            <li>The SMS checkbox is unchecked by default.</li>
            <li>Consent is not required to purchase or use warranty services.</li>
            <li>Tendr does not send SMS messages unless the homeowner opts in.</li>
            <li>Homeowners can reply STOP to cancel.</li>
            <li>Homeowners can reply HELP for help.</li>
            <li>Message frequency varies.</li>
            <li>Message and data rates may apply.</li>
          </ul>
          <p className="mt-5 text-sm text-muted-foreground/80">
            Support contact:{' '}
            <a className="text-brand-700 underline" href="mailto:support@trytendr.org">
              support@trytendr.org
            </a>
          </p>
        </section>
      </div>
    </main>
  )
}
