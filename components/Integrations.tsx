// PLACEHOLDER: Replace colored badge divs with actual vendor logo <Image> components
const integrations = [
  {
    name: 'SMS Infrastructure',
    role: 'Carrier-grade message delivery',
    color: 'bg-red-50 border-red-200 text-red-700',
    abbr: 'SMS',
  },
  {
    name: 'Anthropic Claude',
    role: 'AI generation & parsing',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    abbr: 'AI',
  },
  {
    name: 'OpenAI',
    role: 'Semantic search embeddings',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    abbr: 'OA',
  },
  {
    name: 'ATTOM Data',
    role: 'Property enrichment',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    abbr: 'AT',
  },
  {
    name: 'Supabase',
    role: 'Database & vector search',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    abbr: 'SB',
  },
]

export default function Integrations() {
  return (
    <section
      className="bg-white py-16 border-y border-slate-100"
      aria-labelledby="integrations-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2
            id="integrations-heading"
            className="text-sm font-semibold text-slate-500 uppercase tracking-wider"
          >
            Built on infrastructure you can trust
          </h2>
        </div>

        <ul
          className="flex flex-wrap justify-center gap-4 list-none"
          role="list"
          aria-label="Technology partners"
        >
          {integrations.map((integration) => (
            <li key={integration.name}>
              <div
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${integration.color} transition-transform hover:-translate-y-0.5`}
              >
                {/* PLACEHOLDER: Replace this div with <Image src={logoSrc} alt={integration.name} /> */}
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold border ${integration.color}`}
                  aria-hidden="true"
                >
                  {integration.abbr}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{integration.name}</p>
                  <p className="text-xs text-slate-500">{integration.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
