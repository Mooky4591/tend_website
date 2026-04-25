// PLACEHOLDER: Replace all placeholder hrefs (#) with actual page/policy URLs

const productLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

const companyLinks = [
  // PLACEHOLDER: Add real About, Blog, Careers pages as you build them
  { label: 'About', href: '#' },
  { label: 'Contact', href: '#contact' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: 'https://app.termly.io/policy-viewer/policy.html?policyUUID=6807f094-d6d5-4171-a4d9-1aafa1eebeb8' },
  // PLACEHOLDER: Replace with a stable hosted URL (e.g. Termly) — Google Docs published links can break if the doc is unpublished or moved
  { label: 'Terms of Service', href: 'https://docs.google.com/document/d/e/2PACX-1vR0r80pzdX_Rl9l0hqtbGXwU0agJad8lgfU0r24Wht6tOpIebwzi8Q9XSBsN0h1_M0HDABfY4sIKgb2/pub' },
]

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            {/* PLACEHOLDER: Replace with real logo */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-brand-600 rounded-md flex items-center justify-center" aria-hidden="true">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Tend</span>
            </div>
            <p className="text-sm leading-relaxed">
              AI-powered home care, delivered over SMS. No app required.
            </p>
          </div>

          {/* Product */}
          <nav aria-label="Product links">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-2.5 list-none">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company links">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 list-none">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal links">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5 list-none">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            {/* PLACEHOLDER: Update company name if different from "Tend" */}
            &copy; {new Date().getFullYear()} Tend. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            {/* PLACEHOLDER: Update contact email */}
            hello@tend.ai
          </p>
        </div>
      </div>
    </footer>
  )
}
