const homeownerBenefits = [
  {
    emoji: '💬',
    title: 'Natural language, not a chatbot',
    description:
      'Homeowners reply in plain English. "My furnace is making a noise" works just as well as any form ever could. Tend understands context and follows up intelligently.',
  },
  {
    emoji: '🔔',
    title: 'Proactive reminders before things break',
    description:
      "Tend tracks each homeowner's actual appliances and sends reminders timed to their specific equipment — not a generic calendar. The right nudge at the right time.",
  },
  {
    emoji: '📋',
    title: 'Warranty answers in seconds',
    description:
      'Instead of digging through a PDF, homeowners text a question and get a plain-English answer grounded in their actual warranty coverage. No hold music. No ticket.',
  },
  {
    emoji: '🛒',
    title: 'Buy the part right from the reminder',
    description:
      'When a reminder arrives — say, to change the air filter — it includes a link to purchase the right part immediately. No searching, no second-guessing the size or model.',
  },
  {
    emoji: '📷',
    title: 'Photo support for appliance labels',
    description:
      "Snap a photo of a water heater label or HVAC nameplate and send it. Tend reads it, extracts the relevant data, and asks follow-ups for anything it can't make out.",
  },
]

const exampleMessages = [
  {
    question: 'Is my AC covered if the compressor dies?',
    answer:
      "Yes — your Gold Plan covers the compressor, fan motor, and refrigerant recharge on your primary cooling unit. Exclusions apply if the failure is due to lack of maintenance. Want me to help you open a claim?",
  },
  {
    question: 'When did I last change my HVAC filter?',
    answer:
      "Based on your records, you last changed the filter on your Carrier unit upstairs about 78 days ago. You're getting close to the 90-day mark — want me to add a reminder?",
  },
]

export default function ForHomeowners() {
  return (
    <section
      className="bg-slate-50 py-20 lg:py-28"
      aria-labelledby="homeowners-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">
            For your customers
          </p>
          <h2
            id="homeowners-heading"
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance"
          >
            A home assistant experience they&apos;ll actually use
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Homeowners don&apos;t need to download anything, create an account, or remember a password.
            Tend lives in the texting app they already use every day.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: benefit list */}
          <div className="space-y-6">
            {homeownerBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-4 bg-white rounded-xl p-5 border border-slate-200"
              >
                <span className="text-2xl shrink-0" role="img" aria-label="">
                  {benefit.emoji}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{benefit.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: example Q&A exchanges */}
          <div className="space-y-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Example conversations
            </p>
            {exampleMessages.map((ex) => (
              <div
                key={ex.question}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
              >
                {/* Header */}
                <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" aria-hidden="true" />
                  <div className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
                  <span className="ml-2 text-xs text-slate-400">Armadillo Home Warranty</span>
                </div>

                {/* Conversation */}
                <div className="p-4 space-y-3">
                  {/* Homeowner message */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-brand-600 text-white text-sm px-3.5 py-2.5 rounded-2xl rounded-tr-sm leading-relaxed">
                      {ex.question}
                    </div>
                  </div>
                  {/* Tend response */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] bg-slate-100 text-slate-800 text-sm px-3.5 py-2.5 rounded-2xl rounded-tl-sm leading-relaxed">
                      {ex.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
