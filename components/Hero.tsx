const smsMessages = [
  {
    role: 'assistant' as const,
    text: "Hi Maria! 👋 I'm Tendr, your AI home assistant from Armadillo Home Warranty. I'll help keep your home in great shape. What's your home address?",
    time: '9:01 AM',
  },
  {
    role: 'user' as const,
    text: '342 Oak Bluff Dr, Scottsdale AZ 85255',
    time: '9:03 AM',
  },
  {
    role: 'assistant' as const,
    text: '✓ Found it! Built 2001, 2,340 sq ft — and looks like you have a pool! What type of roof, and roughly how old?',
    time: '9:03 AM',
  },
  {
    role: 'user' as const,
    text: 'Tile, about 12 years old',
    time: '9:05 AM',
  },
  {
    role: 'assistant' as const,
    text: '⏰ Heads up! Your Carrier cooling unit is due for its annual service — last done 11 months ago. Book a tune-up before summer hits!',
    time: '2 days later',
  },
]

function PhoneMockup() {
  return (
    <div
      className="relative mx-auto w-64 select-none"
      aria-label="Example SMS conversation with Tendr"
      role="img"
    >
      {/* Phone frame */}
      <div className="relative bg-slate-800 rounded-[2.8rem] p-2.5 shadow-2xl shadow-black/60 border border-slate-700/50">
        {/* Top notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-full z-10" />

        {/* Screen */}
        <div className="bg-white rounded-[2.2rem] overflow-hidden pt-8">
          {/* Status bar */}
          <div className="bg-slate-100 px-5 py-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-700">Armadillo Warranty</span>
            <div className="flex items-center gap-1">
              <svg className="w-2.5 h-2.5 text-slate-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M1.5 8.5a13 13 0 0121 0M5 12a10 10 0 0114 0M8.5 15.5a6.5 6.5 0 017 0M12 19h.01" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none"/>
              </svg>
              <svg className="w-2.5 h-2.5 text-slate-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <rect x="2" y="6" width="3" height="8" rx="1"/>
                <rect x="7" y="4" width="3" height="10" rx="1"/>
                <rect x="12" y="2" width="3" height="12" rx="1"/>
                <rect x="17" y="1" width="2" height="13" rx="1" opacity="0.4"/>
              </svg>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white px-3 py-3 space-y-2.5 min-h-[320px]">
            {smsMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-0.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Divider for "2 days later" */}
                {msg.time === '2 days later' && (
                  <div className="w-full text-center my-1">
                    <span className="text-[9px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                      2 days later
                    </span>
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.time !== '2 days later' && (
                  <span className="text-[9px] text-slate-400 px-1">{msg.time}</span>
                )}
              </div>
            ))}
          </div>

          {/* Input bar */}
          <div className="bg-white border-t border-slate-100 px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-slate-100 rounded-full px-3 py-1.5 text-[10px] text-slate-400">
              Text message
            </div>
            <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Home indicator */}
          <div className="bg-white pb-2 flex items-center justify-center">
            <div className="w-24 h-1 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute -inset-4 bg-brand-600/20 blur-2xl rounded-full -z-10" aria-hidden="true" />
    </div>
  )
}

export default function Hero() {
  return (
    <section
      className="relative bg-slate-950 text-white pt-16 overflow-hidden"
      aria-labelledby="hero-headline"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 opacity-80"
        aria-hidden="true"
      />
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/20 border border-brand-500/30 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-6">
              {/* PLACEHOLDER: Replace label with your tagline badge */}
              AI-Powered · SMS-Native · No App Required
            </div>

            <h1
              id="hero-headline"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-balance"
            >
              Your homeowners deserve a{' '}
              <span className="text-brand-400">smarter warranty</span>{' '}
              experience
            </h1>

            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Tendr delivers AI-powered home care over SMS — proactive maintenance reminders,
              instant warranty answers, and conversational onboarding. No app. No portal. Just a text.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Book a Demo
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-slate-600 text-slate-200 font-semibold hover:border-slate-400 hover:text-white transition-colors"
              >
                See How It Works
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              No commitment required · 30-minute demo · Setup in days, not months
            </p>
          </div>

          {/* Right: phone mockup */}
          <div className="flex items-center justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"
        aria-hidden="true"
      />
    </section>
  )
}
