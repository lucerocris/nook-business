import React from 'react'
import './styles/global.css'

import { NavbarGate } from './components/NavbarGate'
import { SupabaseProvider } from '@/lib/supabase/context'
import { Toaster } from '@/components/ui/sonner'
import { createClient } from '@/lib/supabase/server'

import { Poppins } from 'next/font/google'
import { cn } from '@/lib/utils'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://business.nookph.app'

export const metadata = {
  // metadataBase is required for OG/Twitter image URLs to resolve absolutely.
  metadataBase: new URL(siteUrl),
  description:
    'Nook for Business — claim and manage your cafe listing on Nook.',
  title: {
    default: 'Nook for Business',
    template: '%s - Nook',
  },
  icons: {
    icon: '/nookGlasses.svg',
    shortcut: '/nookGlasses.svg',
    apple: '/nookGlasses.svg',
  },
  // Owners are sent here from Instagram DMs, so the link preview is the first
  // thing most of them see. Without these it unfurled as a bare URL.
  openGraph: {
    type: 'website',
    siteName: 'Nook for Business',
    title: 'Nook for Business',
    description:
      'Claim your cafe on Nook and manage your listing — photos, menu, hours, and reviews.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nook for Business',
    description:
      'Claim your cafe on Nook and manage your listing — photos, menu, hours, and reviews.',
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
          {/* Every toast.* call in the app was a no-op until this was mounted:
              the Toaster component existed but was never rendered, so owners
              got no confirmation or error feedback on any mutation. */}
          <Toaster position="top-center" richColors closeButton />
        </SupabaseProvider>
      </body>
    </html>
  )
}