import React from 'react'
import './styles/global.css'
import { Navbar } from './components/Navbar'
import { SupabaseProvider } from './lib/supabase/context'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Nook',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          <Navbar />
          <main>{children}</main>
        </SupabaseProvider>
      </body>
    </html>
  )
}
