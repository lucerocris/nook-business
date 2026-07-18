import React from 'react'
import './styles/global.css'

import { NavbarGate } from './components/NavbarGate'
import { SupabaseProvider } from '@/lib/supabase/context'
import { createClient } from '@/lib/supabase/server'

import { Poppins } from 'next/font/google'
import { cn } from '@/lib/utils'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
})

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: {
    default: 'Nook',
    template: '%s - Nook',
  },
  icons: {
    icon: '/nookGlasses.svg',
    shortcut: '/nookGlasses.svg',
    apple: '/nookGlasses.svg',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html
      lang="en"
      className={cn(
        'font-sans',
        poppins.variable
      )}
    >
      <body>
        <SupabaseProvider>
          <NavbarGate initialUser={user} />
          <main>{children}</main>
        </SupabaseProvider>
      </body>
    </html>
  )
}