"use client"

import { MoonIcon, SunIcon } from "@phosphor-icons/react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

// Both icons are always rendered and swapped with the dark: variant. The
// theme is only known on the client, so picking one icon in JS would either
// mismatch on hydration or need a mounted check that flashes the wrong icon.
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle dark mode"
      className={cn(
        "inline-flex shrink-0 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
        className
      )}
    >
      <SunIcon aria-hidden="true" className="hidden size-5 dark:block" />
      <MoonIcon aria-hidden="true" className="size-5 dark:hidden" />
    </button>
  )
}
