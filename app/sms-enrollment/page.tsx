import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import SmsEnrollmentForm from './SmsEnrollmentForm'

export const metadata: Metadata = {
  title: 'SMS Enrollment | Tendr',
  description:
    'Enroll in Tendr SMS home warranty assistance. Receive warranty claim support, maintenance reminders, and status updates over SMS.',
}

export default function SmsEnrollmentPage() {
  return (
    <>
      <Navigation />
      <main className="bg-background pt-24 pb-20 min-h-screen" id="main-content">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Enroll in Tendr SMS Home Warranty Assistance
            </h1>
            <div className="mt-4 space-y-3 text-base text-muted-foreground/80 leading-relaxed">
              <p>
                Tendr helps homeowners receive SMS support for home warranty assistance, claim support, claim status
                updates, home maintenance reminders, and related product recommendations.
              </p>
              <p>
                SMS enrollment is optional. You do not need to enroll in Tendr SMS messages to purchase or use your
                home warranty services.
              </p>
            </div>
          </header>

          <div className="rounded-2xl border border-border/20 bg-white p-6 shadow-sm sm:p-8">
            <SmsEnrollmentForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
