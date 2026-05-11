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
    <nav className="bg-white border-b border-border/20">
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
                    ? 'border-navy text-navy'
                    : 'border-transparent text-muted-foreground/60 hover:text-muted-foreground hover:border-border/30'
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
