'use client'

import { usePathname } from 'next/navigation'

import { Navbar } from './Navbar'

const HIDDEN_PREFIXES = ['/owner']

export function NavbarGate() {
  const pathname = usePathname() || ''
  const hideNavbar = HIDDEN_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (hideNavbar) {
    return null
  }

  return <Navbar />
}
