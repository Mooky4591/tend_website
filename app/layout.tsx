import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tend — AI Home Assistant Platform',
  description:
    'Give your homeowners an AI home assistant delivered entirely over SMS. Proactive maintenance reminders, instant warranty answers, and conversational onboarding — no app required.',
  openGraph: {
    title: 'Tend — AI Home Assistant Platform',
    description:
      'Give your homeowners an AI home assistant delivered entirely over SMS. No app required.',
    type: 'website',
    // PLACEHOLDER: Replace with a real 1200×630 OG image before launch
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Tend — AI Home Assistant Platform' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
