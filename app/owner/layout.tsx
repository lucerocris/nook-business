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
      {/* Upgrades a pre-approval JWT to one carrying the cafe_owner role, so
          the dashboard works without a manual reload and saves aren't silently
          rejected by RLS. Renders nothing. */}
      <SessionRoleSync />
      <SidebarProvider>
        <OwnerSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
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
