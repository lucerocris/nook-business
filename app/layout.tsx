import React from 'react'
import './styles/global.css'
import { NavbarGate } from './components/NavbarGate'
import { SupabaseProvider } from '@/lib/supabase/context'
import { Fraunces, Onest } from "next/font/google";
import { cn } from "@/lib/utils";

const onest = Onest({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Nook',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={cn("font-sans", onest.variable, fraunces.variable)}>
      <body>
        <SupabaseProvider>
          <NavbarGate />
          <main>{children}</main>
    
        </SupabaseProvider>
      </body>
    </html>
  )
}
