export default function CTA() {
  return (
    <section
      id="contact"
      className="bg-brand-600 py-20"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2
          id="cta-heading"
          className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance"
        >
          Ready to give your homeowners a smarter experience?
        </h2>
        <p className="mt-4 text-lg text-brand-100 max-w-xl mx-auto">
          See Tend in action with a 30-minute demo. We&apos;ll walk through a live SMS conversation,
          show you how warranty Q&amp;A works, and answer your integration questions.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {/*
            PLACEHOLDER: Replace this href with your actual demo booking link
            e.g., Calendly, HubSpot meetings, or a contact form
          */}
          <a
            href="mailto:hello@tend.ai"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-white text-brand-700 font-bold hover:bg-brand-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600"
          >
            Book a Demo
          </a>
          <a
            href="mailto:hello@tend.ai"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg border border-brand-400 text-white font-semibold hover:bg-brand-700 transition-colors"
          >
            Contact Sales
          </a>
        </div>

        <p className="mt-4 text-xs text-brand-200">
          No commitment required · We&apos;ll respond within one business day
          {/* PLACEHOLDER: Update contact email with your real address */}
          {' '}· hello@tend.ai
        </p>
      </div>
    </section>
  )
}
