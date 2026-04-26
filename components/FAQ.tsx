'use client'

import { useState } from 'react'

const faqs = [
  {
    question: 'Do homeowners need to download an app or create an account?',
    answer:
      'No. Tendr works entirely over SMS. Homeowners interact through the messaging app they already have on their phone — no download, no login, no password. If they can send a text, they can use Tendr.',
  },
  {
    question: 'How does Tendr handle STOP and opt-out requests?',
    answer:
      "STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, and QUIT keywords are intercepted before any other processing. When a homeowner sends one, they are immediately marked as opted out and no confirmation reply is sent — carrier-level compliance is handled automatically. Opted-out users are excluded from all reminders, nudges, and AI responses. If they text START or UNSTOP, they're automatically re-enrolled.",
  },
  {
    question: 'Can I upload my own warranty documents?',
    answer:
      "Yes. Operators upload warranty plan documents as plain text through the platform. Tendr automatically splits them into chunks, generates vector embeddings, and stores them for semantic search. When a homeowner asks a coverage question, the most relevant sections are retrieved and used as context — Tendr only references what's in your actual documents.",
  },
  {
    question: "What happens if a homeowner doesn't respond during onboarding?",
    answer:
      "Tendr sends up to three follow-up nudges, spaced at least three days apart, with progressively different messaging. Nudges stop the moment the homeowner replies to any message — even if they haven't finished onboarding. If a homeowner never responds, they remain in the queue and can re-engage at any time.",
  },
  {
    question: 'How is data kept separate between different warranty companies?',
    answer:
      'Each warranty company gets its own dedicated phone number. Tendr routes every message to the right company automatically, so data isolation is enforced at the infrastructure layer. Warranty documents, conversation history, billing metrics, and user records are fully isolated per company and never shared.',
  },
  {
    question: "What happens if the AI can't answer a homeowner's question?",
    answer:
      "Tendr is designed to be honest about the limits of its knowledge. If a warranty question isn't covered by the retrieved document sections, Tendr tells the homeowner it doesn't have that information and suggests they contact support. It never fabricates coverage details.",
  },
  {
    question: 'Can Tendr handle homes with multiple HVAC units?',
    answer:
      "Yes. Tendr collects the number of cooling and heating units upfront, then asks for details (brand, age, last service date, filter date, and location label) for each unit individually. Reminders and task completions are tracked per unit, so a homeowner can confirm a filter change on the upstairs unit without affecting the downstairs unit's schedule.",
  },
]

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false)
  const buttonId = `faq-btn-${index}`
  const panelId = `faq-answer-${index}`

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        id={buttonId}
        className="w-full flex items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-slate-900 hover:text-brand-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 rounded-sm"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span>{question}</span>
        <ChevronIcon open={open} />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="pb-5 text-sm text-slate-600 leading-relaxed"
      >
        {answer}
      </div>
    </div>
  )
}

export default function FAQ() {
  return (
    <section
      id="faq"
      className="bg-white py-20 lg:py-28"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">FAQ</p>
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance"
          >
            Common questions
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Can&apos;t find what you&apos;re looking for?{' '}
            <a href="#contact" className="text-brand-600 hover:underline font-medium">
              Ask us directly.
            </a>
          </p>
        </div>

        {/* Accordion */}
        <div className="border border-slate-200 rounded-2xl px-6 divide-y divide-slate-200 overflow-hidden">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
