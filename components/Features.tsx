interface Feature {
  title: string
  description: string
  icon: React.ReactNode
}

function ChatIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

const features: Feature[] = [
  {
    title: 'Conversational Onboarding',
    description:
      "No forms, no portals. Tendr's AI collects a complete home profile through a natural SMS conversation. Homeowners answer in plain English — Tendr handles the parsing.",
    icon: <ChatIcon />,
  },
  {
    title: 'Proactive Maintenance Reminders',
    description:
      "30+ reminder types timed to each homeowner's actual appliances and service history. Every message is personalized by AI and includes a direct link to purchase the part — so homeowners can act on it immediately.",
    icon: <BellIcon />,
  },
  {
    title: 'Instant Warranty Answers',
    description:
      'Upload your warranty docs once. Tendr uses semantic search to find the relevant coverage sections and answers homeowner questions — grounded in your actual policy language, never fabricated.',
    icon: <ShieldIcon />,
  },
  {
    title: 'Built for Multiple Companies',
    description:
      'Every warranty company gets their own dedicated phone number, isolated user data, branded messaging, and independent usage metrics. One platform, built to scale.',
    icon: <BuildingIcon />,
  },
  {
    title: 'SMS Compliance Built In',
    description:
      'STOP, START, and HELP keywords are handled automatically and correctly. Opted-out users are never contacted. TCPA compliance is a feature, not an afterthought.',
    icon: <CheckCircleIcon />,
  },
  {
    title: 'Billing & Usage Insights',
    description:
      'Monthly snapshots of active users, new onboards, reminders sent, and conversations — per warranty company. Re-runnable for corrections and backfills.',
    icon: <ChartIcon />,
  },
]

export default function Features() {
  return (
    <section
      id="features"
      className="bg-white py-20 lg:py-28"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">
            Platform features
          </p>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance"
          >
            Everything your homeowners need. Nothing they don&apos;t.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Tendr handles the full homeowner lifecycle — from first text to ongoing care —
            so your team can focus on what matters.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-brand-200 hover:shadow-md transition-all duration-200"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 text-brand-600 mb-4 group-hover:bg-brand-100 transition-colors">
                {feature.icon}
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
