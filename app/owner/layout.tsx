import type { Metadata } from "next"
import "@/app/globals.css"
import { OwnerSidebar } from "@/components/owner/sidebar"
import { SessionRoleSync } from "@/components/owner/session-role-sync"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: {
    template: "%s | Nook",
    default: "Nook",
  },
}

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      {/* The marketing navbar is rendered by the root layout and hidden by
          NavbarGate based on usePathname(). Logging in ends in a Server Action
          redirect, which is a client-side transition: the root layout is shared
          with /login so it never re-renders, and the navbar could stay on screen
          until a manual reload. It is position:fixed at z-index 1001, so it
          floats over the dashboard.

          Scoping the rule to this layout makes the owner shell authoritative —
          while any /owner route is mounted the navbar is hidden, regardless of
          how the route was reached, and it comes back automatically on exit. */}
      <style>{`.navbar, .mobile-menu-wrapper { display: none !important; }`}</style>

      {/* Upgrades a pre-approval JWT to one carrying the cafe_owner role, so
          the dashboard works without a manual reload and saves aren't silently
          rejected by RLS. Renders nothing. */}
      <SessionRoleSync />
      <SidebarProvider>
        <OwnerSidebar />
        <SidebarInset>
          {/* Sticky on mobile: the drawer trigger is the only way back to
              navigation there, and on long pages (menu, reviews) it scrolled
              out of reach and forced a trip back to the top. */}
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 md:static">
            {/* Sized to the 44px touch minimum on mobile; the shared trigger
                defaults to a 32px pointer-sized target. */}
            <SidebarTrigger className="-ml-1 size-11 md:size-8" />
            <span className="text-sm font-semibold md:hidden">Nook</span>
          </header>
          {/* min-w-0 + overflow-x-hidden: without these, any over-wide
              descendant widens the document and scrolls the whole page
              sideways instead of being contained. */}
          <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
