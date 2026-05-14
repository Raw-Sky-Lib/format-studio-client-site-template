'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import type { NavItem } from '@/types/content'

interface MobileNavProps {
  items: NavItem[]
}

export default function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="p-2 text-[var(--color-text)]"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-6 shadow-sm">
          <nav className="flex flex-col gap-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                target={item.is_external ? '_blank' : undefined}
                rel={item.is_external ? 'noopener noreferrer' : undefined}
                onClick={() => setOpen(false)}
                className="text-base text-[var(--color-text)] transition-colors hover:text-[var(--color-text-muted)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
