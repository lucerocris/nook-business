import React from 'react'
import './styles/global.css'
import { NavbarGate } from './components/NavbarGate'
import { SupabaseProvider } from '@/lib/supabase/context'
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Nook',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body>
        <SupabaseProvider>
          <NavbarGate />
          <main>{children}</main>
        </SupabaseProvider>
      </body>
    </html>
  )
}
