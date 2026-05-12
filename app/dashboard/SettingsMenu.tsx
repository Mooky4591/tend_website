'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors"
      >
        Settings
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-44 bg-white border border-border/20 rounded-lg shadow-lg py-1 z-10"
        >
          <Link
            href="/dashboard/settings/change-password"
            role="menuitem"
            className="block px-4 py-2 text-sm text-foreground hover:bg-slate-50 transition-colors"
            onClick={() => setOpen(false)}
          >
            Change password
          </Link>
        </div>
      )}
    </div>
  )
}
