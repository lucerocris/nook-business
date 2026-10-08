"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/** Routes that follow the owner's theme choice. Everything else is light. */
export function isThemedPath(pathname: string | null) {
  return pathname === "/owner" || !!pathname?.startsWith("/owner/")
}

// Dark mode is for the signed-in owner portal only. The landing, auth and
// claim pages are designed light, so they force it: next-themes' inline
// script applies the forced theme before paint on a full load, and its effect
// swaps the class when a client-side navigation crosses into or out of /owner
// (login ends in a client transition to /owner/dashboard; sign-out goes back).
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="nook-owner-theme"
      forcedTheme={isThemedPath(pathname) ? undefined : "light"}
    >
      {children}
    </NextThemesProvider>
  )
}
