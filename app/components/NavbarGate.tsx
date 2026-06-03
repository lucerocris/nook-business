'use client'

import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import { Navbar } from './Navbar'

const HIDDEN_PREFIXES = ['/owner']

type NavbarGateProps = {
  initialUser: User | null
}

export function NavbarGate({ initialUser }: NavbarGateProps) {
  const pathname = usePathname() || ''

  const hideNavbar = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (hideNavbar) {
    return null
  }

  return <Navbar initialUser={initialUser} />
}