const highlights = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Pay per active user',
    description: 'You only pay for homeowners who are actively using the platform — not your total imported list.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Scales with your business',
    description: 'As your homeowner base grows, your costs grow with it — proportionally and predictably.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    title: 'Everything included',
    description: 'All features — onboarding, reminders, warranty Q&A, compliance, and usage reporting — are included for every active user.',
  },
]

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="bg-slate-50 py-20 lg:py-28"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2
            id="pricing-heading"
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance"
          >
            You only pay for users who are actually using it
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Tend is priced per active user, per month. If a homeowner completes onboarding and
            is actively engaged, they count. Inactive or unresponsive users don&apos;t.
          </p>
        </div>

        {/* Highlights */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 text-brand-600 mb-4">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-brand-600 rounded-2xl p-8 sm:p-10 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Get in touch for pricing
          </h3>
          <p className="text-brand-100 text-sm mb-6 max-w-md mx-auto">
            We&apos;ll put together a quote based on your homeowner volume and needs.
            No commitment required.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-brand-700 font-semibold text-sm hover:bg-brand-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600"
          >
            Contact us for a quote
          </a>
        </div>
      </div>
    </section>
  )
}
