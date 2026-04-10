const stats = [
  {
    value: '30+',
    label: 'Maintenance reminder types',
    detail: 'Covering HVAC, plumbing, roof, appliances, pool, and more',
  },
  {
    value: '0',
    label: 'Apps to download',
    detail: 'Homeowners interact entirely through SMS — nothing to install',
  },
  {
    value: '100%',
    label: 'TCPA compliant',
    detail: 'STOP, START, and HELP keyword handling is built in and automatic',
  },
  {
    value: 'Multi-tenant',
    label: 'Architecture',
    detail: 'Fully isolated data, branding, and phone numbers per warranty company',
  },
]

export default function Stats() {
  return (
    <section className="bg-white py-16 border-b border-slate-100" aria-label="Platform highlights">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center px-4 py-6 rounded-xl border border-slate-100 bg-slate-50/50"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block text-4xl font-extrabold text-brand-600 tracking-tight">
                  {stat.value}
                </span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{stat.label}</span>
                <span className="mt-1 block text-xs text-slate-500 leading-relaxed">{stat.detail}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
