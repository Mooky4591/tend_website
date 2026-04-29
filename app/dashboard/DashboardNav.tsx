'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Users', href: '/dashboard/users' },
  { label: 'Billing', href: '/dashboard/billing' },
  { label: 'Warranty Docs', href: '/dashboard/docs' },
]

export default function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1">
          {tabs.map(({ label, href }) => {
            const active =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
