"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowSquareOutIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { OwnerCafeContext } from "@/lib/queries/cafes"

const NOOK_INSTAGRAM = "https://instagram.com/nook_cafefinder"
const SUPPORT_URL = "https://privacy.nookph.app/support.html"

const PAGE_TITLES: Record<string, string> = {
  "/owner/dashboard": "Dashboard",
  "/owner/profile": "Edit listing",
  "/owner/photos": "Photos",
  "/owner/tags": "Tags",
  "/owner/menu": "Menu",
  "/owner/reviews": "Reviews",
  "/owner/preview": "Preview",
  "/owner/no-cafe": "Your café",
}

const LINK =
  "inline-flex min-h-9 items-center rounded-md px-1 text-[13px] text-muted-foreground outline-hidden transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"

export function OwnerHeader({ cafe }: { cafe: OwnerCafeContext | null }) {
  const pathname = usePathname()
  const match = Object.keys(PAGE_TITLES).find(
    (url) => pathname === url || pathname.startsWith(url + "/")
  )
  const page = match ? PAGE_TITLES[match] : null

  return (
    // Sticky on mobile: the drawer trigger is the only way back to navigation
    // there, and on long pages it scrolled out of reach.
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:static md:px-6">
      {/* 44px touch target on mobile; the shared trigger defaults to 32px. */}
      <SidebarTrigger className="-ml-1 size-11 md:-ml-2 md:size-8" />
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-1.5 text-[13px]">
          {cafe ? (
            <li className="hidden min-w-0 items-center gap-1.5 sm:flex">
              <Link
                href="/owner/dashboard"
                className="truncate text-muted-foreground outline-hidden hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {cafe.cafeName}
              </Link>
              <span aria-hidden className="text-muted-foreground/60">
                /
              </span>
            </li>
          ) : (
            <li className="hidden items-center gap-1.5 text-muted-foreground sm:flex">
              Account
              <span aria-hidden className="text-muted-foreground/60">
                /
              </span>
            </li>
          )}
          {page && (
            <li aria-current="page" className="truncate font-medium text-foreground">
              {page}
            </li>
          )}
        </ol>
      </nav>
      <div className="flex shrink-0 items-center gap-3 md:gap-5">
        <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
          Help
        </a>
        <a href={NOOK_INSTAGRAM} target="_blank" rel="noopener noreferrer" className={LINK}>
          Message Nook
        </a>
        {cafe?.status === "active" && (
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a
              href={`https://www.nookph.app/cafes/${cafe.cafeId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Nook
              <ArrowSquareOutIcon aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </Button>
        )}
      </div>
    </header>
  )
}
