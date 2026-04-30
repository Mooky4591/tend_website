'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

function TendrLogo() {
  return (
    <Image src="/logo.png" alt="Tendr" width={120} height={40} priority />
  )
}

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

const FOCUSABLE_SELECTORS = 'a[href], button:not([disabled])'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Move focus to the first menu item when the menu opens
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      const first = mobileMenuRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTORS)
      first?.focus()
    }
  }, [mobileMenuOpen])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
    hamburgerRef.current?.focus()
  }, [])

  function handleMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      closeMobileMenu()
      return
    }

    if (e.key === 'Tab' && mobileMenuRef.current) {
      const focusable = Array.from(
        mobileMenuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        // Shift+Tab on first element → wrap to last
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        // Tab on last element → wrap to first
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm transition-shadow duration-200 ${
        scrolled ? 'shadow-sm border-b border-slate-200' : ''
      }`}
      role="banner"
    >
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
        aria-label="Main navigation"
      >
        <a href="#" aria-label="Tendr — go to homepage">
          <TendrLogo />
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8 list-none" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign in
          </a>
          <a
            href="#contact"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
          >
            Book a Demo
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={hamburgerRef}
          className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav
          id="mobile-menu"
          ref={mobileMenuRef}
          className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 flex flex-col gap-1"
          onKeyDown={handleMenuKeyDown}
          aria-label="Navigation menu"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              onClick={closeMobileMenu}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/login"
            className="py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            onClick={closeMobileMenu}
          >
            Sign in
          </a>
          <a
            href="#contact"
            className="mt-1 py-2.5 text-center rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
            onClick={closeMobileMenu}
          >
            Book a Demo
          </a>
        </nav>
      )}
    </header>
  )
}
