import type { Metadata } from "next"
import "@/app/globals.css"
import { OwnerSidebar } from "@/components/owner/sidebar"
import { SessionRoleSync } from "@/components/owner/session-role-sync"
import { OwnerHeader } from "@/components/owner/header"
import { TooltipProvider } from "@/components/ui/tooltip"
import { createClient } from "@/lib/supabase/server"
import { getOwnerCafeContextByOwnerUserId } from "@/lib/queries/cafes"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: {
    template: "%s | Nook",
    default: "Nook",
  },
}

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Middleware has already gated /owner on a signed-in owner. The cafe can still
  // be missing (this layout also wraps /owner/no-cafe), so the sidebar takes a
  // nullable cafe instead of redirecting from here.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const cafe = user ? await getOwnerCafeContextByOwnerUserId(user.id) : null
  // With no café linked, the sidebar says whether a claim is still in review
  // (pages unlock on approval) or nothing is pending at all. RLS scopes
  // cafe_claims to the caller's own rows.
  let claimInReview = false
  if (user && !cafe) {
    const { count } = await supabase
      .from("cafe_claims")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "under_review"])
    claimInReview = (count ?? 0) > 0
  }
  const account = {
    name: (user?.user_metadata?.full_name as string | undefined) ?? null,
    email: user?.email ?? null,
  }

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
        <OwnerSidebar cafe={cafe} account={account} claimInReview={claimInReview} />
        <SidebarInset>
          <OwnerHeader cafe={cafe} />
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
